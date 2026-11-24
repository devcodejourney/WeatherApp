import type {
  AlertPreferences,
  CurrentWeather,
  DailyForecast,
  ForecastSlot,
  HumidityComfortLevel,
  HumidityMetrics,
  TempUnit,
  WeatherAlert,
} from '../types/weather';

export function convertTemp(celsius: number, unit: TempUnit): number {
  if (unit === 'c') return Math.round(celsius);
  return Math.round((celsius * 9) / 5 + 32);
}

export function formatTemp(celsius: number, unit: TempUnit, includeUnit = true): string {
  const val = convertTemp(celsius, unit);
  if (!includeUnit) return `${val}°`;
  return `${val}°${unit === 'c' ? 'C' : 'F'}`;
}

export function formatWindSpeed(kmh: number, unit: TempUnit): string {
  if (unit === 'c') return `${Math.round(kmh)} km/h`;
  const mph = Math.round(kmh * 0.621371);
  return `${mph} mph`;
}

export function formatLocalTime(unixTs: number, timezoneOffset: number): string {
  const date = new Date((unixTs + timezoneOffset) * 1000);
  const h = String(date.getUTCHours()).padStart(2, '0');
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatCompassDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
  return dirs[idx];
}

/**
 * Magnus-Tetens formula for dew point temperature in Celsius.
 */
export function calculateDewPointC(tempC: number, relativeHumidity: number): number {
  const rh = Math.max(1, Math.min(100, relativeHumidity));
  const a = 17.625;
  const b = 243.04;
  const gamma = Math.log(rh / 100) + (a * tempC) / (b + tempC);
  const dewPoint = (b * gamma) / (a - gamma);
  return Math.round(dewPoint * 10) / 10;
}

/**
 * Steadman / Rothfusz heat index regression in Celsius.
 * Returns dry-bulb temperature when below 26.7°C or low humidity.
 */
export function calculateHeatIndexC(tempC: number, relativeHumidity: number): number {
  const rh = Math.max(0, Math.min(100, relativeHumidity));
  const tempF = (tempC * 9) / 5 + 32;

  if (tempF < 80) {
    // Simple Steadman approximation for milder temperatures
    const simpleF = 0.5 * (tempF + 61.0 + (tempF - 68.0) * 1.2 + rh * 0.094);
    if (simpleF < 80) {
      return Math.round((((simpleF - 32) * 5) / 9) * 10) / 10;
    }
  }

  const hiF =
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * rh -
    0.22475541 * tempF * rh -
    0.00683783 * tempF * tempF -
    0.05481717 * rh * rh +
    0.00122874 * tempF * tempF * rh +
    0.00085282 * tempF * rh * rh -
    0.00000199 * tempF * tempF * rh * rh;

  return Math.round((((hiF - 32) * 5) / 9) * 10) / 10;
}

/**
 * Saturation & actual water vapor pressure in hPa.
 */
export function calculateVaporPressureHpa(tempC: number, relativeHumidity: number): number {
  const rh = Math.max(0, Math.min(100, relativeHumidity));
  const satVaporPressure = 6.112 * Math.exp((17.67 * tempC) / (tempC + 243.5));
  return Math.round(((satVaporPressure * rh) / 100) * 10) / 10;
}

export function classifyHumidityIndex(tempC: number, relativeHumidity: number): HumidityMetrics {
  const rh = Math.max(0, Math.min(100, Math.round(relativeHumidity)));
  const dewPointC = calculateDewPointC(tempC, rh);
  const heatIndexC = calculateHeatIndexC(tempC, rh);
  const vaporPressureHpa = calculateVaporPressureHpa(tempC, rh);

  let comfortLevel: HumidityComfortLevel;
  let advisoryText: string;

  if (dewPointC < 10 && rh < 35) {
    comfortLevel = 'Dry';
    advisoryText = 'Low atmospheric moisture. Hydration and indoor humidification advised.';
  } else if (dewPointC < 16) {
    comfortLevel = 'Comfortable';
    advisoryText = 'Balanced dew point and evaporative cooling across outdoor conditions.';
  } else if (dewPointC < 20) {
    comfortLevel = 'Humid';
    advisoryText = 'Noticeable moisture in the air; moderate perspiration during exertion.';
  } else if (dewPointC < 24) {
    comfortLevel = 'Muggy';
    advisoryText = 'High dew point reduces evaporative cooling. Limit peak afternoon exertion.';
  } else {
    comfortLevel = 'Oppressive';
    advisoryText = 'Severe atmospheric moisture load. Heat stress risk elevated outdoors.';
  }

  // Normalize moisture index score 0..100 anchored to dew point (-5°C -> 0, 28°C -> 100)
  const indexScore = Math.max(0, Math.min(100, Math.round(((dewPointC + 5) / 33) * 100)));

  return {
    relativeHumidity: rh,
    dewPointC,
    heatIndexC,
    vaporPressureHpa,
    comfortLevel,
    advisoryText,
    indexScore,
  };
}

export interface RawForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number; // m/s from OpenWeatherMap metric API
  };
  pop?: number;
  weather: Array<{
    main: string;
    description: string;
  }>;
}

export function buildDailyForecasts(
  list: RawForecastItem[],
  timezoneOffset: number,
  windIsAlreadyKmh = false
): { hourlySlots: ForecastSlot[]; dailyForecast: DailyForecast[] } {
  const slots: ForecastSlot[] = list.map((item) => {
    const tempC = item.main.temp;
    const humidity = item.main.humidity;
    const windSpeedKmh = windIsAlreadyKmh
      ? Math.round(item.wind.speed)
      : Math.round(item.wind.speed * 3.6);

    return {
      dt: item.dt,
      timeLabel: formatLocalTime(item.dt, timezoneOffset),
      tempC,
      feelsLikeC: item.main.feels_like,
      humidity,
      pressure: item.main.pressure,
      windSpeedKmh,
      pop: Math.round((item.pop ?? 0) * 100),
      conditionMain: item.weather[0]?.main || 'Clear',
      description: item.weather[0]?.description || '',
      dewPointC: calculateDewPointC(tempC, humidity),
      heatIndexC: calculateHeatIndexC(tempC, humidity),
    };
  });

  const grouped = new Map<string, ForecastSlot[]>();
  for (const slot of slots) {
    const localDate = new Date((slot.dt + timezoneOffset) * 1000);
    const key = localDate.toISOString().slice(0, 10);
    const bucket = grouped.get(key) ?? [];
    bucket.push(slot);
    grouped.set(key, bucket);
  }

  const dailyForecast: DailyForecast[] = Array.from(grouped.entries())
    .slice(0, 5)
    .map(([dateKey, daySlots], idx) => {
      const temps = daySlots.map((s) => s.tempC);
      const tempMinC = Math.min(...temps);
      const tempMaxC = Math.max(...temps);
      const avgHumidity = Math.round(
        daySlots.reduce((acc, s) => acc + s.humidity, 0) / daySlots.length
      );
      const avgDewPointC =
        Math.round(
          (daySlots.reduce((acc, s) => acc + s.dewPointC, 0) / daySlots.length) * 10
        ) / 10;
      const maxWindKmh = Math.max(...daySlots.map((s) => s.windSpeedKmh));
      const maxPop = Math.max(...daySlots.map((s) => s.pop));
      const pressure = Math.round(
        daySlots.reduce((acc, s) => acc + s.pressure, 0) / daySlots.length
      );

      // Pick representative midday slot for primary condition icon/description
      const repSlot = daySlots.reduce((best, curr) => {
        const currHr = new Date((curr.dt + timezoneOffset) * 1000).getUTCHours();
        const bestHr = new Date((best.dt + timezoneOffset) * 1000).getUTCHours();
        return Math.abs(currHr - 12) < Math.abs(bestHr - 12) ? curr : best;
      }, daySlots[0]);

      const dateObj = new Date(`${dateKey}T12:00:00Z`);
      const dayLabel =
        idx === 0
          ? 'Today'
          : dateObj.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
      const fullDateLabel = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      });

      return {
        dateKey,
        dayLabel,
        fullDateLabel,
        tempMinC,
        tempMaxC,
        avgHumidity,
        avgDewPointC,
        maxWindKmh,
        maxPop,
        pressure,
        conditionMain: repSlot.conditionMain,
        description: repSlot.description,
        slots: daySlots,
      };
    });

  return {
    hourlySlots: slots.slice(0, 8),
    dailyForecast,
  };
}

export function evaluateSevereAlerts(
  current: CurrentWeather,
  daily: DailyForecast[],
  prefs: AlertPreferences,
  unit: TempUnit = 'c'
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const timestamp = current.lastUpdatedIso;
  const upcomingMaxPop = daily.slice(0, 2).reduce((m, d) => Math.max(m, d.maxPop), 0);
  const stormDetected =
    ['Thunderstorm', 'Squall', 'Tornado'].includes(current.conditionMain) ||
    daily.slice(0, 2).some((d) =>
      d.slots.some((s) => ['Thunderstorm', 'Squall', 'Tornado'].includes(s.conditionMain))
    );

  if (prefs.severeStorms && stormDetected) {
    alerts.push({
      id: `storm-${current.city.toLowerCase()}`,
      severity: 'warning',
      title: 'Severe Convective Storm Warning',
      description: `Thunderstorm activity detected in the current or 48-hour forecast window for ${current.city}. Secure outdoor items and monitor radar updates.`,
      metricLabel: current.conditionMain,
      thresholdLabel: 'Storm activity',
      timestamp,
      city: current.city,
    });
  }

  if (current.windSpeedKmh >= prefs.highWindThresholdKmh) {
    const windStr = formatWindSpeed(current.windSpeedKmh, unit);
    const threshStr = formatWindSpeed(prefs.highWindThresholdKmh, unit);
    alerts.push({
      id: `wind-${current.city.toLowerCase()}`,
      severity: current.windSpeedKmh >= prefs.highWindThresholdKmh + 15 ? 'warning' : 'watch',
      title: 'High Wind Advisory',
      description: `Sustained wind speeds have reached ${windStr}, exceeding your ${threshStr} threshold.`,
      metricLabel: windStr,
      thresholdLabel: `>= ${threshStr}`,
      timestamp,
      city: current.city,
    });
  }

  const heatIndexC = calculateHeatIndexC(current.tempC, current.humidity);
  if (heatIndexC >= prefs.highHeatThresholdC) {
    const hiStr = formatTemp(heatIndexC, unit);
    const ambStr = formatTemp(current.tempC, unit);
    const threshTempStr = formatTemp(prefs.highHeatThresholdC, unit);
    alerts.push({
      id: `heat-${current.city.toLowerCase()}`,
      severity: heatIndexC >= prefs.highHeatThresholdC + 4 ? 'warning' : 'watch',
      title: 'Excessive Heat Index Alert',
      description: `Apparent heat index is ${hiStr} due to combined ambient temperature (${ambStr}) and moisture load.`,
      metricLabel: `${hiStr} Heat Index`,
      thresholdLabel: `>= ${threshTempStr}`,
      timestamp,
      city: current.city,
    });
  }

  if (current.humidity >= prefs.highHumidityThreshold) {
    const dewStr = formatTemp(calculateDewPointC(current.tempC, current.humidity), unit);
    alerts.push({
      id: `humidity-${current.city.toLowerCase()}`,
      severity: current.humidity >= 88 ? 'watch' : 'advisory',
      title: 'Elevated Humidity Index Advisory',
      description: `Relative humidity is at ${current.humidity}% (dew point ${dewStr}), above your ${prefs.highHumidityThreshold}% alert threshold.`,
      metricLabel: `${current.humidity}% RH`,
      thresholdLabel: `>= ${prefs.highHumidityThreshold}%`,
      timestamp,
      city: current.city,
    });
  }

  if (prefs.severeStorms && upcomingMaxPop >= 80 && !stormDetected) {
    alerts.push({
      id: `rain-${current.city.toLowerCase()}`,
      severity: 'advisory',
      title: 'Heavy Precipitation Watch',
      description: `Precipitation probability peaks at ${upcomingMaxPop}% over the next 48 hours in ${current.city}.`,
      metricLabel: `${upcomingMaxPop}% Precip`,
      thresholdLabel: '>= 80% chance',
      timestamp,
      city: current.city,
    });
  }

  return alerts;
}

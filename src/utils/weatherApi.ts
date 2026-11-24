import type {
  AlertPreferences,
  CurrentWeather,
  DataSourceMode,
  WeatherBundle,
  WeatherConditionMain,
} from '../types/weather';
import {
  buildDailyForecasts,
  classifyHumidityIndex,
  evaluateSevereAlerts,
  type RawForecastItem,
} from './weatherCalculations';

const CACHE_PREFIX = 'weather_pwa_cache_v1:';

export class WeatherApiError extends Error {
  code: 'CITY_NOT_FOUND' | 'NETWORK_ERROR';

  constructor(code: 'CITY_NOT_FOUND' | 'NETWORK_ERROR', message: string) {
    super(message);
    this.code = code;
  }
}

function mapWmoCode(code: number): { main: WeatherConditionMain; description: string } {
  if (code === 0) return { main: 'Clear', description: 'clear sky' };
  if (code === 1) return { main: 'Clouds', description: 'mainly clear' };
  if (code === 2) return { main: 'Clouds', description: 'partly cloudy' };
  if (code === 3) return { main: 'Clouds', description: 'overcast clouds' };
  if (code === 45 || code === 48) return { main: 'Fog', description: 'mist and fog' };
  if (code >= 51 && code <= 57) return { main: 'Drizzle', description: 'light drizzle' };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return { main: 'Rain', description: code >= 65 || code === 82 ? 'heavy rain' : 'moderate rain' };
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return { main: 'Snow', description: 'snowfall' };
  }
  if (code >= 95) return { main: 'Thunderstorm', description: 'thunderstorm activity' };
  return { main: 'Clouds', description: 'variable clouds' };
}

function saveCityCache(cityKey: string, bundle: Omit<WeatherBundle, 'alerts' | 'source'>) {
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${cityKey.toLowerCase()}`,
      JSON.stringify(bundle)
    );
  } catch {
    // Ignore storage quota errors
  }
}

function readCityCache(cityKey: string): Omit<WeatherBundle, 'alerts' | 'source'> | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${cityKey.toLowerCase()}`);
    if (!raw) return null;
    return JSON.parse(raw) as Omit<WeatherBundle, 'alerts' | 'source'>;
  } catch {
    return null;
  }
}

const OFFLINE_SEED_CITIES: Record<
  string,
  {
    name: string;
    country: string;
    lat: number;
    lon: number;
    tzOffset: number;
    tempC: number;
    humidity: number;
    windKmh: number;
    pressure: number;
    condition: WeatherConditionMain;
    description: string;
  }
> = {
  dhaka: {
    name: 'Dhaka',
    country: 'BD',
    lat: 23.8103,
    lon: 90.4125,
    tzOffset: 21600,
    tempC: 29.4,
    humidity: 78,
    windKmh: 14,
    pressure: 1009,
    condition: 'Clouds',
    description: 'humid partly cloudy',
  },
  london: {
    name: 'London',
    country: 'GB',
    lat: 51.5072,
    lon: -0.1276,
    tzOffset: 0,
    tempC: 11.8,
    humidity: 81,
    windKmh: 22,
    pressure: 1014,
    condition: 'Rain',
    description: 'light rain showers',
  },
  'new york': {
    name: 'New York',
    country: 'US',
    lat: 40.7128,
    lon: -74.006,
    tzOffset: -18000,
    tempC: 14.2,
    humidity: 58,
    windKmh: 19,
    pressure: 1018,
    condition: 'Clear',
    description: 'crisp clear sky',
  },
  tokyo: {
    name: 'Tokyo',
    country: 'JP',
    lat: 35.6762,
    lon: 139.6503,
    tzOffset: 32400,
    tempC: 17.5,
    humidity: 64,
    windKmh: 16,
    pressure: 1016,
    condition: 'Clouds',
    description: 'scattered clouds',
  },
  singapore: {
    name: 'Singapore',
    country: 'SG',
    lat: 1.3521,
    lon: 103.8198,
    tzOffset: 28800,
    tempC: 31.2,
    humidity: 84,
    windKmh: 18,
    pressure: 1008,
    condition: 'Thunderstorm',
    description: 'tropical thunderstorm',
  },
  miami: {
    name: 'Miami',
    country: 'US',
    lat: 25.7617,
    lon: -80.1918,
    tzOffset: -18000,
    tempC: 28.6,
    humidity: 82,
    windKmh: 26,
    pressure: 1011,
    condition: 'Rain',
    description: 'coastal rain squall',
  },
};

function buildSeedWeather(
  cityKey: string,
  prefs: AlertPreferences
): WeatherBundle | null {
  const seed = OFFLINE_SEED_CITIES[cityKey.toLowerCase().trim()];
  if (!seed) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  const dayStart = nowSec - (nowSec % 86400);
  const current: CurrentWeather = {
    city: seed.name,
    country: seed.country,
    lat: seed.lat,
    lon: seed.lon,
    tempC: seed.tempC,
    feelsLikeC: seed.tempC + (seed.humidity > 75 ? 3.4 : 0.4),
    tempMinC: seed.tempC - 3.2,
    tempMaxC: seed.tempC + 2.5,
    humidity: seed.humidity,
    pressure: seed.pressure,
    windSpeedKmh: seed.windKmh,
    windDeg: 145,
    clouds: seed.condition === 'Clear' ? 10 : 68,
    visibilityKm: seed.condition === 'Rain' || seed.condition === 'Thunderstorm' ? 7.5 : 10,
    conditionMain: seed.condition,
    description: seed.description,
    sunrise: dayStart + 6 * 3600 - seed.tzOffset,
    sunset: dayStart + 17 * 3600 + 45 * 60 - seed.tzOffset,
    timezoneOffset: seed.tzOffset,
    dt: nowSec,
    lastUpdatedIso: new Date().toISOString(),
  };

  const rawSlots: RawForecastItem[] = [];
  for (let i = 0; i < 40; i++) {
    const dt = nowSec + i * 3 * 3600;
    const diurnal = Math.sin(((i % 8) / 8) * Math.PI * 2 - Math.PI / 2) * 3.1;
    const temp = Math.round((seed.tempC + diurnal) * 10) / 10;
    const hum = Math.max(35, Math.min(96, Math.round(seed.humidity - diurnal * 2.2)));
    const isStormDay = i >= 8 && i <= 14 && seed.humidity >= 75;
    rawSlots.push({
      dt,
      main: {
        temp,
        feels_like: temp + (hum > 75 ? 2.5 : 0),
        temp_min: temp - 1,
        temp_max: temp + 1,
        humidity: hum,
        pressure: seed.pressure - (isStormDay ? 4 : 0),
      },
      wind: { speed: seed.windKmh + (isStormDay ? 14 : (i % 4) * 2) },
      pop: isStormDay ? 0.85 : seed.condition === 'Rain' ? 0.65 : 0.15,
      weather: [
        {
          main: isStormDay ? 'Thunderstorm' : seed.condition,
          description: isStormDay ? 'evening thunderstorm' : seed.description,
        },
      ],
    });
  }

  const { hourlySlots, dailyForecast } = buildDailyForecasts(rawSlots, seed.tzOffset, true);
  const humidityMetrics = classifyHumidityIndex(current.tempC, current.humidity);
  const alerts = evaluateSevereAlerts(current, dailyForecast, prefs);

  return {
    current,
    hourlySlots,
    dailyForecast,
    humidityMetrics,
    alerts,
    source: 'fallback',
  };
}

async function fetchWithTimeout(url: string, timeoutMs = 6500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFromOpenMeteo(
  query: string,
  prefs: AlertPreferences
): Promise<WeatherBundle> {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query.trim()
  )}&count=1&language=en&format=json`;
  const geoRes = await fetchWithTimeout(geoUrl);
  if (!geoRes.ok) {
    throw new WeatherApiError('NETWORK_ERROR', 'Unable to reach geocoding service.');
  }
  const geoData = (await geoRes.json()) as {
    results?: Array<{
      name: string;
      country_code?: string;
      latitude: number;
      longitude: number;
      utc_offset_seconds?: number;
    }>;
  };

  const place = geoData.results?.[0];
  if (!place) {
    throw new WeatherApiError('CITY_NOT_FOUND', `City "${query}" not found. Try another name.`);
  }

  return fetchOpenMeteoByCoords(
    place.latitude,
    place.longitude,
    place.name,
    place.country_code || '',
    prefs
  );
}

export async function fetchOpenMeteoByCoords(
  lat: number,
  lon: number,
  cityName: string,
  countryCode: string,
  prefs: AlertPreferences
): Promise<WeatherBundle> {
  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m` +
    `&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,surface_pressure,wind_speed_10m` +
    `&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min` +
    `&wind_speed_unit=kmh&timeformat=unixtime&timezone=auto&forecast_days=6`;

  const res = await fetchWithTimeout(forecastUrl);
  if (!res.ok) {
    throw new WeatherApiError('NETWORK_ERROR', 'Unable to load live weather forecast.');
  }

  const data = (await res.json()) as {
    utc_offset_seconds: number;
    current: {
      time: number;
      temperature_2m: number;
      relative_humidity_2m: number;
      apparent_temperature: number;
      weather_code: number;
      cloud_cover: number;
      surface_pressure: number;
      wind_speed_10m: number;
      wind_direction_10m: number;
    };
    hourly: {
      time: number[];
      temperature_2m: number[];
      relative_humidity_2m: number[];
      apparent_temperature: number[];
      precipitation_probability: number[];
      weather_code: number[];
      surface_pressure: number[];
      wind_speed_10m: number[];
    };
    daily: {
      sunrise: number[];
      sunset: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
    };
  };

  const tzOffset = data.utc_offset_seconds ?? 0;
  const cond = mapWmoCode(data.current.weather_code);
  const current: CurrentWeather = {
    city: cityName,
    country: countryCode,
    lat,
    lon,
    tempC: data.current.temperature_2m,
    feelsLikeC: data.current.apparent_temperature,
    tempMinC: data.daily.temperature_2m_min[0] ?? data.current.temperature_2m - 2,
    tempMaxC: data.daily.temperature_2m_max[0] ?? data.current.temperature_2m + 2,
    humidity: data.current.relative_humidity_2m,
    pressure: Math.round(data.current.surface_pressure),
    windSpeedKmh: Math.round(data.current.wind_speed_10m),
    windDeg: data.current.wind_direction_10m,
    clouds: data.current.cloud_cover,
    visibilityKm: cond.main === 'Fog' ? 2.5 : cond.main === 'Rain' ? 8.0 : 10.0,
    conditionMain: cond.main,
    description: cond.description,
    sunrise: data.daily.sunrise[0] ?? data.current.time,
    sunset: data.daily.sunset[0] ?? data.current.time + 43200,
    timezoneOffset: tzOffset,
    dt: data.current.time,
    lastUpdatedIso: new Date().toISOString(),
  };

  // Sample 3-hour intervals starting from current hour for crisp 5-day breakdown
  const rawSlots: RawForecastItem[] = [];
  const nowSec = data.current.time;
  for (let i = 0; i < data.hourly.time.length; i += 3) {
    const t = data.hourly.time[i];
    if (t < nowSec - 3600) continue;
    const c = mapWmoCode(data.hourly.weather_code[i] ?? 0);
    rawSlots.push({
      dt: t,
      main: {
        temp: data.hourly.temperature_2m[i],
        feels_like: data.hourly.apparent_temperature[i],
        temp_min: data.hourly.temperature_2m[i],
        temp_max: data.hourly.temperature_2m[i],
        humidity: data.hourly.relative_humidity_2m[i],
        pressure: Math.round(data.hourly.surface_pressure[i] ?? current.pressure),
      },
      wind: { speed: data.hourly.wind_speed_10m[i] ?? 0 },
      pop: (data.hourly.precipitation_probability[i] ?? 0) / 100,
      weather: [{ main: c.main, description: c.description }],
    });
  }

  const { hourlySlots, dailyForecast } = buildDailyForecasts(rawSlots, tzOffset, true);
  const humidityMetrics = classifyHumidityIndex(current.tempC, current.humidity);
  const alerts = evaluateSevereAlerts(current, dailyForecast, prefs);

  saveCityCache(cityName, {
    current,
    hourlySlots,
    dailyForecast,
    humidityMetrics,
  });

  return {
    current,
    hourlySlots,
    dailyForecast,
    humidityMetrics,
    alerts,
    source: 'live',
  };
}

export async function fetchWeatherForCity(
  city: string,
  prefs: AlertPreferences
): Promise<WeatherBundle> {
  const cleanCity = city.trim();
  if (!cleanCity) {
    throw new WeatherApiError('CITY_NOT_FOUND', 'Please enter a city name.');
  }

  try {
    return await fetchFromOpenMeteo(cleanCity, prefs);
  } catch (err) {
    if (err instanceof WeatherApiError && err.code === 'CITY_NOT_FOUND') {
      throw err;
    }

    // Network/offline fallback: check localStorage cache first
    const cached = readCityCache(cleanCity);
    if (cached) {
      const source: DataSourceMode = 'cached';
      return {
        ...cached,
        alerts: evaluateSevereAlerts(cached.current, cached.dailyForecast, prefs),
        source,
      };
    }

    // Deterministic offline seed fallback for well-known cities if offline on initial visit
    const seeded = buildSeedWeather(cleanCity, prefs);
    if (seeded) {
      return seeded;
    }

    throw new WeatherApiError(
      'NETWORK_ERROR',
      typeof navigator !== 'undefined' && !navigator.onLine
        ? 'You are offline and this city is not cached yet.'
        : 'Unable to fetch live weather right now. Please try again.'
    );
  }
}

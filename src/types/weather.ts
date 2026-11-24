export type TempUnit = 'c' | 'f';

export type WeatherConditionMain =
  | 'Clear'
  | 'Clouds'
  | 'Rain'
  | 'Drizzle'
  | 'Thunderstorm'
  | 'Snow'
  | 'Mist'
  | 'Fog'
  | 'Haze'
  | 'Smoke'
  | 'Squall'
  | string;

export interface CurrentWeather {
  city: string;
  country: string;
  lat: number;
  lon: number;
  tempC: number;
  feelsLikeC: number;
  tempMinC: number;
  tempMaxC: number;
  humidity: number;
  pressure: number;
  windSpeedKmh: number;
  windDeg: number;
  clouds: number;
  visibilityKm: number;
  conditionMain: WeatherConditionMain;
  description: string;
  sunrise: number;
  sunset: number;
  timezoneOffset: number;
  dt: number;
  lastUpdatedIso: string;
}

export interface ForecastSlot {
  dt: number;
  timeLabel: string;
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  pressure: number;
  windSpeedKmh: number;
  pop: number; // 0..100 probability of precipitation
  conditionMain: WeatherConditionMain;
  description: string;
  dewPointC: number;
  heatIndexC: number;
}

export interface DailyForecast {
  dateKey: string;
  dayLabel: string;
  fullDateLabel: string;
  tempMinC: number;
  tempMaxC: number;
  avgHumidity: number;
  avgDewPointC: number;
  maxWindKmh: number;
  maxPop: number;
  pressure: number;
  conditionMain: WeatherConditionMain;
  description: string;
  slots: ForecastSlot[];
}

export type HumidityComfortLevel =
  | 'Dry'
  | 'Comfortable'
  | 'Humid'
  | 'Muggy'
  | 'Oppressive';

export interface HumidityMetrics {
  relativeHumidity: number;
  dewPointC: number;
  heatIndexC: number;
  vaporPressureHpa: number;
  comfortLevel: HumidityComfortLevel;
  advisoryText: string;
  indexScore: number; // 0..100 normalized atmospheric moisture comfort index
}

export type AlertSeverity = 'advisory' | 'watch' | 'warning';

export interface WeatherAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  metricLabel: string;
  thresholdLabel: string;
  timestamp: string;
  city: string;
}

export interface AlertPreferences {
  pushEnabled: boolean;
  severeStorms: boolean;
  highHumidityThreshold: number;
  highHeatThresholdC: number;
  highWindThresholdKmh: number;
}

export type DataSourceMode = 'live' | 'cached' | 'fallback';

export interface WeatherBundle {
  current: CurrentWeather;
  hourlySlots: ForecastSlot[];
  dailyForecast: DailyForecast[];
  humidityMetrics: HumidityMetrics;
  alerts: WeatherAlert[];
  source: DataSourceMode;
}

import React from 'react';
import {
  Compass,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Wind,
} from 'lucide-react';
import type { CurrentWeather, ForecastSlot, TempUnit } from '../types/weather';
import {
  formatCompassDirection,
  formatLocalTime,
  formatTemp,
  formatWindSpeed,
} from '../utils/weatherCalculations';
import { WeatherGlyph } from './WeatherGlyph';

interface CurrentConditionsCardProps {
  current: CurrentWeather;
  hourlySlots: ForecastSlot[];
  unit: TempUnit;
}

export const CurrentConditionsCard: React.FC<CurrentConditionsCardProps> = ({
  current,
  hourlySlots,
  unit,
}) => {
  const localTime = formatLocalTime(current.dt, current.timezoneOffset);
  const sunriseTime = formatLocalTime(current.sunrise, current.timezoneOffset);
  const sunsetTime = formatLocalTime(current.sunset, current.timezoneOffset);
  const windDir = formatCompassDirection(current.windDeg);

  return (
    <section
      id="overview"
      aria-labelledby="current-city-heading"
      className="flex flex-col justify-between rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/90 p-6 sm:p-7 shadow-xs dark:shadow-none"
    >
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1
              id="current-city-heading"
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance"
            >
              {current.city}
              {current.country ? `, ${current.country}` : ''}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 tabular-nums">
              {current.lat.toFixed(2)}°, {current.lon.toFixed(2)}°
              <span className="mx-2 text-slate-300 dark:text-slate-600" aria-hidden="true">
                ·
              </span>
              Local time {localTime}
              <span className="mx-2 text-slate-300 dark:text-slate-600" aria-hidden="true">
                ·
              </span>
              <span className="capitalize text-slate-700 dark:text-slate-300">
                {current.description}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800/80 shrink-0">
              <WeatherGlyph condition={current.conditionMain} size="xl" />
            </div>
            <div>
              <div
                data-testid="current-temp"
                className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50 tabular-nums leading-none"
              >
                {formatTemp(current.tempC, unit)}
              </div>
              <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-slate-500 dark:text-slate-400 tabular-nums">
                <span className="whitespace-nowrap">
                  Feels like{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatTemp(current.feelsLikeC, unit)}
                  </span>
                </span>
                <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                  ·
                </span>
                <span className="whitespace-nowrap">
                  High {formatTemp(current.tempMaxC, unit, false)} / Low{' '}
                  {formatTemp(current.tempMinC, unit, false)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-200 dark:border-slate-800/70">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 tabular-nums">
              <Sunrise className="w-4 h-4 text-amber-500 dark:text-amber-400" aria-hidden="true" />
              <span className="text-slate-500 dark:text-slate-400">Sunrise</span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                {sunriseTime}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 tabular-nums">
              <Sunset className="w-4 h-4 text-orange-500 dark:text-orange-400" aria-hidden="true" />
              <span className="text-slate-500 dark:text-slate-400">Sunset</span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                {sunsetTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Metrics Row separated by hairline dividers */}
      <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200 dark:border-slate-800/80 pt-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Wind className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
            <span>Wind</span>
          </div>
          <p className="mt-1 font-mono text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatWindSpeed(current.windSpeedKmh, unit)}
          </p>
          <p className="text-xs text-slate-500">Direction {windDir}</p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Gauge className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
            <span>Pressure</span>
          </div>
          <p className="mt-1 font-mono text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {current.pressure} hPa
          </p>
          <p className="text-xs text-slate-500">
            {current.pressure < 1008 ? 'Low system' : current.pressure > 1018 ? 'High ridge' : 'Nominal'}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Eye className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
            <span>Visibility</span>
          </div>
          <p className="mt-1 font-mono text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {current.visibilityKm.toFixed(1)} km
          </p>
          <p className="text-xs text-slate-500">Cloud cover {current.clouds}%</p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Compass className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
            <span>Next 24h Peak</span>
          </div>
          <p className="mt-1 font-mono text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {hourlySlots.length > 0
              ? formatTemp(Math.max(...hourlySlots.map((s) => s.tempC)), unit)
              : formatTemp(current.tempMaxC, unit)}
          </p>
          <p className="text-xs text-slate-500 tabular-nums">
            Rain chance{' '}
            {hourlySlots.length > 0
              ? `${Math.max(...hourlySlots.map((s) => s.pop))}%`
              : '0%'}
          </p>
        </div>
      </div>

      {/* Compact 24h interval strip */}
      {hourlySlots.length > 0 && (
        <div className="mt-5 border-t border-slate-200 dark:border-slate-800/80 pt-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
            Next 24-Hour Trajectory
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {hourlySlots.slice(0, 8).map((slot) => (
              <div
                key={slot.dt}
                className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
              >
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  {slot.timeLabel}
                </span>
                <WeatherGlyph condition={slot.conditionMain} size="sm" />
                <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatTemp(slot.tempC, unit, false)}
                </span>
                <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400/90 tabular-nums">
                  {slot.pop}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

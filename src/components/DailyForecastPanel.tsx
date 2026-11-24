import React, { useEffect, useState } from 'react';
import { CalendarDays, Droplets, Gauge, Umbrella, Wind } from 'lucide-react';
import type { DailyForecast, TempUnit } from '../types/weather';
import { formatTemp, formatWindSpeed } from '../utils/weatherCalculations';
import { WeatherGlyph } from './WeatherGlyph';

interface DailyForecastPanelProps {
  days: DailyForecast[];
  unit: TempUnit;
}

export const DailyForecastPanel: React.FC<DailyForecastPanelProps> = ({ days, unit }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [days]);

  if (days.length === 0) {
    return null;
  }

  const selectedDay = days[selectedIndex] ?? days[0];
  const globalMin = Math.min(...days.map((d) => d.tempMinC));
  const globalMax = Math.max(...days.map((d) => d.tempMaxC));
  const tempSpan = Math.max(1, globalMax - globalMin);

  return (
    <section
      id="forecast"
      aria-labelledby="forecast-heading"
      className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/90 p-6 sm:p-7 shadow-xs dark:shadow-none"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-sky-500 dark:text-sky-400" aria-hidden="true" />
          <h2
            id="forecast-heading"
            className="font-display text-lg font-bold text-slate-900 dark:text-slate-100"
          >
            5-Day Detailed Forecast
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select any day to inspect 3-hour intervals, humidity, and precipitation risk
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 5-Day Interactive List */}
        <div
          role="tablist"
          aria-label="Forecast days"
          className="lg:col-span-5 divide-y divide-slate-200 dark:divide-slate-800/70"
        >
          {days.map((day, idx) => {
            const isSelected = idx === selectedIndex;
            const leftPct = Math.round(((day.tempMinC - globalMin) / tempSpan) * 100);
            const widthPct = Math.max(
              14,
              Math.round(((day.tempMaxC - day.tempMinC) / tempSpan) * 100)
            );

            return (
              <button
                key={day.dateKey}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedIndex(idx)}
                className={`w-full flex items-center justify-between gap-3 py-3.5 px-3 text-left transition-colors rounded-xl cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-sky-500/12 text-slate-900 dark:text-slate-50'
                    : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-20 shrink-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {day.dayLabel}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    {day.avgHumidity}% RH
                  </div>
                </div>

                <div className="flex items-center gap-2 w-16 shrink-0">
                  <WeatherGlyph condition={day.conditionMain} size="sm" />
                  <span className="font-mono text-xs text-sky-600 dark:text-sky-400 tabular-nums">
                    {day.maxPop}%
                  </span>
                </div>

                <div className="flex items-center gap-2.5 flex-1 justify-end">
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums w-8 text-right">
                    {formatTemp(day.tempMinC, unit, false)}
                  </span>
                  <div className="hidden sm:block w-20 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-500 to-amber-500 dark:from-sky-400 dark:to-amber-400"
                      style={{
                        left: `${Math.min(86, leftPct)}%`,
                        width: `${Math.min(100 - leftPct, widthPct)}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums w-8 text-right">
                    {formatTemp(day.tempMaxC, unit, false)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Day Breakdown */}
        <div
          role="tabpanel"
          aria-label={`Detailed forecast for ${selectedDay.fullDateLabel}`}
          className="lg:col-span-7 lg:border-l lg:border-slate-200 dark:lg:border-slate-800/80 lg:pl-6 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <WeatherGlyph condition={selectedDay.conditionMain} size="lg" />
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                  {selectedDay.fullDateLabel}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {selectedDay.description}
                </p>
              </div>
            </div>
            <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatTemp(selectedDay.tempMaxC, unit)} /{' '}
              <span className="text-slate-500 dark:text-slate-400">
                {formatTemp(selectedDay.tempMinC, unit)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-slate-200 dark:border-slate-800/80 py-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Droplets className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
                <span>Avg Humidity</span>
              </div>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {selectedDay.avgHumidity}% · Dew {formatTemp(selectedDay.avgDewPointC, unit)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Umbrella className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
                <span>Peak Precip</span>
              </div>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {selectedDay.maxPop}%
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Wind className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
                <span>Max Wind</span>
              </div>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatWindSpeed(selectedDay.maxWindKmh, unit)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Gauge className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
                <span>Pressure</span>
              </div>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {selectedDay.pressure} hPa
              </p>
            </div>
          </div>

          {/* 3-Hour Interval Table for Selected Day */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-medium text-slate-500">
                  <th className="py-2 pr-3 font-medium">Time</th>
                  <th className="py-2 px-2 font-medium">Condition</th>
                  <th className="py-2 px-2 font-medium text-right">Temp</th>
                  <th className="py-2 px-2 font-medium text-right">Humidity</th>
                  <th className="py-2 px-2 font-medium text-right">Wind</th>
                  <th className="py-2 pl-2 font-medium text-right">Precip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                {selectedDay.slots.map((slot) => (
                  <tr
                    key={slot.dt}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-2.5 pr-3 font-mono text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">
                      {slot.timeLabel}
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <WeatherGlyph condition={slot.conditionMain} size="sm" />
                        <span className="capitalize text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                          {slot.description}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                      {formatTemp(slot.tempC, unit)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">
                      {slot.humidity}%
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">
                      {formatWindSpeed(slot.windSpeedKmh, unit)}
                    </td>
                    <td className="py-2.5 pl-2 text-right font-mono text-sky-600 dark:text-sky-400 tabular-nums whitespace-nowrap">
                      {slot.pop}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

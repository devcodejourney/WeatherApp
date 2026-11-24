import React from 'react';
import { Droplets, Flame, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { ForecastSlot, HumidityMetrics, TempUnit } from '../types/weather';
import { formatTemp } from '../utils/weatherCalculations';

interface HumidityIndexPanelProps {
  metrics: HumidityMetrics;
  hourlySlots: ForecastSlot[];
  unit: TempUnit;
}

const COMFORT_STYLES: Record<
  HumidityMetrics['comfortLevel'],
  { textColor: string; barColor: string; statusText: string }
> = {
  Dry: {
    textColor: 'text-amber-700 dark:text-amber-300',
    barColor: 'bg-amber-500 dark:bg-amber-400',
    statusText: 'Dry Air',
  },
  Comfortable: {
    textColor: 'text-emerald-700 dark:text-emerald-400',
    barColor: 'bg-emerald-600 dark:bg-emerald-400',
    statusText: 'Comfortable',
  },
  Humid: {
    textColor: 'text-sky-700 dark:text-sky-400',
    barColor: 'bg-sky-500 dark:bg-sky-400',
    statusText: 'Humid',
  },
  Muggy: {
    textColor: 'text-amber-700 dark:text-amber-400',
    barColor: 'bg-amber-500',
    statusText: 'Muggy',
  },
  Oppressive: {
    textColor: 'text-rose-700 dark:text-rose-400',
    barColor: 'bg-rose-600 dark:bg-rose-500',
    statusText: 'Oppressive',
  },
};

export const HumidityIndexPanel: React.FC<HumidityIndexPanelProps> = ({
  metrics,
  hourlySlots,
  unit,
}) => {
  const style = COMFORT_STYLES[metrics.comfortLevel];
  const slots = hourlySlots.slice(0, 8);

  return (
    <section
      id="humidity"
      aria-labelledby="humidity-heading"
      className="flex flex-col justify-between rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/90 p-6 sm:p-7 shadow-xs dark:shadow-none"
    >
      <div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-500 dark:text-sky-400" aria-hidden="true" />
            <h2
              id="humidity-heading"
              className="font-display text-base font-semibold text-slate-900 dark:text-slate-100"
            >
              Humidity Index Tracking
            </h2>
          </div>

          <div className={`flex items-center gap-1.5 text-xs font-semibold ${style.textColor}`}>
            {metrics.comfortLevel === 'Comfortable' ? (
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{style.statusText}</span>
          </div>
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-4">
          <div>
            <div
              data-testid="humidity-value"
              className="font-display text-4xl sm:text-5xl font-extrabold text-slate-950 dark:text-slate-50 tabular-nums leading-none"
            >
              {metrics.relativeHumidity}%
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Relative Humidity</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-xl font-bold text-sky-600 dark:text-sky-400 tabular-nums">
              {metrics.indexScore}
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500"> / 100</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Moisture Index</p>
          </div>
        </div>

        {/* Moisture Load Meter */}
        <div className="mt-5">
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${style.barColor}`}
              style={{ width: `${metrics.indexScore}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-slate-500 font-mono tabular-nums">
            <span>Dry</span>
            <span>Optimal</span>
            <span>Humid</span>
            <span>Oppressive</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {metrics.advisoryText}
        </p>
      </div>

      {/* Dew Point / Heat Index / Vapor Pressure */}
      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-200 dark:border-slate-800/80 pt-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Dew Point</p>
          <p className="mt-1 font-mono text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatTemp(metrics.dewPointC, unit)}
          </p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Flame className="w-3 h-3 text-amber-500 dark:text-amber-400" aria-hidden="true" />
            <span>Heat Index</span>
          </p>
          <p className="mt-1 font-mono text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatTemp(metrics.heatIndexC, unit)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Vapor Press.</p>
          <p className="mt-1 font-mono text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {metrics.vaporPressureHpa} hPa
          </p>
        </div>
      </div>

      {/* 24-hour Relative Humidity Bar Curve */}
      {slots.length > 0 && (
        <div className="mt-5 border-t border-slate-200 dark:border-slate-800/80 pt-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span>24h Humidity Trend</span>
            <span className="font-mono tabular-nums text-slate-500">
              Peak {Math.max(...slots.map((s) => s.humidity))}%
            </span>
          </div>
          <div className="grid grid-cols-8 items-end gap-2 h-20">
            {slots.map((slot) => {
              const barHeight = Math.max(16, Math.round((slot.humidity / 100) * 64));
              return (
                <div key={slot.dt} className="flex flex-col items-center justify-end gap-1 h-full">
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
                    {slot.humidity}%
                  </span>
                  <div
                    className={`w-full max-w-[20px] rounded-t-sm transition-all duration-300 ${
                      slot.humidity >= 80
                        ? 'bg-amber-500 dark:bg-amber-400/85'
                        : slot.humidity >= 65
                        ? 'bg-sky-500 dark:bg-sky-400/85'
                        : 'bg-emerald-500 dark:bg-emerald-400/80'
                    }`}
                    style={{ height: `${barHeight}px` }}
                    title={`${slot.timeLabel}: ${slot.humidity}% RH (Dew point ${formatTemp(
                      slot.dewPointC,
                      unit
                    )})`}
                  />
                  <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                    {slot.timeLabel.slice(0, 2)}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

import React, { useState } from 'react';
import { LocateFixed, Moon, RefreshCw, Search, Sun } from 'lucide-react';
import type { ThemeMode } from '../hooks/useTheme';
import type { DataSourceMode, TempUnit } from '../types/weather';

interface SearchToolbarProps {
  unit: TempUnit;
  onUnitChange: (unit: TempUnit) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onSearchCity: (city: string) => void;
  onUseCurrentLocation: () => void;
  onRefresh: () => void;
  recentCities: string[];
  activeCity: string;
  isLoading: boolean;
  isLocating: boolean;
  lastUpdatedLabel: string;
  dataSource: DataSourceMode;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  unit,
  onUnitChange,
  theme,
  onThemeChange,
  onSearchCity,
  onUseCurrentLocation,
  onRefresh,
  recentCities,
  activeCity,
  isLoading,
  isLocating,
  lastUpdatedLabel,
  dataSource,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;
    onSearchCity(clean);
    setQuery('');
  };

  const sourceLabel =
    dataSource === 'live'
      ? 'Live telemetry'
      : dataSource === 'cached'
      ? 'Cached offline snapshot'
      : 'Offline reference snapshot';

  return (
    <section aria-label="Location search and display controls" className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <form onSubmit={handleSubmit} className="flex flex-1 max-w-xl items-center gap-2">
          <div className="relative flex-1">
            <label htmlFor="city-search-input" className="sr-only">
              Search city
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400"
              aria-hidden="true"
            />
            <input
              id="city-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city (e.g. Dhaka, London, Tokyo, Miami)..."
              autoComplete="off"
              spellCheck={false}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="h-11 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 dark:hover:bg-sky-400 disabled:opacity-45 disabled:hover:bg-sky-500 text-white dark:text-slate-950 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Search
          </button>
          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={isLocating || isLoading}
            aria-label="Use current GPS location"
            title="Use current location"
            className="h-11 w-11 flex items-center justify-center rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors shrink-0 cursor-pointer"
          >
            <LocateFixed
              className={`w-4 h-4 ${isLocating ? 'animate-spin text-sky-500 dark:text-sky-400' : ''}`}
              aria-hidden="true"
            />
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            <span>{sourceLabel}</span>
            <span aria-hidden="true">·</span>
            <span>Updated {lastUpdatedLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Refresh weather data"
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-500 dark:text-sky-400' : ''}`}
                aria-hidden="true"
              />
            </button>

            <div
              role="group"
              aria-label="Color theme"
              className="inline-flex items-center rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-1"
            >
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                aria-pressed={theme === 'light'}
                aria-label="Light mode"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[32px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  theme === 'light'
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                aria-pressed={theme === 'dark'}
                aria-label="Dark mode"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[32px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Dark</span>
              </button>
            </div>

            <div
              role="group"
              aria-label="Temperature unit"
              className="inline-flex items-center rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-1"
            >
              <button
                type="button"
                onClick={() => onUnitChange('c')}
                aria-pressed={unit === 'c'}
                className={`px-3 py-1.5 min-h-[32px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  unit === 'c'
                    ? 'bg-sky-500 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => onUnitChange('f')}
                aria-pressed={unit === 'f'}
                className={`px-3 py-1.5 min-h-[32px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  unit === 'f'
                    ? 'bg-sky-500 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                °F
              </button>
            </div>
          </div>
        </div>
      </div>

      {recentCities.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" role="region" aria-label="Recent cities">
          <span className="text-xs text-slate-500 dark:text-slate-500 mr-1">Recent:</span>
          {recentCities.map((city) => {
            const isActive = city.toLowerCase() === activeCity.toLowerCase();
            return (
              <button
                key={city}
                type="button"
                onClick={() => onSearchCity(city)}
                className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-500/15 border-sky-300 dark:border-sky-500/40 text-sky-700 dark:text-sky-300'
                    : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

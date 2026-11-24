import React from 'react';
import { CloudSun } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface TopNavProps {
  activeAlertCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({ activeAlertCount }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-14 sm:h-16">
        <a
          href="#overview"
          className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md"
        >
          <CloudSun className="w-5 h-5 text-sky-500 dark:text-sky-400" strokeWidth={2} aria-hidden="true" />
          <span>Weather</span>
        </a>

        <nav
          aria-label="Primary sections"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-400"
        >
          <a
            href="#overview"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Overview
          </a>
          <a
            href="#humidity"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Humidity Index
          </a>
          <a
            href="#forecast"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            5-Day Forecast
          </a>
          <a
            href="#alerts"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Alerts{activeAlertCount > 0 ? ` (${activeAlertCount})` : ''}
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  Send,
  ShieldAlert,
} from 'lucide-react';
import type { AlertPreferences, TempUnit, WeatherAlert } from '../types/weather';
import type { DispatchedNotification } from '../hooks/usePushAlerts';
import { formatTemp, formatWindSpeed } from '../utils/weatherCalculations';

interface SevereAlertsPanelProps {
  city: string;
  unit: TempUnit;
  alerts: WeatherAlert[];
  prefs: AlertPreferences;
  permission: NotificationPermission;
  recentDispatches: DispatchedNotification[];
  onUpdatePrefs: (partial: Partial<AlertPreferences>) => void;
  onEnablePush: () => Promise<NotificationPermission>;
  onSendTestPush: () => Promise<void>;
}

const SEVERITY_CONFIG = {
  warning: {
    icon: AlertOctagon,
    label: 'Severe Warning',
    badgeClass: 'text-rose-700 dark:text-rose-400',
    surfaceClass: 'bg-rose-50 dark:bg-rose-500/8 border-rose-200 dark:border-rose-500/30',
  },
  watch: {
    icon: AlertTriangle,
    label: 'Weather Watch',
    badgeClass: 'text-amber-700 dark:text-amber-400',
    surfaceClass: 'bg-amber-50 dark:bg-amber-500/8 border-amber-200 dark:border-amber-500/30',
  },
  advisory: {
    icon: ShieldAlert,
    label: 'Advisory',
    badgeClass: 'text-sky-700 dark:text-sky-400',
    surfaceClass: 'bg-sky-50 dark:bg-sky-500/8 border-sky-200 dark:border-sky-500/30',
  },
};

export const SevereAlertsPanel: React.FC<SevereAlertsPanelProps> = ({
  city,
  unit,
  alerts,
  prefs,
  permission,
  recentDispatches,
  onUpdatePrefs,
  onEnablePush,
  onSendTestPush,
}) => {
  return (
    <section
      id="alerts"
      aria-labelledby="alerts-heading"
      className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/90 p-6 sm:p-7 shadow-xs dark:shadow-none"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <BellRing className="w-4 h-4 text-sky-500 dark:text-sky-400" aria-hidden="true" />
          <div>
            <h2
              id="alerts-heading"
              className="font-display text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Severe Weather Alerts &amp; Push Notifications
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time threshold monitoring and Service Worker push dispatch for {city}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (prefs.pushEnabled) {
                onUpdatePrefs({ pushEnabled: false });
              } else {
                void onEnablePush();
              }
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              prefs.pushEnabled
                ? 'bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                : 'bg-sky-500 hover:bg-sky-600 dark:hover:bg-sky-400 text-white dark:text-slate-950'
            }`}
          >
            <Bell className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{prefs.pushEnabled ? 'Push Alerts Active' : 'Enable Push Alerts'}</span>
          </button>

          <button
            type="button"
            onClick={() => void onSendTestPush()}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
            <span>Send Test Alert</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Alerts Feed */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Active Advisories ({alerts.length})</span>
            <span className="font-mono text-slate-500">
              Browser Permission: {permission}
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="flex items-start gap-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800/80 p-5">
              <CheckCircle2
                className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Nominal Conditions in {city}
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  No severe convective storms, wind gusts, heat index spikes, or humidity
                  thresholds are currently breached. Push notifications will trigger automatically
                  when monitored conditions cross your configured limits.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const cfg = SEVERITY_CONFIG[alert.severity];
                const Icon = cfg.icon;
                return (
                  <article
                    key={alert.id}
                    className={`rounded-xl border p-4 ${cfg.surfaceClass}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className={`flex items-center gap-2 text-xs font-semibold ${cfg.badgeClass}`}>
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{cfg.label}</span>
                      </div>
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums">
                        {alert.metricLabel} · Rule {alert.thresholdLabel}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {alert.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {alert.description}
                    </p>
                  </article>
                );
              })}
            </div>
          )}

          {recentDispatches.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/70">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                Recent Push Dispatches
              </p>
              <ul className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
                {recentDispatches.map((item) => (
                  <li key={item.id} className="py-2 flex items-center justify-between gap-3">
                    <span className="text-slate-800 dark:text-slate-200 truncate">{item.title}</span>
                    <span className="font-mono text-slate-500 whitespace-nowrap shrink-0 tabular-nums">
                      {item.sentAt} · {item.deliveryMode}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: Threshold Configuration */}
        <div className="lg:col-span-5 lg:border-l lg:border-slate-200 dark:lg:border-slate-800/80 lg:pl-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Alert Thresholds
          </h3>

          <label className="flex items-center justify-between gap-3 py-2 cursor-pointer">
            <div>
              <span className="block text-xs font-medium text-slate-800 dark:text-slate-200">
                Severe Thunderstorm &amp; Heavy Rain
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                Trigger warning on convective storms or &ge; 80% rain probability
              </span>
            </div>
            <input
              type="checkbox"
              checked={prefs.severeStorms}
              onChange={(e) => onUpdatePrefs({ severeStorms: e.target.checked })}
              className="h-5 w-5 accent-sky-500 rounded cursor-pointer"
            />
          </label>

          <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-800/70 pt-3">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="humidity-threshold" className="text-slate-700 dark:text-slate-300 font-medium">
                Humidity Index Threshold
              </label>
              <span className="font-mono text-sky-600 dark:text-sky-400 font-semibold tabular-nums">
                {prefs.highHumidityThreshold}% RH
              </span>
            </div>
            <input
              id="humidity-threshold"
              type="range"
              min={55}
              max={95}
              step={5}
              value={prefs.highHumidityThreshold}
              onChange={(e) =>
                onUpdatePrefs({ highHumidityThreshold: Number(e.target.value) })
              }
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-800/70 pt-3">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="heat-threshold" className="text-slate-700 dark:text-slate-300 font-medium">
                Heat Index Alert Threshold
              </label>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold tabular-nums">
                {formatTemp(prefs.highHeatThresholdC, unit)}
              </span>
            </div>
            <input
              id="heat-threshold"
              type="range"
              min={26}
              max={44}
              step={1}
              value={prefs.highHeatThresholdC}
              onChange={(e) =>
                onUpdatePrefs({ highHeatThresholdC: Number(e.target.value) })
              }
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-800/70 pt-3">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="wind-threshold" className="text-slate-700 dark:text-slate-300 font-medium">
                High Wind Advisory Threshold
              </label>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold tabular-nums">
                {formatWindSpeed(prefs.highWindThresholdKmh, unit)}
              </span>
            </div>
            <input
              id="wind-threshold"
              type="range"
              min={20}
              max={80}
              step={5}
              value={prefs.highWindThresholdKmh}
              onChange={(e) =>
                onUpdatePrefs({ highWindThresholdKmh: Number(e.target.value) })
              }
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

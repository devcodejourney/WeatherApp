import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { CurrentConditionsCard } from './components/CurrentConditionsCard';
import { DailyForecastPanel } from './components/DailyForecastPanel';
import { HumidityIndexPanel } from './components/HumidityIndexPanel';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PushAlertToast } from './components/PushAlertToast';
import { SearchToolbar } from './components/SearchToolbar';
import { SevereAlertsPanel } from './components/SevereAlertsPanel';
import { TopNav } from './components/TopNav';
import { usePushAlerts } from './hooks/usePushAlerts';
import { useTheme } from './hooks/useTheme';
import type { TempUnit, WeatherBundle } from './types/weather';
import { fetchOpenMeteoByCoords, fetchWeatherForCity, WeatherApiError } from './utils/weatherApi';
import { evaluateSevereAlerts } from './utils/weatherCalculations';

const HISTORY_KEY = 'weatherHistory';
const UNIT_KEY = 'weatherUnit';
const DEFAULT_CITY = 'Dhaka';

export default function App() {
  const { theme, setTheme } = useTheme();

  const [unit, setUnit] = useState<TempUnit>(() => {
    try {
      const saved = localStorage.getItem(UNIT_KEY);
      return saved === 'f' ? 'f' : 'c';
    } catch {
      return 'c';
    }
  });

  const [recentCities, setRecentCities] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
    } catch {
      return [];
    }
  });

  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    prefs,
    permission,
    recentDispatches,
    activeToast,
    updatePrefs,
    requestPushPermission,
    dispatchNotification,
    notifyForAlerts,
    dismissToast,
  } = usePushAlerts();

  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const lastAlertCityRef = useRef<string>('');

  const saveHistoryCity = useCallback((cityName: string) => {
    const clean = cityName.trim();
    if (!clean) return;
    setRecentCities((prev) => {
      const next = [
        clean,
        ...prev.filter((c) => c.toLowerCase() !== clean.toLowerCase()),
      ].slice(0, 5);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  }, []);

  const loadCityWeather = useCallback(
    async (city: string, notifyIfSevere = true) => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const bundle = await fetchWeatherForCity(city, prefsRef.current);
        setWeather(bundle);
        saveHistoryCity(bundle.current.city);

        if (
          notifyIfSevere &&
          bundle.alerts.length > 0 &&
          lastAlertCityRef.current !== bundle.current.city
        ) {
          lastAlertCityRef.current = bundle.current.city;
          await notifyForAlerts(bundle.alerts);
        }
      } catch (err) {
        if (err instanceof WeatherApiError) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg('Unable to load weather forecast right now.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [notifyForAlerts, saveHistoryCity]
  );

  // Initial load & 5-minute real-time polling
  useEffect(() => {
    const initialCity = recentCities[0] || DEFAULT_CITY;
    void loadCityWeather(initialCity, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (weather?.current.city && navigator.onLine) {
        void loadCityWeather(weather.current.city, true);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [weather?.current.city, loadCityWeather]);

  const handleUnitChange = (nextUnit: TempUnit) => {
    setUnit(nextUnit);
    try {
      localStorage.setItem(UNIT_KEY, nextUnit);
    } catch {
      // Ignore storage error
    }
  };

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setErrorMsg('Geolocation is not supported in this browser.');
      return;
    }

    setIsLocating(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setIsLoading(true);
          const bundle = await fetchOpenMeteoByCoords(
            pos.coords.latitude,
            pos.coords.longitude,
            'Current Location',
            '',
            prefsRef.current
          );
          setWeather(bundle);
        } catch {
          setErrorMsg('Unable to resolve weather for your current coordinates.');
        } finally {
          setIsLoading(false);
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setErrorMsg('Location access was denied. Search a city manually above.');
      },
      { timeout: 8000 }
    );
  };

  // Re-evaluate severe alerts instantaneously whenever user adjusts threshold sliders or unit
  const liveAlerts = useMemo(() => {
    if (!weather) return [];
    return evaluateSevereAlerts(weather.current, weather.dailyForecast, prefs, unit);
  }, [weather, prefs, unit]);

  const handleSendTestPush = async () => {
    const activeCity = weather?.current.city || DEFAULT_CITY;
    const sample =
      liveAlerts[0] ?? {
        title: 'Severe Weather Watch (Test)',
        description: `Monitoring active for ${activeCity}. Humidity ${
          weather?.humidityMetrics.relativeHumidity ?? 78
        }% · Wind ${weather?.current.windSpeedKmh ?? 14} km/h.`,
      };

    await dispatchNotification(
      `${activeCity}: ${sample.title}`,
      sample.description,
      `test-${Date.now()}`
    );
  };

  const lastUpdatedLabel = weather
    ? new Date(weather.current.lastUpdatedIso).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <TopNav activeAlertCount={liveAlerts.length} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <SearchToolbar
          unit={unit}
          onUnitChange={handleUnitChange}
          theme={theme}
          onThemeChange={setTheme}
          onSearchCity={(city) => void loadCityWeather(city, true)}
          onUseCurrentLocation={handleUseCurrentLocation}
          onRefresh={() => void loadCityWeather(weather?.current.city || DEFAULT_CITY, true)}
          recentCities={recentCities}
          activeCity={weather?.current.city || ''}
          isLoading={isLoading}
          isLocating={isLocating}
          lastUpdatedLabel={lastUpdatedLabel}
          dataSource={weather?.source || 'live'}
        />

        {errorMsg && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 px-4 py-3 text-sm text-rose-800 dark:text-rose-200"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-xs font-semibold text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading && !weather ? (
          <LoadingSkeleton />
        ) : weather ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 flex">
                <div className="w-full flex [&>section]:w-full">
                  <CurrentConditionsCard
                    current={weather.current}
                    hourlySlots={weather.hourlySlots}
                    unit={unit}
                  />
                </div>
              </div>
              <div className="lg:col-span-5 flex">
                <div className="w-full flex [&>section]:w-full">
                  <HumidityIndexPanel
                    metrics={weather.humidityMetrics}
                    hourlySlots={weather.hourlySlots}
                    unit={unit}
                  />
                </div>
              </div>
            </div>

            <DailyForecastPanel days={weather.dailyForecast} unit={unit} />

            <SevereAlertsPanel
              city={weather.current.city}
              unit={unit}
              alerts={liveAlerts}
              prefs={prefs}
              permission={permission}
              recentDispatches={recentDispatches}
              onUpdatePrefs={updatePrefs}
              onEnablePush={requestPushPermission}
              onSendTestPush={handleSendTestPush}
            />
          </div>
        ) : null}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800/70 mt-10 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Weather · App — Real-time meteorological &amp; humidity index tracking PWA</span>
          <span>Data sourced via Open-Meteo · Offline caching enabled</span>
        </div>
      </footer>

      <OfflineIndicator />
      <PushAlertToast toast={activeToast} onDismiss={dismissToast} />
    </div>
  );
}

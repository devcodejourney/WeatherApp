import { useCallback, useEffect, useState } from 'react';
import type { AlertPreferences, WeatherAlert } from '../types/weather';

const PREFS_KEY = 'weather_alert_prefs_v1';

export const DEFAULT_ALERT_PREFS: AlertPreferences = {
  pushEnabled: false,
  severeStorms: true,
  highHumidityThreshold: 80,
  highHeatThresholdC: 35,
  highWindThresholdKmh: 40,
};

export interface DispatchedNotification {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  deliveryMode: 'service-worker' | 'browser-api' | 'in-app';
}

export function usePushAlerts() {
  const [prefs, setPrefs] = useState<AlertPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) {
        return { ...DEFAULT_ALERT_PREFS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore storage error
    }
    return DEFAULT_ALERT_PREFS;
  });

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof Notification !== 'undefined') return Notification.permission;
    return 'default';
  });

  const [recentDispatches, setRecentDispatches] = useState<DispatchedNotification[]>([]);
  const [activeToast, setActiveToast] = useState<DispatchedNotification | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage error
    }
  }, [prefs]);

  const requestPushPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      setPrefs((prev) => ({ ...prev, pushEnabled: true }));
      return 'granted' as NotificationPermission;
    }

    let result = Notification.permission;
    if (result === 'default') {
      try {
        result = await Notification.requestPermission();
      } catch {
        result = 'default';
      }
    }
    setPermission(result);
    if (result === 'granted') {
      setPrefs((prev) => ({ ...prev, pushEnabled: true }));
    } else {
      // Allow in-app alert monitoring even if browser push is blocked in sandboxed preview
      setPrefs((prev) => ({ ...prev, pushEnabled: true }));
    }
    return result;
  }, []);

  const updatePrefs = useCallback((partial: Partial<AlertPreferences>) => {
    setPrefs((prev) => ({ ...prev, ...partial }));
  }, []);

  const dispatchNotification = useCallback(
    async (title: string, body: string, tag = 'weather-alert') => {
      let deliveryMode: DispatchedNotification['deliveryMode'] = 'in-app';

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg && 'showNotification' in reg) {
              await reg.showNotification(title, {
                body,
                icon: `${import.meta.env.BASE_URL}pwa-192x192.png`,
                badge: `${import.meta.env.BASE_URL}pwa-192x192.png`,
                tag,
              });
              deliveryMode = 'service-worker';
            }
          }
          if (deliveryMode === 'in-app') {
            new Notification(title, {
              body,
              icon: `${import.meta.env.BASE_URL}pwa-192x192.png`,
              tag,
            });
            deliveryMode = 'browser-api';
          }
        } catch {
          deliveryMode = 'in-app';
        }
      }

      const record: DispatchedNotification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title,
        body,
        sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deliveryMode,
      };
      setRecentDispatches((prev) => [record, ...prev].slice(0, 5));
      setActiveToast(record);
      return record;
    },
    []
  );

  const dismissToast = useCallback(() => setActiveToast(null), []);

  const notifyForAlerts = useCallback(
    async (alerts: WeatherAlert[]) => {
      if (!prefs.pushEnabled || alerts.length === 0) return;
      const topAlert = alerts.find((a) => a.severity === 'warning') ?? alerts[0];
      await dispatchNotification(
        `${topAlert.city}: ${topAlert.title}`,
        topAlert.description,
        topAlert.id
      );
    },
    [prefs.pushEnabled, dispatchNotification]
  );

  return {
    prefs,
    permission,
    recentDispatches,
    activeToast,
    updatePrefs,
    requestPushPermission,
    dispatchNotification,
    notifyForAlerts,
    dismissToast,
  };
}

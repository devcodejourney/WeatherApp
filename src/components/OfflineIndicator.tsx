import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2.5 rounded-xl bg-amber-500/95 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-xl"
    >
      <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>Offline Mode — Showing cached weather data</span>
    </div>
  );
};

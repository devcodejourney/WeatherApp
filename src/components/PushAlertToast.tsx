import React, { useEffect } from 'react';
import { BellRing, X } from 'lucide-react';
import type { DispatchedNotification } from '../hooks/usePushAlerts';

interface PushAlertToastProps {
  toast: DispatchedNotification | null;
  onDismiss: () => void;
}

export const PushAlertToast: React.FC<PushAlertToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 7000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:w-96 z-50 rounded-2xl bg-white dark:bg-[#161f30] border border-sky-300 dark:border-sky-500/40 p-4 shadow-2xl"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 shrink-0">
          <BellRing className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
              Weather Push Alert
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              {toast.sentAt}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {toast.title}
          </p>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {toast.body}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg bg-sky-500 hover:bg-sky-600 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs font-semibold tracking-tight transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#090d16] cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" strokeWidth={2.25} aria-hidden="true" />
        <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 dark:bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400">
                  <Smartphone className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3
                    id="pwa-guide-title"
                    className="font-display text-base font-bold text-slate-900 dark:text-slate-100"
                  >
                    Install Weather App
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Standalone offline-capable Progressive Web App
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close install instructions"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-4">
              {isIOS ? (
                <>
                  <p className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-medium">
                    <Share className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" aria-hidden="true" />
                    <span>Install on iPhone or iPad (Safari):</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-400 text-xs">
                    <li>Tap the Share button in the Safari toolbar.</li>
                    <li>Scroll down and select &ldquo;Add to Home Screen&rdquo;.</li>
                    <li>Confirm &ldquo;Weather&rdquo; to launch in standalone mode.</li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="text-slate-900 dark:text-slate-200 font-medium">
                    Install on Desktop or Android Browser:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-400 text-xs">
                    <li>Open your browser menu or look for the install icon in the address bar.</li>
                    <li>Select &ldquo;Install Weather · App&rdquo; or &ldquo;Add to Home screen&rdquo;.</li>
                    <li>Once installed, forecasts and severe alerts remain available offline.</li>
                  </ol>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 min-h-[40px] rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

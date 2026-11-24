import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div aria-label="Loading weather forecast" className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/90 p-7 h-[340px] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-7 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-72 rounded bg-slate-100 dark:bg-slate-800/70" />
          </div>
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2.5">
              <div className="h-12 w-36 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-48 rounded bg-slate-100 dark:bg-slate-800/70" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 border-t border-slate-200 dark:border-slate-800/80 pt-5">
            <div className="h-12 rounded bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-12 rounded bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-12 rounded bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-12 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/90 p-7 h-[340px] flex flex-col justify-between">
          <div className="h-5 w-44 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-12 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="grid grid-cols-3 gap-3 border-t border-slate-200 dark:border-slate-800/80 pt-4">
            <div className="h-10 rounded bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-10 rounded bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-10 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/90 p-7 h-[280px]" />
    </div>
  );
};

interface Props {
  p_3mo: number;
  p_6mo: number;
  p_12mo: number;
}

// --- Professional SVG Icons ---
const Icons = {
  Clock: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Info: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
};

export function PlacementTimeline({ p_3mo, p_6mo, p_12mo }: Props) {
  const points = [
    { label: '3 Months', value: p_3mo },
    { label: '6 Months', value: p_6mo },
    { label: '12 Months', value: p_12mo },
  ];

  return (
    <div className="w-full flex flex-col space-y-5">
      {points.map((pt, i) => {
        const pct = pt.value * 100;

        // Define color states matching the professional Golden Standard styling
        let theme = {
          bar: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]',
          badge: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30',
        };

        if (pct >= 70) {
          theme = {
            bar: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]',
            badge: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30',
          };
        } else if (pct >= 45) {
          theme = {
            bar: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]',
            badge: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30',
          };
        }

        return (
          <div key={i} className="group flex flex-col gap-2.5">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Professional Icon Container */}
                <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl shadow-sm dark:shadow-none text-slate-500 dark:text-white/50 group-hover:border-slate-300 dark:group-hover:border-white/20 group-hover:text-slate-700 dark:group-hover:text-white/80 transition-all">
                  {Icons.Clock}
                </div>
                <span className="text-[13px] font-bold font-display tracking-wide text-slate-800 dark:text-white transition-colors">
                  {pt.label}
                </span>
              </div>

              {/* Data Pill Badge */}
              <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border ${theme.badge} transition-colors`}>
                {pct.toFixed(0)}%
              </span>
            </div>

            {/* Sleek Progress Track */}
            <div className="w-full h-1.5 bg-slate-200/60 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${theme.bar}`}
                style={{ width: `${pct}%`, minWidth: pct > 0 ? '4px' : '0' }}
              />
            </div>

          </div>
        );
      })}

      {/* Refined Footer Note */}
      <div className="mt-2 pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center gap-2">
        <span className="text-slate-400 dark:text-white/30">{Icons.Info}</span>
        <p className="text-[10px] text-slate-500 dark:text-white/40 font-bold font-display tracking-widest uppercase">
          Probability of placement <span className="mx-1 opacity-50">·</span> 80% CI
        </p>
      </div>
    </div>
  );
}
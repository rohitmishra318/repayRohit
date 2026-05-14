interface ShapDriver {
  feature: string;
  direction: 'increases_risk' | 'reduces_risk';
  magnitude: number;
  display: string;
}

interface Props { drivers: ShapDriver[] }

// --- Professional SVG Icons ---
const Icons: Record<string, JSX.Element> = {
  cgpa_percentile: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
  internship_access_score: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
  ppo_binary: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>,
  demand_percentile: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>,
  months_since_graduation: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  cert_count_norm: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>,
  placement_gap_months: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  data_trust_weight: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  default: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
};

export function ShapDrivers({ drivers }: Props) {
  if (!drivers?.length) {
    return (
      <div className="p-6 text-center bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-[13px] text-slate-400 dark:text-white/40 font-body">
        No causal driver data available to analyze.
      </div>
    );
  }

  // Calculate max magnitude for bar width scaling
  const maxMag = Math.max(...drivers.map(d => Math.abs(d.magnitude ?? 0)), 0.001);

  return (
    <div className="flex flex-col">

      {/* Sleek Legend */}
      <div className="flex items-center gap-5 text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest mb-6 font-display">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
          <span>Increases Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
          <span>Reduces Risk</span>
        </div>
      </div>

      {/* Drivers List */}
      <div className="space-y-5">
        {drivers.map((d, i) => {
          const icon = Icons[d.feature] || Icons.default;
          const isIncreasingRisk = d.direction === 'increases_risk';
          const magnitude = d.magnitude ?? 0;
          const pct = (Math.abs(magnitude) / maxMag) * 100;

          return (
            <div key={i} className="group flex flex-col gap-2.5">
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">
                  {/* Professional Icon Container */}
                  <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl shadow-sm dark:shadow-none text-slate-500 dark:text-white/50 group-hover:border-slate-300 dark:group-hover:border-white/20 group-hover:text-slate-700 dark:group-hover:text-white/80 transition-all">
                    {icon}
                  </div>
                  <span className="text-[13px] font-bold font-display tracking-wide text-slate-800 dark:text-white transition-colors">
                    {d.display}
                  </span>
                </div>

                {/* Magnitude Badge */}
                <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-colors ${isIncreasingRisk
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30'
                    : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'
                  }`}>
                  {isIncreasingRisk ? '+' : '-'}{magnitude.toFixed(3)}
                </span>
              </div>

              {/* Diverging Bar Chart - Unified Track Design */}
              <div className="relative w-full h-1.5 bg-slate-200/60 dark:bg-white/10 rounded-full overflow-hidden flex">

                {/* Absolute Center Axis Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 dark:bg-white/30 z-10" />

                {/* Left side - Reduces risk (Green) */}
                <div className="flex-1 flex justify-end">
                  {!isIncreasingRisk && (
                    <div
                      className="bg-emerald-500 h-full rounded-l-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      style={{ width: `${pct}%`, minWidth: pct > 0 ? '2px' : '0' }}
                    />
                  )}
                </div>

                {/* Right side - Increases risk (Red) */}
                <div className="flex-1 flex justify-start">
                  {isIncreasingRisk && (
                    <div
                      className="bg-red-500 h-full rounded-r-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                      style={{ width: `${pct}%`, minWidth: pct > 0 ? '2px' : '0' }}
                    />
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
import type { SectorExposure } from '../../types';

interface Props { data: SectorExposure[] }

export function SectorTable({ data }: Props) {
  if (!data?.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-slate-400 dark:text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p className="text-sm font-bold text-slate-600 dark:text-white/40 font-display">No sector data available</p>
    </div>
  );

  // Sort by risk descending
  const sorted = [...data].sort((a, b) => b.avg_risk - a.avg_risk);

  return (
    <div className="w-full font-body">

      {/* ── Column header ── */}
      <div className="grid grid-cols-[2.5fr_4fr_100px_100px] gap-4 items-center
                      px-4 pb-3 mb-2
                      border-b border-slate-100 dark:border-white/5">
        {['Field', 'Risk Distribution', 'Avg Score', 'Students'].map((h, i) => (
          <p key={h}
            className={`text-[9px] font-bold uppercase tracking-[0.15em]
                        text-slate-400 dark:text-white/30 font-body
                        ${i >= 2 ? 'text-right' : ''}`}>
            {h}
          </p>
        ))}
      </div>

      {/* ── Rows ── */}
      <div className="space-y-1">
        {sorted.slice(0, 19).map((s, idx) => {
          const pct = s.avg_risk * 100;
          const isHigh = s.avg_risk >= 0.75;
          const isMid = s.avg_risk >= 0.55;

          // Note: Removed the riskCls calculation as it was only used for the left border

          const barColor = isHigh ? 'bg-red-500' : isMid ? 'bg-amber-400' : 'bg-emerald-500';
          const barGlow = isHigh
            ? 'shadow-[0_0_8px_rgba(239,68,68,0.5)]'
            : isMid
              ? 'shadow-[0_0_8px_rgba(245,158,11,0.4)]'
              : 'shadow-[0_0_8px_rgba(16,185,129,0.4)]';
          const scoreColor = isHigh
            ? 'text-red-600 dark:text-red-400'
            : isMid
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-emerald-600 dark:text-emerald-400';
          const badgeBg = isHigh
            ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400'
            : isMid
              ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400';

          return (
            <div
              key={s.field}
              // Removed `sector-row` and `${riskCls}` here
              className={`grid grid-cols-[2.5fr_4fr_100px_100px] gap-4 items-center
                          px-4 py-3 rounded-xl transition-colors
                          hover:bg-slate-50/50 dark:hover:bg-white/[0.02]`}
              style={{ animationDelay: `${idx * 35}ms` }}
            >
              {/* Field name */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank number */}
                <span className="shrink-0 w-6 h-6 rounded-md
                                 bg-slate-100 dark:bg-white/5
                                 text-[10px] font-bold text-slate-500 dark:text-white/40
                                 flex items-center justify-center font-mono">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <span className="text-[13px] font-semibold text-slate-700 dark:text-white/90
                                 truncate font-display tracking-wide"
                  title={s.field}>
                  {s.field}
                </span>
              </div>

              {/* Bar + risk badge */}
              <div className="flex items-center gap-3">
                {/* Track */}
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bar-grow ${barColor} ${barGlow}`}
                    style={{
                      width: `${pct}%`,
                      minWidth: pct > 0 ? '4px' : '0',
                      animationDelay: `${idx * 35 + 100}ms`,
                    }}
                  />
                </div>
                {/* Risk tier badge */}
                <span className={`shrink-0 text-[9px] font-bold uppercase tracking-widest
                                  px-2.5 py-1 rounded-md border font-body ${badgeBg}`}>
                  {isHigh ? 'HIGH' : isMid ? 'MED' : 'LOW'}
                </span>
              </div>

              {/* Score */}
              <div className={`text-right font-mono text-sm font-bold ${scoreColor}`}>
                {pct.toFixed(1)}%
              </div>

              {/* Student count */}
              <div className="text-right">
                <span className="text-[13px] font-bold text-slate-700 dark:text-white/70 font-mono">
                  {s.student_count.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-white/30 ml-1.5 font-body uppercase tracking-wider">
                  students
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
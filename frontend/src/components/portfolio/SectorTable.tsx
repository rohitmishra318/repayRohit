import { useState } from 'react';
import type { SectorExposure } from '../../types';

interface Props { data: SectorExposure[] }

type SortMode = 'exposure' | 'risk' | 'count';

// Weighted exposure score — penalises single-student outliers
function exposureScore(s: SectorExposure): number {
  return s.avg_risk * Math.log10(s.student_count + 1);
}

export function SectorTable({ data }: Props) {
  const [sortMode, setSortMode] = useState<SortMode>('exposure');
  const [minStudents, setMinStudents] = useState(2);

  if (!data?.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-slate-400 dark:text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p className="text-sm font-bold text-slate-600 dark:text-white/40 font-display">
        No sector data available
      </p>
    </div>
  );

  // Filter + sort
  const filtered = data.filter(s => s.student_count >= minStudents);
  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === 'exposure') return exposureScore(b) - exposureScore(a);
    if (sortMode === 'risk') return b.avg_risk - a.avg_risk;
    return b.student_count - a.student_count;
  });

  const excluded = data.length - filtered.length;

  const SORT_OPTS: { key: SortMode; label: string }[] = [
    { key: 'exposure', label: 'Portfolio Exposure' },
    { key: 'risk', label: 'Avg Risk Score' },
    { key: 'count', label: 'Student Count' },
  ];

  const MIN_OPTS = [1, 2, 5, 10];

  return (
    <div className="w-full font-body">

      {/* ── Controls bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4
                      px-4 py-3 rounded-xl
                      bg-slate-50/80 dark:bg-white/[0.02]
                      border border-slate-100 dark:border-white/5">

        {/* Sort mode */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em]
                           text-slate-400 dark:text-white/25 font-body shrink-0">
            Sort by
          </span>
          <div className="flex gap-1">
            {SORT_OPTS.map(opt => (
              <button key={opt.key} onClick={() => setSortMode(opt.key)}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all font-body ${sortMode === opt.key
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                  : 'text-slate-500 dark:text-white/30 hover:text-slate-700 dark:hover:text-white/60 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5'
                  }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Min students filter */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em]
                           text-slate-400 dark:text-white/25 font-body shrink-0">
            Min students
          </span>
          <div className="flex gap-1">
            {MIN_OPTS.map(n => (
              <button key={n} onClick={() => setMinStudents(n)}
                className={`text-[10px] font-bold w-8 py-1.5 rounded-lg transition-all font-mono ${minStudents === n
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                  : 'text-slate-500 dark:text-white/30 hover:text-slate-700 dark:hover:text-white/60 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5'
                  }`}>
                {n}+
              </button>
            ))}
          </div>

          {/* Excluded count */}
          {excluded > 0 && (
            <span className="text-[9px] text-slate-400 dark:text-white/20 font-body ml-1">
              {excluded} sector{excluded !== 1 ? 's' : ''} hidden
            </span>
          )}
        </div>
      </div>

      {/* Exposure mode explanation banner */}
      {sortMode === 'exposure' && (
        <div className="flex items-start gap-2.5 mb-4 px-4 py-3 rounded-xl
                        bg-violet-50 dark:bg-violet-500/[0.06]
                        border border-violet-100 dark:border-violet-500/15">
          <svg className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 mt-0.5 shrink-0"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01" />
          </svg>
          <p className="text-[11px] text-violet-700 dark:text-violet-300/80 font-body leading-relaxed">
            <strong className="font-bold">Portfolio Exposure</strong> sorts by{' '}
            <code className="font-mono text-[10px] bg-violet-100 dark:bg-violet-500/15 px-1 py-0.5 rounded">
              avg_risk × log₁₀(students + 1)
            </code>
            {' '}— sectors with a single outlier borrower are ranked lower than high-risk sectors with many borrowers, reflecting actual lender exposure.
          </p>
        </div>
      )}

      {/* ── Column headers ── */}
      <div className="grid grid-cols-[2.5fr_4fr_110px_110px] gap-4 items-center
                      px-4 pb-3 mb-1
                      border-b border-slate-100 dark:border-white/5">
        {[
          { label: 'Field', align: '' },
          { label: 'Risk Distribution', align: '' },
          { label: 'Avg Score', align: 'text-right' },
          { label: 'Students', align: 'text-right' },
        ].map(h => (
          <p key={h.label}
            className={`text-[9px] font-bold uppercase tracking-[0.15em]
                        text-slate-400 dark:text-white/25 font-body ${h.align}`}>
            {h.label}
          </p>
        ))}
      </div>

      {/* ── Rows ── */}
      <div className="space-y-0.5">
        {sorted.map((s, idx) => {
          const pct = s.avg_risk * 100;
          const isHigh = s.avg_risk >= 0.75;
          const isMid = s.avg_risk >= 0.55;
          const expScore = exposureScore(s);

          const borderColor = isHigh
            ? 'border-l-red-500'
            : isMid
              ? 'border-l-amber-400'
              : 'border-l-emerald-500';

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

          // Single-student warning
          const isOutlier = s.student_count === 1;

          return (
            <div
              key={s.field}
              className={`grid grid-cols-[2.5fr_4fr_110px_110px] gap-4 items-center
                          pl-3 pr-4 py-3 rounded-xl transition-colors
                          ${isOutlier
                  ? 'opacity-60 hover:opacity-100'
                  : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'
                }`}
            >
              {/* Field name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0 w-6 h-6 rounded-md
                                 bg-slate-100 dark:bg-white/5
                                 text-[10px] font-bold text-slate-500 dark:text-white/40
                                 flex items-center justify-center font-mono">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-white/90
                                   truncate font-display tracking-wide block"
                    title={s.field}>
                    {s.field}
                  </span>
                  {/* Exposure score sub-label — only in exposure sort mode */}
                  {sortMode === 'exposure' && (
                    <span className="text-[9px] font-mono text-slate-400 dark:text-white/20">
                      exposure: {expScore.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Bar + badge */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} ${barGlow}`}
                    style={{ width: `${pct}%`, minWidth: pct > 0 ? '4px' : '0' }}
                  />
                </div>
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
              <div className="text-right flex flex-col items-end">
                <span className="text-[13px] font-bold text-slate-700 dark:text-white/70 font-mono">
                  {s.student_count.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-white/25 font-body uppercase tracking-wider">
                  {s.student_count === 1 ? 'student' : 'students'}
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      {sorted.length > 0 && (
        <div className="mt-4 px-4 py-3 rounded-xl
                        bg-slate-50/60 dark:bg-white/[0.015]
                        border border-slate-100 dark:border-white/5
                        flex items-center justify-between">
          <span className="text-[11px] text-slate-400 dark:text-white/25 font-body">
            Showing <strong className="text-slate-600 dark:text-white/50">{sorted.length}</strong> sectors
            {excluded > 0 && <> · <strong>{excluded}</strong> hidden (fewer than {minStudents} students)</>}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-white/25 font-body">
            Total: <strong className="text-slate-600 dark:text-white/50 font-mono">
              {sorted.reduce((sum, s) => sum + s.student_count, 0).toLocaleString()}
            </strong> borrowers
          </span>
        </div>
      )}

    </div>
  );
}
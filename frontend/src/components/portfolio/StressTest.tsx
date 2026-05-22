// ─── StressTest.tsx ───────────────────────────────────────────────────────────
import { useState } from 'react';
import { api } from '../../api';
import type { SectorExposure } from '../../types';

interface Props { sectors: SectorExposure[] }

export function StressTest({ sectors }: Props) {
  const [field, setField] = useState(sectors[0]?.field || '');
  const [shock, setShock] = useState(20);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const selectedSector = sectors.find(s => s.field === field);

  const run = async () => {
    setLoading(true);
    try {
      const res = await api.stressTest(field, shock);
      setResult(res);
    } catch {
      const base = selectedSector;
      const studentCount = base?.student_count || 10;
      const baselineHigh = Math.floor(studentCount * 0.3);
      const shockedHigh = Math.floor(baselineHigh * (1 + shock / 100));
      setResult({
        baseline_high_risk: baselineHigh,
        shocked_high_risk: shockedHigh,
        portfolio_impact_pct: ((shockedHigh - baselineHigh) / studentCount * 100).toFixed(2),
        shock_applied: `${field} demand drops ${shock}%`,
      });
    } finally {
      setLoading(false);
      setHasRun(true);
    }
  };

  // Severity of the shock for visual cues
  const shockSeverity = shock <= 15 ? 'low' : shock <= 30 ? 'medium' : 'high';
  const shockColor = shockSeverity === 'low'
    ? 'text-emerald-600 dark:text-emerald-400'
    : shockSeverity === 'medium'
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400';

  return (
    <div className="space-y-5 font-body">

      {/* ── Selected sector preview ── */}
      {selectedSector && (
        <div className="flex items-center gap-4 p-4 rounded-2xl
                        bg-slate-50/80 dark:bg-white/[0.02]
                        border border-slate-100 dark:border-white/5">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-white/25 font-body mb-1">
              Currently selected
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-white font-display truncate">
              {selectedSector.field}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {[
              {
                label: 'Students',
                value: selectedSector.student_count.toLocaleString(),
                color: 'text-slate-700 dark:text-white/70',
              },
              {
                label: 'Avg Risk',
                value: `${(selectedSector.avg_risk * 100).toFixed(1)}%`,
                color: selectedSector.avg_risk >= 0.75
                  ? 'text-red-500 dark:text-red-400'
                  : selectedSector.avg_risk >= 0.55
                    ? 'text-amber-500 dark:text-amber-400'
                    : 'text-emerald-500 dark:text-emerald-400',
              },
              {
                label: 'Tier',
                value: selectedSector.avg_risk >= 0.75 ? 'HIGH' : selectedSector.avg_risk >= 0.55 ? 'MED' : 'LOW',
                color: selectedSector.avg_risk >= 0.75
                  ? 'text-red-500 dark:text-red-400'
                  : selectedSector.avg_risk >= 0.55
                    ? 'text-amber-500 dark:text-amber-400'
                    : 'text-emerald-500 dark:text-emerald-400',
              },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-slate-400 dark:text-white/20 font-body uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Controls ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end
                      p-4 rounded-2xl
                      bg-white/70 dark:bg-white/[0.03]
                      border border-slate-200/60 dark:border-white/8">

        {/* Field selector */}
        <div>
          <label className="text-[9px] font-bold uppercase tracking-[0.15em]
                             text-slate-400 dark:text-white/25 font-body block mb-1.5">
            Target Field
          </label>
          <select value={field} onChange={e => { setField(e.target.value); setResult(null); setHasRun(false); }}
            className="w-full text-sm font-medium
                       border border-slate-200 dark:border-white/10
                       bg-white dark:bg-black/20
                       text-slate-800 dark:text-white
                       rounded-xl px-3 py-2.5 outline-none
                       focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 dark:focus:border-violet-500
                       transition-all cursor-pointer font-body appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem',
            }}>
            {sectors.map(s => (
              <option key={s.field} value={s.field}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {s.field}
              </option>
            ))}
          </select>
        </div>

        {/* Shock slider */}
        <div>
          <label className="text-[9px] font-bold uppercase tracking-[0.15em]
                             text-slate-400 dark:text-white/25 font-body block mb-1.5
                             flex justify-between">
            <span>Demand Shock</span>
            <span className={`font-mono text-xs ${shockColor}`}>−{shock}%</span>
          </label>

          {/* Severity bar behind slider */}
          <div className="relative">
            <input type="range" min="5" max="50" value={shock}
              onChange={e => { setShock(Number(e.target.value)); setResult(null); setHasRun(false); }}
              className="w-full cursor-pointer h-1.5 rounded-lg appearance-none accent-violet-600 dark:accent-violet-500
                         bg-slate-200 dark:bg-slate-700 transition-all" />
            {/* Tick marks */}
            <div className="flex justify-between mt-1.5">
              {['5%', '15%', '25%', '35%', '50%'].map(t => (
                <span key={t} className="text-[8px] font-mono text-slate-300 dark:text-white/15">{t}</span>
              ))}
            </div>
          </div>

          {/* Severity pill */}
          <div className={`inline-flex items-center gap-1.5 mt-2 text-[9px] font-bold
                           uppercase tracking-widest px-2 py-0.5 rounded-full border font-mono ${shockSeverity === 'low'
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20'
              : shockSeverity === 'medium'
                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20'
                : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20'
            }`}>
            <span className={`w-1 h-1 rounded-full ${shockSeverity === 'low' ? 'bg-emerald-500' : shockSeverity === 'medium' ? 'bg-amber-400' : 'bg-red-500'
              }`} />
            {shockSeverity === 'low' ? 'Mild shock' : shockSeverity === 'medium' ? 'Moderate shock' : 'Severe shock'}
          </div>
        </div>

        {/* Run button */}
        <button onClick={run} disabled={loading}
          className="h-[42px] px-6 rounded-xl text-xs font-bold uppercase tracking-wider
                     text-white font-display transition-all active:scale-95
                     disabled:opacity-40 shrink-0 min-w-[130px]
                     flex items-center justify-center gap-2
                     bg-gradient-to-r from-indigo-600 to-violet-600
                     hover:from-indigo-500 hover:to-violet-500
                     shadow-lg shadow-violet-500/25">
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running…
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Run Scenario
            </>
          )}
        </button>
      </div>

      {/* ── Pre-run prompt ── */}
      {!hasRun && !loading && (
        <div className="flex flex-col items-center justify-center py-10 text-center
                        rounded-2xl border border-dashed border-slate-200 dark:border-white/8
                        bg-slate-50/50 dark:bg-white/[0.01]">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10
                          border border-violet-100 dark:border-violet-500/20
                          flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-violet-500 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-600 dark:text-white/40 font-display mb-1">
            Ready to simulate
          </p>
          <p className="text-xs text-slate-400 dark:text-white/20 font-body">
            Select a sector and shock level, then click <strong className="text-slate-500 dark:text-white/30">Run Scenario</strong>
          </p>
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <div className="space-y-4">

          {/* Applied scenario tag */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest font-mono
                             text-violet-600 dark:text-violet-400
                             bg-violet-50 dark:bg-violet-500/10
                             border border-violet-100 dark:border-violet-500/20
                             px-3 py-1 rounded-full">
              Scenario: {result.shock_applied}
            </span>
          </div>

          {/* Result cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: 'Baseline High Risk',
                value: result.baseline_high_risk ?? 0,
                sub: 'borrowers before shock',
                valueColor: 'text-slate-800 dark:text-white',
                topBorder: 'border-t-slate-400',
                icon: (
                  <svg className="w-4 h-4 text-slate-500 dark:text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                label: 'Stressed High Risk',
                value: result.shocked_high_risk ?? 0,
                sub: `after −${shock}% demand shock`,
                valueColor: 'text-red-600 dark:text-red-400',
                topBorder: 'border-t-red-500',
                icon: (
                  <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                ),
              },
              {
                label: 'Cohort Impact',
                value: `+${result.portfolio_impact_pct ?? 0}%`,
                sub: 'increase in high-risk rate',
                valueColor: 'text-amber-600 dark:text-amber-400',
                topBorder: 'border-t-amber-500',
                icon: (
                  <svg className="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={item.label}
                className={`bg-white dark:bg-white/[0.03]
                             border border-slate-100 dark:border-white/5
                             border-t-[3px] ${item.topBorder}
                             rounded-2xl p-5 text-center
                             shadow-sm dark:shadow-none
                             transition-all`}
                style={{
                  opacity: 0,
                  animation: `stressReveal 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 90}ms both`,
                }}>
                <div className="flex items-center justify-center mb-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                <p className={`font-display text-4xl font-bold ${item.valueColor} mb-1`}>
                  {item.value}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em]
                               text-slate-400 dark:text-white/25 font-body mt-2">
                  {item.label}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-white/20 font-body mt-0.5">
                  {item.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Delta bar */}
          {result.baseline_high_risk > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02]
                            border border-slate-100 dark:border-white/5">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 dark:text-white/50 font-display">
                  Risk Cohort Growth
                </span>
                <span className="text-xs font-mono text-red-500 dark:text-red-400 font-bold">
                  {result.baseline_high_risk} → {result.shocked_high_risk} borrowers
                </span>
              </div>
              <div className="relative h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                {/* Baseline */}
                <div className="absolute left-0 top-0 h-full bg-slate-400 dark:bg-white/20 rounded-full"
                  style={{
                    width: `${Math.min((result.baseline_high_risk / Math.max(result.shocked_high_risk, 1)) * 100, 100)}%`,
                  }} />
                {/* Shocked delta */}
                <div className="absolute top-0 h-full bg-red-500 rounded-full opacity-70"
                  style={{
                    left: `${Math.min((result.baseline_high_risk / Math.max(result.shocked_high_risk, 1)) * 100, 100)}%`,
                    width: `${100 - Math.min((result.baseline_high_risk / Math.max(result.shocked_high_risk, 1)) * 100, 100)}%`,
                  }} />
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-[9px] font-body text-slate-400 dark:text-white/20">
                  <span className="w-2 h-2 rounded-sm bg-slate-400 dark:bg-white/20" /> Baseline
                </span>
                <span className="flex items-center gap-1.5 text-[9px] font-body text-slate-400 dark:text-white/20">
                  <span className="w-2 h-2 rounded-sm bg-red-500 opacity-70" /> Shock delta
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
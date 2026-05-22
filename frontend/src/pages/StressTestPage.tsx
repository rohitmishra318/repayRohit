// ─── StressTestPage.tsx ───────────────────────────────────────────────────────
import { usePortfolio } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { StressTest } from '../components/portfolio/StressTest';
import { Spinner } from '../components/shared/Spinner';

export function StressTestPage() {
  const { data: portfolio, isLoading } = usePortfolio();

  if (isLoading) return (
    <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812]">
      <Spinner label="Loading portfolio data..." size="lg" />
    </div>
  );

  if (!portfolio) return (
    <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812]">
      <p className="text-slate-500 dark:text-white/40 font-body font-medium">Failed to load portfolio data.</p>
    </div>
  );

  // Portfolio-level context stats shown on the page
  const totalStudents = portfolio.total_students ?? 0;
  const highRiskCount = portfolio.high_risk_count ?? 0;
  const avgRisk = portfolio.avg_risk_score ?? 0;
  const sectorCount = portfolio.sector_exposure?.length ?? 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;600&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .font-mono    { font-family: 'JetBrains Mono', monospace; }

        @keyframes stressReveal {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridPulse {
          0%,100% { opacity: 0.04; }
          50%      { opacity: 0.075; }
        }
        .stress-reveal { animation: stressReveal 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .grid-pulse    { animation: gridPulse 5s ease-in-out infinite; }

        .glass-card {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148,163,184,0.18);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04);
        }
        .dark .glass-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: none;
        }
      `}</style>

      <div className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 dark:bg-[#080812] font-body relative min-h-screen">

        {/* Ambient */}
        <div className="dark:block hidden fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="grid-pulse absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(139,92,246,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.07) 1px,transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
        </div>
        <div className="dark:hidden absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

        <div className="relative z-10">
          <PageHeader
            title="Scenario Stress Test"
            subtitle="Simulate market demand shocks to calculate portfolio impact"
          />
        </div>

        <div className="relative z-10 p-6 max-w-screen-xl mx-auto space-y-6 pb-20">

          {/* ── Context KPI strip ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stress-reveal" style={{ animationDelay: '0ms' }}>
            {[
              {
                label: 'Total Borrowers',
                value: totalStudents.toLocaleString(),
                sub: 'in active portfolio',
                color: 'text-slate-800 dark:text-white',
                iconBg: 'bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/15',
                iconColor: 'text-violet-500 dark:text-violet-400',
                topBorder: 'border-t-violet-500',
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                ),
              },
              {
                label: 'High Risk Borrowers',
                value: highRiskCount.toLocaleString(),
                sub: `${((highRiskCount / Math.max(totalStudents, 1)) * 100).toFixed(1)}% of portfolio`,
                color: 'text-red-500 dark:text-red-400',
                iconBg: 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/15',
                iconColor: 'text-red-500 dark:text-red-400',
                topBorder: 'border-t-red-500',
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                ),
              },
              {
                label: 'Portfolio Avg Risk',
                value: `${(avgRisk * 100).toFixed(1)}%`,
                sub: avgRisk >= 0.75 ? 'Portfolio at risk' : avgRisk >= 0.55 ? 'Moderate exposure' : 'Healthy portfolio',
                color: avgRisk >= 0.75 ? 'text-red-500 dark:text-red-400' : avgRisk >= 0.55 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400',
                iconBg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/15',
                iconColor: 'text-amber-500 dark:text-amber-400',
                topBorder: 'border-t-amber-500',
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                label: 'Sectors Tracked',
                value: sectorCount.toLocaleString(),
                sub: 'active industry fields',
                color: 'text-sky-600 dark:text-sky-400',
                iconBg: 'bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/15',
                iconColor: 'text-sky-500 dark:text-sky-400',
                topBorder: 'border-t-sky-500',
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
              },
            ].map((k, i) => (
              <div key={k.label}
                className={`glass-card rounded-2xl p-5 border-t-[3px] ${k.topBorder}
                            hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none
                            transition-all duration-200 stress-reveal`}
                style={{ animationDelay: `${i * 55}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em]
                                text-slate-400 dark:text-white/25 font-body">
                    {k.label}
                  </p>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center
                                   border ${k.iconBg} ${k.iconColor}`}>
                    {k.icon}
                  </div>
                </div>
                <p className={`font-display text-3xl font-bold ${k.color} mb-1`}>{k.value}</p>
                <p className="text-[11px] text-slate-400 dark:text-white/25 font-body">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Main simulator card ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Simulator — takes 2/3 width */}
            <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden stress-reveal"
              style={{ animationDelay: '240ms' }}>

              {/* Gradient header */}
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-5">
                <div className="flex items-center gap-2.5 mb-1">
                  <svg className="w-4 h-4 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h2 className="font-display text-base font-bold text-white">Demand Shock Simulator</h2>
                </div>
                <p className="text-xs text-indigo-200 font-body leading-relaxed">
                  Select a sector and drag the shock slider. The model recalculates how many borrowers cross into high-risk territory.
                </p>
              </div>

              <div className="p-6">
                {portfolio.sector_exposure.length > 0 ? (
                  <StressTest sectors={portfolio.sector_exposure} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-slate-400 dark:text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-600 dark:text-white/40 font-display">No sector data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: How it works + top risky sectors */}
            <div className="flex flex-col gap-5">

              {/* How it works */}
              <div className="glass-card rounded-2xl p-5 stress-reveal" style={{ animationDelay: '300ms' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em]
                               text-slate-400 dark:text-white/25 font-body mb-4">
                  How it works
                </p>
                <div className="space-y-4">
                  {[
                    {
                      step: '01',
                      title: 'Pick a sector',
                      body: 'Select any industry field from your active loan portfolio.',
                      color: 'text-violet-500 dark:text-violet-400',
                      bg: 'bg-violet-50 dark:bg-violet-500/10',
                    },
                    {
                      step: '02',
                      title: 'Set the shock',
                      body: 'Drag the slider to simulate a 5–50% drop in hiring demand for that sector.',
                      color: 'text-sky-500 dark:text-sky-400',
                      bg: 'bg-sky-50 dark:bg-sky-500/10',
                    },
                    {
                      step: '03',
                      title: 'Read the impact',
                      body: 'The model re-runs risk scores and shows how many borrowers cross into high-risk.',
                      color: 'text-emerald-500 dark:text-emerald-400',
                      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                    },
                  ].map(s => (
                    <div key={s.step} className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                        <span className={`text-[10px] font-bold font-mono ${s.color}`}>{s.step}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-white/70 font-display mb-0.5">{s.title}</p>
                        <p className="text-[11px] text-slate-400 dark:text-white/25 font-body leading-relaxed">{s.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 5 highest-risk sectors at a glance */}
              <div className="glass-card rounded-2xl p-5 stress-reveal flex-1" style={{ animationDelay: '360ms' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em]
                               text-slate-400 dark:text-white/25 font-body mb-4">
                  Most Vulnerable Sectors
                </p>
                <div className="space-y-3">
                  {[...portfolio.sector_exposure]
                    .filter(s => s.student_count >= 2)
                    .sort((a, b) => b.avg_risk - a.avg_risk)
                    .slice(0, 5)
                    .map((s, i) => {
                      const pct = s.avg_risk * 100;
                      const isHigh = s.avg_risk >= 0.75;
                      const isMid = s.avg_risk >= 0.55;
                      const barColor = isHigh ? 'bg-red-500' : isMid ? 'bg-amber-400' : 'bg-emerald-500';
                      const scoreColor = isHigh
                        ? 'text-red-500 dark:text-red-400'
                        : isMid ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400';
                      return (
                        <div key={s.field}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[9px] font-mono text-slate-400 dark:text-white/20 shrink-0">
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-700 dark:text-white/70 font-body truncate">
                                {s.field}
                              </span>
                            </div>
                            <span className={`text-[11px] font-bold font-mono shrink-0 ml-2 ${scoreColor}`}>
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
                <p className="text-[9px] text-slate-400 dark:text-white/15 font-body mt-3">
                  Sectors with ≥ 2 students · sorted by avg risk
                </p>
              </div>

            </div>
          </div>

          {/* ── Methodology note ── */}
          <div className="glass-card rounded-2xl px-6 py-4 stress-reveal flex items-start gap-3"
            style={{ animationDelay: '420ms' }}>
            <svg className="w-4 h-4 text-violet-500 dark:text-violet-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01" />
            </svg>
            <p className="text-[11px] text-slate-500 dark:text-white/35 font-body leading-relaxed">
              <strong className="font-bold text-slate-700 dark:text-white/60">Methodology:</strong> The simulator applies a multiplicative demand-shock factor
              {' '}(<code className="font-mono text-[10px] bg-slate-100 dark:bg-white/5 px-1 py-0.5 rounded">1 − shock%/100</code>)
              {' '}to each student's sector demand index, then re-evaluates XGBoost placement risk scores to count borrowers crossing the 0.75 high-risk threshold.
              Results are estimates — actual portfolio impact depends on student-level profile diversity within the sector.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
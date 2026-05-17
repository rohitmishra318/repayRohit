
import { usePortfolio } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { SectorTable } from '../components/portfolio/SectorTable';
import { Spinner } from '../components/shared/Spinner';

export function SectorRiskPage() {
  const { data: portfolio, isLoading } = usePortfolio();

  if (isLoading) return <Spinner label="Loading portfolio data..." size="lg" />;
  if (!portfolio)
    return <p className="p-6 text-slate-400 dark:text-slate-500">Failed to load portfolio data.</p>;

  // Derived summary stats
  const sectors = portfolio.sector_exposure;
  const highRisk = sectors.filter(s => s.avg_risk >= 0.75).length;
  const mediumRisk = sectors.filter(s => s.avg_risk >= 0.55 && s.avg_risk < 0.75).length;
  const lowRisk = sectors.filter(s => s.avg_risk < 0.55).length;
  const avgPortfolioRisk = sectors.length
    ? sectors.reduce((sum, s) => sum + s.avg_risk, 0) / sectors.length
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;600&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .font-mono    { font-family: 'JetBrains Mono', monospace; }

        @keyframes sectorReveal {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes barGrow {
          from { width: 0 !important; }
        }
        @keyframes orbDrift {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(25px,-18px) scale(1.05); }
        }
        @keyframes gridPulse {
          0%,100% { opacity: 0.04; }
          50%      { opacity: 0.075; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .sector-reveal { animation: sectorReveal 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .bar-grow      { animation: barGrow 0.9s cubic-bezier(0.22,1,0.36,1) both; }
        .orb-drift     { animation: orbDrift 14s ease-in-out infinite; }
        .grid-pulse    { animation: gridPulse 5s ease-in-out infinite; }
        .count-up      { animation: countUp 0.5s ease both; }

        /* glass card — dual theme */
        .glass-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148,163,184,0.18);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04);
        }
        .dark .glass-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: none;
        }

        /* stat card accents */
        .stat-high   { border-top: 3px solid #ef4444; }
        .stat-medium { border-top: 3px solid #f59e0b; }
        .stat-low    { border-top: 3px solid #10b981; }
        .stat-avg    { border-top: 3px solid #8b5cf6; }

        /* sector row */
        .sector-row {
          border-left: 3px solid transparent;
          transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
        }
        .sector-row:hover {
          background: rgba(99,102,241,0.04);
          border-left-color: rgba(124,58,237,0.35);
          box-shadow: inset 0 0 0 1px rgba(139,92,246,0.1);
        }
        .dark .sector-row:hover {
          background: rgba(139,92,246,0.05);
          border-left-color: rgba(139,92,246,0.5);
        }
        .sector-row.high-risk   { border-left-color: rgba(239,68,68,0.4); }
        .sector-row.medium-risk { border-left-color: rgba(245,158,11,0.4); }
        .sector-row.low-risk    { border-left-color: rgba(16,185,129,0.4); }
      `}</style>

      <div className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 dark:bg-[#080812] font-body relative">

        {/* ── Dark ambient layer ── */}
        <div className="dark:block hidden fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="grid-pulse absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(139,92,246,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.07) 1px,transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
        </div>

        {/* ── Light ambient grid ── */}
        <div className="dark:hidden absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

        <div className="relative z-10">
          <PageHeader
            title="Sector Risk Exposure"
            subtitle="Detailed breakdown of portfolio risk across target industries"
          />
        </div>

        <div className="relative z-10 p-6 max-w-screen-xl mx-auto space-y-6">

          {/* ── Summary stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sector-reveal" style={{ animationDelay: '0ms' }}>
            {[
              {
                cls: 'stat-high',
                icon: (
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                ),
                label: 'High Risk Sectors',
                value: highRisk,
                sub: 'avg_risk ≥ 75%',
                valueColor: 'text-red-500 dark:text-red-400',
              },
              {
                cls: 'stat-medium',
                icon: (
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
                  </svg>
                ),
                label: 'Medium Risk Sectors',
                value: mediumRisk,
                sub: '55% ≤ avg_risk < 75%',
                valueColor: 'text-amber-500 dark:text-amber-400',
              },
              {
                cls: 'stat-low',
                icon: (
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                label: 'Low Risk Sectors',
                value: lowRisk,
                sub: 'avg_risk < 55%',
                valueColor: 'text-emerald-500 dark:text-emerald-400',
              },
              {
                cls: 'stat-avg',
                icon: (
                  <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                label: 'Portfolio Avg Risk',
                value: `${(avgPortfolioRisk * 100).toFixed(1)}%`,
                sub: 'across all sectors',
                valueColor: 'text-violet-600 dark:text-violet-400',
              },
            ].map((card, i) => (
              <div
                key={card.label}
                className={`glass-card ${card.cls} rounded-2xl p-5 sector-reveal`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5
                                  flex items-center justify-center">
                    {card.icon}
                  </div>
                </div>
                <p className={`font-display text-2xl font-bold ${card.valueColor} count-up`}
                  style={{ animationDelay: `${i * 60 + 200}ms` }}>
                  {card.value}
                </p>
                <p className="text-xs font-semibold text-slate-700 dark:text-white/70 font-body mt-1">
                  {card.label}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-white/25 font-body mt-0.5 font-mono">
                  {card.sub}
                </p>
              </div>
            ))}
          </div>

          {/* ── Main sector table card ── */}
          <div className="glass-card rounded-2xl overflow-hidden sector-reveal" style={{ animationDelay: '260ms' }}>

            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-5
                            border-b border-slate-100 dark:border-white/5">
              <div>
                <p className="font-display text-base font-bold text-slate-800 dark:text-white tracking-tight">
                  Sector Analysis
                </p>
                <p className="text-xs text-slate-400 dark:text-white/30 font-body mt-0.5">
                  Sorted by average risk score · {sectors.length} active sectors
                </p>
              </div>

              {/* Legend */}
              <div className="hidden sm:flex items-center gap-5 text-xs font-body">
                {[
                  { color: 'bg-red-500', label: 'High ≥ 75%' },
                  { color: 'bg-amber-400', label: 'Medium 55–75%' },
                  { color: 'bg-emerald-500', label: 'Low < 55%' },
                ].map(l => (
                  <span key={l.label} className="flex items-center gap-1.5 text-slate-500 dark:text-white/30">
                    <span className={`w-2 h-2 rounded-full ${l.color}`} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="p-4">
              <SectorTable data={portfolio.sector_exposure} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
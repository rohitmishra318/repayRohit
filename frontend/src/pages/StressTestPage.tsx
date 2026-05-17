import { usePortfolio } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { StressTest } from '../components/portfolio/StressTest';
import { Spinner } from '../components/shared/Spinner';

export function StressTestPage() {
  const { data: portfolio, isLoading } = usePortfolio();

  if (isLoading) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812]">
        <Spinner label="Loading portfolio data..." size="lg" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812]">
        <p className="p-6 text-slate-500 dark:text-slate-400 font-medium font-body">Failed to load portfolio data.</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Golden Standard Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;600&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .font-mono    { font-family: 'JetBrains Mono', monospace; }

        @keyframes sectorReveal {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbDrift {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(25px,-18px) scale(1.05); }
        }
        @keyframes gridPulse {
          0%,100% { opacity: 0.04; }
          50%      { opacity: 0.075; }
        }

        .sector-reveal { animation: sectorReveal 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .orb-drift     { animation: orbDrift 14s ease-in-out infinite; }
        .grid-pulse    { animation: gridPulse 5s ease-in-out infinite; }

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
      `}</style>

      <div className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 dark:bg-[#080812] font-body relative min-h-screen flex flex-col">

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

        <div className="relative z-10 shrink-0">
          <PageHeader
            title="Scenario Stress Test"
            subtitle="Simulate market demand shocks to calculate portfolio impact"
          />
        </div>

        <div className="relative z-10 p-6 flex-1 w-full max-w-5xl mx-auto flex flex-col justify-center pb-20">

          <div className="glass-card rounded-3xl flex flex-col min-h-[500px] p-8 md:p-10 sector-reveal" style={{ animationDelay: '100ms' }}>

            <div className="mb-8 border-b border-slate-200/60 dark:border-white/10 pb-6">
              <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white mb-3">
                Demand Shock Simulator
              </h2>
              <p className="text-[15px] leading-relaxed text-slate-500 dark:text-white/60 font-body max-w-3xl">
                Adjust the parameters below to simulate a sudden drop in industry hiring demand. The simulator calculates the estimated increase in the high-risk cohort size and overall portfolio impact based on your inputs.
              </p>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              {portfolio.sector_exposure.length > 0 ? (
                <StressTest sectors={portfolio.sector_exposure} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-white/30 space-y-3">
                  <span className="text-4xl opacity-50">📊</span>
                  <p className="font-medium tracking-wide">No sector data available for simulation.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
import { useSession } from '../context/SessionContext';
import { useRisk, useInterventions } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { Spinner } from '../components/shared/Spinner';
import { RiskGauge } from '../components/student/RiskGauge';
import { ShapDrivers } from '../components/student/ShapDrivers';
import { InterventionCards } from '../components/student/InterventionCards';
import { RiskBadge } from '../components/shared/RiskBadge';

export function StudentDashboard() {
  // 1. Grab the dynamic student object and the overall auth loading state
  const { student, isLoading: authLoading } = useSession();

  // 2. Extract SID safely (default to empty string if still loading)
  const SID = student?.student_id || '';

  // 3. Pass the dynamic SID to your hooks
  const { data: risk, isLoading: rLoading, isError: rError } = useRisk(SID);
  const { data: interventionData, isLoading: iLoading } = useInterventions(SID);

  // 4. Handle the Auth loading state BEFORE the Risk loading state
  if (authLoading) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812]">
        <Spinner size="lg" label="Authenticating student session..." />
      </div>
    );
  }

  // 5. If they aren't logged in, don't try to render the dashboard
  if (!student) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812] text-slate-500 dark:text-white/40 font-body font-medium">
        Please log in to view your dashboard.
      </div>
    );
  }

  // Handle loading state for the entire page core metrics
  if (rLoading || iLoading) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812]">
        <Spinner size="lg" label="Loading live risk profile..." />
      </div>
    );
  }

  // Handle Error state if the backend is unreachable
  if (rError || !risk) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812] p-6">
        <div className="p-8 text-center max-w-md w-full bg-white/80 dark:bg-white/[0.02] backdrop-blur-md rounded-3xl border border-red-200/50 dark:border-red-900/30 shadow-xl shadow-red-500/5">
          <div className="text-red-500 mb-4 text-5xl">⚠️</div>
          <h2 className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white mb-2">Connection Interrupted</h2>
          <p className="text-[13px] text-slate-500 dark:text-white/50 font-body leading-relaxed">We couldn't reach the server to fetch your live risk data. Please refresh or check your connection.</p>
        </div>
      </div>
    );
  }

  const interventions = interventionData?.interventions || [];
  const tier = risk.risk_score >= 0.75 ? 'HIGH' : risk.risk_score >= 0.55 ? 'MEDIUM' : 'LOW';

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

      <div className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 dark:bg-[#080812] font-body relative min-h-screen">

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
            title="My Risk Dashboard"
            subtitle={`${student.name} · ${student.course}`}
            actions={<RiskBadge tier={tier} score={risk.risk_score} size="md" />}
          />
        </div>

        <div className="relative z-10 p-6 max-w-[1400px] mx-auto space-y-6 pb-20">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ==============================================================
                COLUMN 1: RISK GAUGE & DATA
            ============================================================== */}
            <div className="glass-card flex flex-col h-full rounded-3xl p-7 md:p-9 relative overflow-hidden sector-reveal" style={{ animationDelay: '0ms' }}>

              <h2 className="text-[13px] font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-8 font-display">Placement Risk</h2>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <RiskGauge score={risk.risk_score} label={`CI: ${(risk.ci_lower * 100).toFixed(0)}%–${(risk.ci_upper * 100).toFixed(0)}%`} />

                  {/* ── Internal Data Grid ── */}
                  <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-white/10 flex flex-col gap-6">

                    {/* Top Row: Quick Financials */}
                    <div className="grid grid-cols-2 gap-x-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest font-display mb-1.5">Repayment Stress</p>
                        <p className={`text-sm font-bold font-mono ${risk.repayment_stress_index >= 0.7 ? 'text-red-600 dark:text-red-400' :
                            risk.repayment_stress_index >= 0.5 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                          {risk.repayment_stress_label || 'MODERATE'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest font-display mb-1.5">Monthly EMI</p>
                        <p className="text-sm font-bold font-mono text-slate-800 dark:text-white">
                          ₹{(student?.loan_emi_monthly || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Visual Indicators Sub-Card */}
                    <div className="flex flex-col gap-5 p-5 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5">

                      {/* 1. Est Salary Range Visual */}
                      <div>
                        <div className="flex justify-between items-end mb-2.5">
                          <p className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest font-display">Est. Salary Range</p>
                          <p className="text-[13px] font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            ₹{(risk.predicted_salary_lower / 100000).toFixed(1)}–{(risk.predicted_salary_upper / 100000).toFixed(1)}L
                          </p>
                        </div>
                        <div className="relative w-full h-1.5 bg-slate-200/80 dark:bg-white/10 rounded-full overflow-hidden">
                          {/* Calculate dynamic width based on an assumed 15L ceiling for visual scaling */}
                          <div
                            className="absolute h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                            style={{
                              left: `${Math.min(80, (risk.predicted_salary_lower / 1500000) * 100)}%`,
                              width: `${Math.min(100, ((risk.predicted_salary_upper - risk.predicted_salary_lower) / 1500000) * 100)}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-[9px] font-bold font-mono text-slate-400 dark:text-white/30 uppercase tracking-widest">
                          <span>Min Base</span>
                          <span>Market Top</span>
                        </div>
                      </div>

                      {/* 2. Data Trust Weight Visual */}
                      <div className="pt-1">
                        <div className="flex justify-between items-end mb-2.5">
                          <p className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest font-display">Data Trust Weight</p>
                          <p className="text-[13px] font-bold font-mono text-slate-800 dark:text-white">
                            {(risk.data_trust_weight * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200/80 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.4)] transition-all duration-1000 ease-out"
                            style={{ width: `${risk.data_trust_weight * 100}%` }}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Human Review Note */}
                {risk.needs_human_review && (
                  <div className="mt-6 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/80 dark:border-amber-800/30 rounded-2xl p-4 flex items-start gap-3">
                    <span className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </span>
                    <span className="text-[12px] font-medium text-amber-800 dark:text-amber-300 leading-relaxed font-body">
                      Wide uncertainty limits detected. Manual counselor review is recommended.
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* ==============================================================
                COLUMN 2: DRIVERS & INTERVENTIONS
            ============================================================== */}
            <div className="flex flex-col gap-6">

              {/* SHAP Drivers */}
              <div className="glass-card flex flex-col rounded-3xl p-7 md:p-8 sector-reveal" style={{ animationDelay: '100ms' }}>
                <h2 className="text-[13px] font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-1 font-display">Risk Drivers</h2>
                <p className="text-[13px] text-slate-500 dark:text-white/40 mb-6 font-body font-medium">Variables impacting your current score</p>
                <div className="flex-1 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl p-5 border border-slate-100 dark:border-white/5">
                  <ShapDrivers drivers={risk.shap_drivers} />
                </div>
              </div>

              {/* Interventions */}
              <div className="glass-card flex-1 flex flex-col rounded-3xl p-7 md:p-8 sector-reveal" style={{ animationDelay: '200ms' }}>
                <h2 className="text-[13px] font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-1 font-display">Recommended Actions</h2>
                <p className="text-[13px] text-slate-500 dark:text-white/40 mb-6 font-body font-medium">Ranked by placement lift estimate</p>
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
                  <InterventionCards interventions={interventions} />
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
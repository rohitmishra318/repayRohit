import { useSession } from '../context/SessionContext';
import { useRisk, useInterventions } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { Spinner } from '../components/shared/Spinner';
import { RiskGauge } from '../components/student/RiskGauge';
import { ShapDrivers } from '../components/student/ShapDrivers';
import { InterventionCards } from '../components/student/InterventionCards';
import { RiskBadge } from '../components/shared/RiskBadge';

export function StudentDashboard() {
  const { student, isLoading: authLoading } = useSession();
  const SID = student?.student_id || '';
  const { data: risk, isLoading: rLoading, isError: rError } = useRisk(SID);
  const { data: interventionData, isLoading: iLoading } = useInterventions(SID);

  if (authLoading) return (
    <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812]">
      <Spinner size="lg" label="Authenticating student session..." />
    </div>
  );

  if (!student) return (
    <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812] text-slate-500 dark:text-white/40 font-body font-medium">
      Please log in to view your dashboard.
    </div>
  );

  if (rLoading || iLoading) return (
    <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812]">
      <Spinner size="lg" label="Loading live risk profile..." />
    </div>
  );

  if (rError || !risk) return (
    <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812] p-6">
      <div className="p-8 text-center max-w-md w-full bg-white/80 dark:bg-white/[0.02] backdrop-blur-md rounded-3xl border border-red-200/50 dark:border-red-900/30">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-2">Connection Interrupted</h2>
        <p className="text-sm text-slate-500 dark:text-white/50 font-body leading-relaxed">
          We couldn't reach the server to fetch your live risk data. Please refresh or check your connection.
        </p>
      </div>
    </div>
  );

  const interventions = interventionData?.interventions || [];
  const tier = risk.risk_score >= 0.75 ? 'HIGH' : risk.risk_score >= 0.55 ? 'MEDIUM' : 'LOW';

  // Derived profile completeness signal
  const profileSignals = [
    { label: 'CGPA', ok: (student.cgpa || 0) >= 3.0, val: `${student.cgpa?.toFixed(2) ?? '—'} / 4.0` },
    { label: 'Internships', ok: (student.internship_count || 0) >= 1, val: `${student.internship_count ?? 0}` },
    { label: 'Certifications', ok: (student.cert_count || 0) >= 2, val: `${student.cert_count ?? 0}` },
    { label: 'PPO', ok: student.ppo_exists === true, val: student.ppo_exists ? 'Secured' : 'None' },
  ];

  // Placement probability tiers from survival data
  const placementProbs = [
    { label: '3 months', prob: risk.survival_3mo ?? 0.3 },
    { label: '6 months', prob: risk.survival_6mo ?? 0.6 },
    { label: '12 months', prob: risk.survival_12mo ?? 0.85 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;600&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .font-mono    { font-family: 'JetBrains Mono', monospace; }

        @keyframes dashReveal {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridPulse {
          0%,100% { opacity: 0.04; }
          50%      { opacity: 0.075; }
        }
        @keyframes barFill {
          from { width: 0 !important; }
        }

        .dash-reveal { animation: dashReveal 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .grid-pulse  { animation: gridPulse 5s ease-in-out infinite; }
        .bar-fill    { animation: barFill 0.9s cubic-bezier(0.22,1,0.36,1) both; }

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

        <div className="relative z-10 shrink-0">
          <PageHeader
            title="My Risk Dashboard"
            subtitle={`${student.name} · ${student.course_type ?? ''}`}
            actions={<RiskBadge tier={tier} score={risk.risk_score} size="md" />}
          />
        </div>

        <div className="relative z-10 p-6 max-w-[1400px] mx-auto space-y-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ══ LEFT COLUMN ═══════════════════════════════════════════════ */}
            <div className="flex flex-col gap-5">

              {/* Risk Gauge card */}
              <div className="glass-card rounded-3xl p-7 dash-reveal" style={{ animationDelay: '0ms' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-[0.15em] font-display">
                    Placement Risk Score
                  </h2>
                  <span className="text-[9px] font-mono text-slate-400 dark:text-white/20 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                    CI: {(risk.ci_lower * 100).toFixed(0)}%–{(risk.ci_upper * 100).toFixed(0)}%
                  </span>
                </div>
                <RiskGauge score={risk.risk_score} label={`CI: ${(risk.ci_lower * 100).toFixed(0)}%–${(risk.ci_upper * 100).toFixed(0)}%`} />

                {/* Human review alert inside gauge card */}
                {risk.needs_human_review && (
                  <div className="mt-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-4 flex items-start gap-3">
                    <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed font-body">
                      Wide uncertainty limits detected. Manual counselor review recommended.
                    </p>
                  </div>
                )}
              </div>

              {/* Financial snapshot */}
              <div className="glass-card rounded-3xl p-6 dash-reveal" style={{ animationDelay: '70ms' }}>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em]
                               text-slate-400 dark:text-white/25 font-display mb-4">
                  Financial Snapshot
                </p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    {
                      label: 'Repayment Stress',
                      value: risk.repayment_stress_label || 'MODERATE',
                      color: risk.repayment_stress_index >= 0.7
                        ? 'text-red-600 dark:text-red-400'
                        : risk.repayment_stress_index >= 0.5
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400',
                      bg: risk.repayment_stress_index >= 0.7
                        ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/15'
                        : risk.repayment_stress_index >= 0.5
                          ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/15'
                          : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/15',
                    },
                    {
                      label: 'Monthly EMI',
                      value: `₹${(student?.loan_emi_monthly || 0).toLocaleString('en-IN')}`,
                      color: 'text-slate-800 dark:text-white',
                      bg: 'bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5',
                    },
                  ].map(s => (
                    <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
                      <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400 dark:text-white/25 font-body mb-1.5">{s.label}</p>
                      <p className={`text-base font-bold font-mono ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Salary range bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-[0.13em] font-display">Est. Salary Range</p>
                    <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{(risk.predicted_salary_lower / 100000).toFixed(1)}–{(risk.predicted_salary_upper / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div className="relative w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="bar-fill absolute h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                      style={{
                        left: `${Math.min(75, (risk.predicted_salary_lower / 1500000) * 100)}%`,
                        width: `${Math.min(25, ((risk.predicted_salary_upper - risk.predicted_salary_lower) / 1500000) * 100)}%`,
                      }} />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[8px] font-mono text-slate-300 dark:text-white/15 uppercase tracking-wider">
                    <span>₹0</span><span>₹7.5L</span><span>₹15L</span>
                  </div>
                </div>

                {/* Data trust bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-[0.13em] font-display">Data Trust Weight</p>
                    <p className="text-sm font-bold font-mono text-violet-600 dark:text-violet-400">
                      {(risk.data_trust_weight * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="bar-fill h-full bg-violet-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                      style={{ width: `${risk.data_trust_weight * 100}%` }} />
                  </div>
                </div>
              </div>


              {/* Profile signal health */}
              <div className="glass-card rounded-3xl p-6 dash-reveal" style={{ animationDelay: '210ms' }}>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em]
                               text-slate-400 dark:text-white/25 font-display mb-4">
                  Profile Signal Health
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {profileSignals.map((s, i) => (
                    <div key={s.label}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors
                        ${s.ok
                          ? 'bg-emerald-50 dark:bg-emerald-500/8 border-emerald-100 dark:border-emerald-500/15'
                          : 'bg-rose-50 dark:bg-rose-500/8 border-rose-100 dark:border-rose-500/15'
                        }`}
                      style={{ opacity: 0, animation: `dashReveal 0.5s cubic-bezier(0.22,1,0.36,1) ${280 + i * 60}ms both` }}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${s.ok ? 'bg-emerald-100 dark:bg-emerald-500/15' : 'bg-rose-100 dark:bg-rose-500/15'
                        }`}>
                        {s.ok ? (
                          <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-white/25 font-body">{s.label}</p>
                        <p className={`text-sm font-bold font-mono truncate ${s.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>{s.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ══ RIGHT COLUMN ══════════════════════════════════════════════ */}
            <div className="flex flex-col gap-5">

              {/* SHAP Drivers */}
              <div className="glass-card rounded-3xl p-7 dash-reveal" style={{ animationDelay: '100ms' }}>
                <h2 className="text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-[0.15em] font-display mb-1">
                  Risk Drivers
                </h2>
                <p className="text-xs text-slate-400 dark:text-white/25 font-body mb-5">
                  Variables impacting your current score
                </p>
                <div className="bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl p-5 border border-slate-100 dark:border-white/5">
                  <ShapDrivers drivers={risk.shap_drivers} />
                </div>
              </div>

              {/* Interventions */}
              <div className="glass-card flex-1 rounded-3xl p-7 dash-reveal" style={{ animationDelay: '180ms' }}>
                <h2 className="text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-[0.15em] font-display mb-1">
                  Recommended Actions
                </h2>
                <p className="text-xs text-slate-400 dark:text-white/25 font-body mb-5">
                  Ranked by placement lift estimate
                </p>
                <div className="overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
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
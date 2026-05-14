import { useParams, useNavigate } from 'react-router-dom';
import { useStudent, useRisk, useRiskCard, useInterventions, useAlerts } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/shared/Card';
import { Spinner } from '../components/shared/Spinner';
import { RiskBadge } from '../components/shared/RiskBadge';
import { PlacementTimeline } from '../components/student/PlacementTimeline';
import { ShapDrivers } from '../components/student/ShapDrivers';
import { InterventionCards } from '../components/student/InterventionCards';
import { RiskGauge } from '../components/student/RiskGauge';
import ReactMarkdown from 'react-markdown';

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: student, isLoading: sLoading } = useStudent(id);
  const { data: risk, isLoading: rLoading } = useRisk(id);
  const { data: riskCard, isLoading: cardLoading } = useRiskCard(id);
  const { data: interventions } = useInterventions(id);
  const { data: alertsList } = useAlerts('triggered');

  if (sLoading || rLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/50">
        <Spinner label="Loading student risk profile..." size="lg" />
      </div>
    );
  }

  if (!student) return <div className="p-10 text-center text-slate-500 font-medium">Student record not found.</div>;
  if (!risk) return <div className="p-10 text-center text-slate-500 font-medium">Risk data unavailable for this student.</div>;

  const tier = risk.risk_score >= 0.75 ? 'HIGH' : risk.risk_score >= 0.55 ? 'MEDIUM' : 'LOW' as 'HIGH' | 'MEDIUM' | 'LOW';
  const studentAlerts = (alertsList || []).filter((a: any) => a.student_id === id);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;600&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .font-mono    { font-family: 'JetBrains Mono', monospace; }

        @keyframes cardReveal {
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

        .card-reveal { animation: cardReveal 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .orb-drift   { animation: orbDrift 14s ease-in-out infinite; }
        .grid-pulse  { animation: gridPulse 5s ease-in-out infinite; }

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
          <div className="orb-drift absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 70%)' }} />
          <div className="orb-drift absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', animationDelay: '-7s' }} />
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
            title={student.name}
            subtitle={`${student.course_type} · ${student.target_field} · ${student.months_since_graduation}mo post-grad`}
            actions={
              <div className="flex items-center gap-4">
                <RiskBadge tier={tier} score={risk.risk_score} size="md" />
                <button onClick={() => navigate(-1)}
                  className="text-sm font-bold font-display text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200/80 dark:border-white/10 px-4 py-2 rounded-xl shadow-sm dark:shadow-none transition-all backdrop-blur-sm">
                  ← Back to List
                </button>
              </div>
            }
          />
        </div>

        <div className="relative z-10 p-6 max-w-[1600px] mx-auto space-y-6">

          {/* Adjusted Grid: Better responsiveness for complex cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 items-stretch">

            {/* ==============================================================
                COLUMN 1: PROFESSIONAL CANDIDATE DATA SHEET (Redesigned)
            ============================================================== */}
            <div className="col-span-1 md:col-span-1 xl:col-span-3 flex flex-col card-reveal" style={{ animationDelay: '0ms' }}>
              <div className="glass-card rounded-3xl h-full flex flex-col p-6 lg:p-8">

                {/* Header without image */}
                <div className="mb-6 pb-5 border-b border-slate-100 dark:border-white/5">
                  <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-1">
                    {student.name}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 font-display">
                    {student.course_type}
                  </p>

                  {/* Status Pill */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider border font-display ${student.placement_status === 'placed'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${student.placement_status === 'placed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                    {student.placement_status}
                  </div>
                </div>

                {/* Data Rows */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-4 font-display">Core Metrics</h3>

                  <div className="space-y-3.5 flex-1 font-body">
                    {[
                      { label: 'Institute Tier', value: student.institute_tier },
                      { label: 'Cumulative GPA', value: student.cgpa?.toFixed(2), highlight: true },
                      { label: 'Internship Base', value: student.internship_employer_tier },
                      { label: 'PPO Status', value: student.ppo_exists ? 'Secured' : 'None' },
                      { label: 'Certifications', value: student.cert_count },
                      { label: 'Monthly EMI', value: `₹${Number(student.loan_emi_monthly).toLocaleString('en-IN')}` },
                      { label: 'Target City', value: `Tier ${student.target_city_tier}` },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center group">
                        <span className="text-[13px] text-slate-500 dark:text-white/40">{item.label}</span>
                        <span className={`text-[13px] font-medium ${item.highlight ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-white/70'}`}>
                          {item.value ?? '—'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer stat */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02] p-3 rounded-xl">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest font-display">Data Trust</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white font-mono">
                      {((student.data_trust_score || 0.5) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ==============================================================
                COLUMN 2: RISK ANALYTICS
            ============================================================== */}
            <div className="col-span-1 md:col-span-1 xl:col-span-3 space-y-6 flex flex-col h-full card-reveal" style={{ animationDelay: '100ms' }}>
              <div className="glass-card rounded-3xl flex-1 flex flex-col justify-center p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
                <h2 className="text-lg font-bold font-display tracking-tight text-slate-800 dark:text-white mb-5">Current Risk Score</h2>
                <RiskGauge score={risk.risk_score} label={`CI: ${(risk.ci_lower * 100).toFixed(0)}%–${(risk.ci_upper * 100).toFixed(0)}%`} />

                {risk.needs_human_review && (
                  <div className="mt-5 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/80 dark:border-amber-800/30 rounded-xl p-4 text-xs text-amber-800 dark:text-amber-400 flex items-start gap-2">
                    <span className="text-base leading-none">⚠</span>
                    <span className="font-medium leading-relaxed font-body">Wide uncertainty limits detected. Manual counselor review is recommended.</span>
                  </div>
                )}
              </div>

              <div className="glass-card rounded-3xl flex-1 flex flex-col p-6 lg:p-8">
                <h2 className="text-lg font-bold font-display tracking-tight text-slate-800 dark:text-white mb-1">Placement Timeline</h2>
                <p className="text-[13px] text-slate-500 dark:text-white/50 mb-5 font-body font-medium">Probability over time</p>
                <div className="flex-1 flex items-center justify-center bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                  <PlacementTimeline p_3mo={risk.p_3mo} p_6mo={risk.p_6mo} p_12mo={risk.p_12mo} />
                </div>
              </div>
            </div>

            {/* ==============================================================
                COLUMN 3: AI & CAUSAL DRIVERS
            ============================================================== */}
            <div className="col-span-1 md:col-span-1 xl:col-span-3 space-y-6 flex flex-col h-full card-reveal" style={{ animationDelay: '200ms' }}>
              <div className="glass-card rounded-3xl flex-1 flex flex-col p-6 lg:p-8">
                <h2 className="text-lg font-bold font-display tracking-tight text-slate-800 dark:text-white mb-1">Risk Drivers (SHAP)</h2>
                <p className="text-[13px] text-slate-500 dark:text-white/50 mb-5 font-body font-medium">Key causal variables</p>
                <div className="flex-1 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                  <ShapDrivers drivers={risk.shap_drivers} />
                </div>
              </div>

              <div className="glass-card rounded-3xl flex-1 flex flex-col p-6 lg:p-8 border-t-4 border-t-violet-500 relative overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold font-display tracking-tight text-slate-800 dark:text-white">AI Narrative</h2>
                  <span className="px-2 py-1 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-[10px] font-bold rounded uppercase tracking-wider border border-violet-100 dark:border-violet-500/20 font-display">
                    Conformal
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin max-h-[300px]">
                  {cardLoading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-3">
                      <Spinner size="sm" />
                      <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 font-display">Generating...</span>
                    </div>
                  ) : riskCard ? (
                    <div className="text-[13px] text-slate-600 dark:text-white/70 leading-relaxed font-body">
                      <ReactMarkdown
                        components={{
                          h2: ({ node, ...props }) => <h3 className="font-bold text-[11px] text-slate-400 dark:text-white/40 uppercase tracking-widest mt-4 mb-3 font-display" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-none space-y-3 mb-4" {...props} />,
                          li: ({ node, ...props }) => (
                            <li className="flex items-start gap-3 bg-slate-50/50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-100 dark:border-white/5">
                              <span className="text-violet-500 mt-0.5">•</span>
                              <span className="flex-1">{props.children}</span>
                            </li>
                          ),
                          strong: ({ node, ...props }) => <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded" {...props} />
                        }}
                      >
                        {riskCard.risk_summary}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[13px] font-medium text-slate-400 dark:text-white/30 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-6 text-center font-body">
                      AI narrative is currently unavailable for this student record.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ==============================================================
                COLUMN 4: ACTIONS & ALERTS
            ============================================================== */}
            <div className="col-span-1 md:col-span-1 xl:col-span-3 space-y-6 flex flex-col h-full card-reveal" style={{ animationDelay: '300ms' }}>
              <div className="glass-card rounded-3xl flex-1 flex flex-col p-6 lg:p-8">
                <h2 className="text-lg font-bold font-display tracking-tight text-slate-800 dark:text-white mb-1">Interventions</h2>
                <p className="text-[13px] text-slate-500 dark:text-white/50 mb-5 font-body font-medium">Ranked by placement impact</p>
                <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                  <InterventionCards interventions={interventions?.interventions || []} />
                </div>
              </div>

              {studentAlerts.length > 0 && (
                <div className="glass-card rounded-3xl shrink-0 p-6 lg:p-8 bg-white/95 dark:bg-slate-900/95">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold font-display tracking-tight text-slate-800 dark:text-white">Active Alerts</h2>
                    <span className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full">
                      {studentAlerts.length}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
                    {studentAlerts.map((a: any) => (
                      <div key={a.id} className={`p-4 rounded-xl border-l-4 shadow-sm font-body ${a.severity === 'high'
                        ? 'bg-red-50/50 dark:bg-red-500/5 border-l-red-500 border-y-red-100 dark:border-y-red-500/10 border-r-red-100 dark:border-r-red-500/10'
                        : 'bg-amber-50/50 dark:bg-amber-500/5 border-l-amber-500 border-y-amber-100 dark:border-y-amber-500/10 border-r-amber-100 dark:border-r-amber-500/10'
                        }`}>
                        <p className={`text-[13px] font-bold ${a.severity === 'high' ? 'text-red-900 dark:text-red-400' : 'text-amber-900 dark:text-amber-400'}`}>
                          {a.trigger_name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm opacity-60">⏱</span>
                          <p className={`text-[11px] font-bold font-display uppercase tracking-wider ${a.severity === 'high' ? 'text-red-600 dark:text-red-500' : 'text-amber-700 dark:text-amber-500'}`}>
                            Due: {a.deadline}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
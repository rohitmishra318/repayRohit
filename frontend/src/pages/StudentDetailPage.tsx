import { useParams, useNavigate } from 'react-router-dom';
import { useStudent, useRisk, useRiskCard, useInterventions, useAlerts } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
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
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#080812]">
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
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridPulse {
          0%,100% { opacity: 0.04; }
          50%      { opacity: 0.075; }
        }

        .card-reveal { animation: cardReveal 0.6s cubic-bezier(0.22,1,0.36,1) both; }
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

        /* Custom scrollbar for inner elements */
        .inner-scroll::-webkit-scrollbar { width: 4px; }
        .inner-scroll::-webkit-scrollbar-track { background: transparent; }
        .inner-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      <div className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 dark:bg-[#080812] font-body relative min-h-screen pb-20">

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
            title={student.name}
            subtitle={`${student.course_type} · ${student.target_field} · ${student.months_since_graduation}mo post-grad`}
            actions={
              <div className="flex items-center gap-4">
                <RiskBadge tier={tier} score={risk.risk_score} size="md" />
                <button onClick={() => navigate(-1)}
                  className="text-[13px] font-bold font-display tracking-wide text-slate-700 dark:text-white/80 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 px-5 py-2.5 rounded-xl shadow-sm dark:shadow-none transition-all active:scale-95">
                  ← Back to List
                </button>
              </div>
            }
          />
        </div>

        <div className="relative z-10 p-6 max-w-[1600px] mx-auto space-y-6">

          {/* ── ROW 1: Executive Overview (Profile, Risk Gauge & Timeline) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">

            {/* Profile Card */}
            <div className="glass-card rounded-3xl flex flex-col p-8 card-reveal h-full justify-between" style={{ animationDelay: '0ms' }}>
              <div className="mb-7 pb-6 border-b border-slate-200/60 dark:border-white/5">
                <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
                  {student.name}
                </h2>
                <p className="text-xs font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest mb-5 font-display">
                  {student.course_type}
                </p>
                <div className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border font-display ${student.placement_status === 'placed'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${student.placement_status === 'placed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                  {student.placement_status}
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <h3 className="text-[11px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.15em] mb-5 font-display">Core Metrics</h3>
                <div className="space-y-4 flex-1 font-body">
                  {[
                    { label: 'Institute Tier', value: student.institute_tier },
                    { label: 'Cumulative GPA', value: student.cgpa?.toFixed(2), highlight: true },
                    { label: 'Internship Base', value: student.internship_employer_tier },
                    { label: 'PPO Status', value: student.ppo_exists ? 'Secured' : 'None' },
                    { label: 'Certifications', value: student.cert_count },
                    { label: 'Monthly EMI', value: `₹${Number(student.loan_emi_monthly).toLocaleString('en-IN')}` },
                    { label: 'Target City', value: `Tier ${student.target_city_tier}` },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center group py-1">
                      <span className="text-[13px] text-slate-500 dark:text-white/40">{item.label}</span>
                      <span className={`text-[13px] font-medium ${item.highlight ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-white/80'}`}>
                        {item.value ?? '—'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-5 border-t border-slate-200/60 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest font-display">Data Trust</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white font-mono">
                    {((student.data_trust_score || 0.5) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Gauge */}
            <div className="glass-card rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden card-reveal h-full" style={{ animationDelay: '100ms' }}>
              <h2 className="text-lg font-bold font-display tracking-tight text-slate-800 dark:text-white mb-6">Current Risk Score</h2>
              <RiskGauge score={risk.risk_score} label={`CI: ${(risk.ci_lower * 100).toFixed(0)}%–${(risk.ci_upper * 100).toFixed(0)}%`} />
              {risk.needs_human_review && (
                <div className="mt-6 bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/80 dark:border-amber-800/30 rounded-2xl p-4 text-[12px] text-amber-800 dark:text-amber-400/90 flex items-start gap-3">
                  <span className="text-lg leading-none">⚠</span>
                  <span className="font-medium leading-relaxed font-body">Wide uncertainty limits detected. Manual counselor review recommended.</span>
                </div>
              )}
            </div>

            {/* Placement Timeline */}
            <div className="glass-card rounded-3xl p-8 flex flex-col justify-between card-reveal h-full md:col-span-2 xl:col-span-1" style={{ animationDelay: '250ms' }}>
              <div>
                <h2 className="text-lg font-bold font-display tracking-tight text-slate-800 dark:text-white mb-1">Placement Timeline</h2>
                <p className="text-[12px] text-slate-500 dark:text-white/40 mb-6 font-body font-medium">Probability over time</p>
              </div>
              <div className="flex-1 flex items-center justify-center bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl p-5 border border-slate-100 dark:border-white/5 h-full">
                <PlacementTimeline p_3mo={risk.p_3mo} p_6mo={risk.p_6mo} p_12mo={risk.p_12mo} />
              </div>
            </div>

          </div>

          {/* ── ROW 2: Deep Analytics (AI Narrative & SHAP Drivers) ── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

            {/* AI Narrative (Scrollable block - spans 8/12 columns) */}
            <div className="glass-card rounded-3xl p-8 flex flex-col border-t-4 border-t-violet-500 card-reveal xl:col-span-8 h-full justify-between" style={{ animationDelay: '150ms' }}>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold font-display tracking-tight text-slate-800 dark:text-white">AI Narrative</h2>
                  <span className="px-3 py-1.5 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-[10px] font-bold rounded-lg uppercase tracking-widest border border-violet-100 dark:border-violet-500/20 font-display">
                    Conformal
                  </span>
                </div>
              </div>

              {/* Scroll box height adjusted perfectly */}
              <div className="overflow-y-auto pr-3 inner-scroll flex-1 max-h-[360px] min-h-[300px]">
                {cardLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
                    <Spinner size="sm" />
                    <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 dark:text-white/40 font-display">Generating Analysis...</span>
                  </div>
                ) : riskCard ? (
                  <div className="text-[13px] text-slate-600 dark:text-white/70 leading-relaxed font-body">
                    <ReactMarkdown
                      components={{
                        h2: ({ node, ...props }) => <h3 className="font-bold text-[11px] text-slate-500 dark:text-white/40 uppercase tracking-widest mt-6 mb-3 font-display first:mt-0" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-none space-y-3 mb-5" {...props} />,
                        li: ({ node, ...props }) => (
                          <li className="flex items-start gap-3 bg-slate-50/80 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/60 dark:border-white/5">
                            <span className="text-violet-500 dark:text-violet-400 mt-0.5">•</span>
                            <span className="flex-1">{props.children}</span>
                          </li>
                        ),
                        strong: ({ node, ...props }) => <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md" {...props} />
                      }}
                    >
                      {riskCard.risk_summary}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-[13px] font-medium text-slate-400 dark:text-white/30 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-center font-body py-12">
                    AI narrative is currently unavailable for this student record.
                  </div>
                )}
              </div>
            </div>

            {/* SHAP Drivers (spans 4/12 columns) */}
            <div className="glass-card rounded-3xl p-8 flex flex-col justify-between card-reveal xl:col-span-4 h-full" style={{ animationDelay: '200ms' }}>
              <div>
                <h2 className="text-lg font-bold font-display tracking-tight text-slate-800 dark:text-white mb-1">Risk Drivers (SHAP)</h2>
                <p className="text-[12px] text-slate-500 dark:text-white/40 mb-6 font-body font-medium">Key causal variables</p>
              </div>
              <div className="bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl p-5 border border-slate-100 dark:border-white/5 flex-1 flex flex-col justify-center">
                <ShapDrivers drivers={risk.shap_drivers} />
              </div>
            </div>

          </div>

          {/* ── ROW 3: Interventions & Active Alerts ── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

            {/* Interventions */}
            <div className={`glass-card rounded-3xl p-8 flex flex-col justify-between card-reveal h-full ${studentAlerts.length > 0 ? 'xl:col-span-8' : 'xl:col-span-12'}`} style={{ animationDelay: '300ms' }}>
              <div>
                <h2 className="text-lg font-bold font-display tracking-tight text-slate-800 dark:text-white mb-1">Interventions</h2>
                <p className="text-[12px] text-slate-500 dark:text-white/40 mb-6 font-body font-medium">Ranked by placement impact</p>
              </div>
              <div className="flex-1">
                <InterventionCards interventions={interventions?.interventions || []} layout="grid" />
              </div>
            </div>

            {/* Active Alerts (Shown if any exist - spans 4/12 columns) */}
            {studentAlerts.length > 0 && (
              <div className="glass-card rounded-3xl p-8 border-l-4 border-l-rose-500 card-reveal xl:col-span-4 flex flex-col justify-between h-full" style={{ animationDelay: '50ms' }}>
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold font-display tracking-tight text-slate-800 dark:text-white">Active Alerts</h2>
                    <span className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-[11px] font-bold font-mono px-3 py-1 rounded-full">
                      {studentAlerts.length}
                    </span>
                  </div>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto inner-scroll pr-2">
                    {studentAlerts.map((a: any) => (
                      <div key={a.id} className={`p-5 rounded-2xl border-l-4 shadow-sm font-body ${a.severity === 'high'
                        ? 'bg-rose-50/50 dark:bg-rose-500/5 border-l-rose-500 border-y-rose-100 dark:border-y-rose-500/10 border-r-rose-100 dark:border-r-rose-500/10'
                        : 'bg-amber-50/50 dark:bg-amber-500/5 border-l-amber-500 border-y-amber-100 dark:border-y-amber-500/10 border-r-amber-100 dark:border-r-amber-500/10'
                        }`}>
                        <p className={`text-[14px] font-bold font-display tracking-wide ${a.severity === 'high' ? 'text-rose-900 dark:text-rose-400' : 'text-amber-900 dark:text-amber-400'}`}>
                          {a.trigger_name}
                        </p>
                        <div className="flex items-center gap-2 mt-2.5">
                          <p className={`text-[10px] font-bold font-mono uppercase tracking-widest ${a.severity === 'high' ? 'text-rose-600 dark:text-rose-500' : 'text-amber-700 dark:text-amber-500'}`}>
                            Due: {a.deadline}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
}
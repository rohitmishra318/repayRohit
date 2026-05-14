import { useSession } from '../context/SessionContext';
import { useRisk, useRiskCard } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { Spinner } from '../components/shared/Spinner';
import { PlacementTimeline } from '../components/student/PlacementTimeline';
import { WhatIfSimulator } from '../components/student/WhatIfSimulator';
import ReactMarkdown from 'react-markdown';

// --- Professional SVG Icons ---
const Icons = {
  Alert: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
  Brain: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></svg>,
  Mitigate: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>,
  Amplify: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>,
  ArrowRight: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
};

export function AIInsightsPage() {
  const { student, isLoading: authLoading } = useSession();
  const SID = student?.student_id || '';

  const { data: risk, isLoading: rLoading, isError: rError } = useRisk(SID);
  const { data: riskCard, isLoading: cardLoading } = useRiskCard(SID);

  if (authLoading || rLoading) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812]">
        <Spinner size="lg" label="Loading AI insights..." />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812] text-slate-500 dark:text-white/40 font-body font-medium">
        Please log in to view insights.
      </div>
    );
  }

  if (rError || !risk) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812]">
        <div className="p-10 text-center max-w-md mx-auto glass-card rounded-3xl">
          <div className="text-red-500 mb-4 flex justify-center">{Icons.Alert}</div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-2 tracking-tight">Connection Error</h2>
          <p className="text-sm text-slate-500 dark:text-white/50 font-body">Could not load AI insights. Please refresh the page.</p>
        </div>
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
        @keyframes gridPulse {
          0%,100% { opacity: 0.04; }
          50%      { opacity: 0.075; }
        }

        .sector-reveal { animation: sectorReveal 0.55s cubic-bezier(0.22,1,0.36,1) both; }
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

        {/* ── Ambient Grid (NO PURPLE ORBS) ── */}
        <div className="dark:block hidden fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="grid-pulse absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.07) 1px,transparent 1px)',
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
            title="AI Insights & Placement Outlook"
            subtitle="Deep-learning narrative and timeline simulation"
          />
        </div>

        <div className="relative z-10 p-6 max-w-[1500px] mx-auto space-y-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* ==============================================================
                COLUMN 1: AI RISK ASSESSMENT
            ============================================================== */}
            <div className="col-span-1 lg:col-span-7 flex flex-col sector-reveal" style={{ animationDelay: '0ms' }}>
              <div className="glass-card rounded-3xl p-8 flex flex-col h-full min-h-[500px] border-t-4 border-t-violet-500">
                <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-200/60 dark:border-white/10">
                  <div>
                    <h2 className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white mb-1">AI Risk Assessment</h2>
                    <p className="text-[13px] text-slate-500 dark:text-white/50 font-body font-medium">Deep-learning risk narrative</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-[10px] font-bold rounded-lg uppercase tracking-widest border border-violet-200/80 dark:border-violet-500/20 font-display">
                    <span className="opacity-80">{Icons.Brain}</span>
                    Logic: Conformal
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
                  {cardLoading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                      <Spinner size="md" />
                      <span className="text-[11px] font-bold font-display uppercase tracking-widest text-slate-400 dark:text-white/40 animate-pulse">Analyzing causal pathways...</span>
                    </div>
                  ) : riskCard ? (
                    <div className="text-[14px] text-slate-700 dark:text-white/80 leading-relaxed font-body space-y-4">
                      <ReactMarkdown
                        components={{
                          h2: ({ node, ...props }) => (
                            <h3 className="flex items-center text-[11px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest mt-8 mb-4 first:mt-0 font-display">
                              <span className="mr-3 w-1.5 h-1.5 bg-violet-400 rounded-full"></span>
                              {props.children}
                            </h3>
                          ),
                          li: ({ node, ...props }) => {
                            const text = String(props.children);
                            const isMitigant = text.toLowerCase().includes('mitigates');
                            const isAmplifier = text.toLowerCase().includes('amplifies');

                            let liClasses = "mb-3 p-4 rounded-2xl border flex flex-col gap-1 transition-colors ";
                            let icon = Icons.ArrowRight;
                            let iconColor = "text-slate-400 dark:text-white/30";

                            if (isMitigant) {
                              liClasses += "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/60 dark:border-emerald-800/30";
                              icon = Icons.Mitigate;
                              iconColor = "text-emerald-600 dark:text-emerald-400";
                            } else if (isAmplifier) {
                              liClasses += "bg-rose-50/50 dark:bg-rose-900/10 border-rose-200/60 dark:border-rose-800/30";
                              icon = Icons.Amplify;
                              iconColor = "text-rose-600 dark:text-rose-400";
                            } else {
                              liClasses += "bg-slate-50/80 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/5";
                            }

                            return (
                              <li className={liClasses}>
                                <div className="flex items-start gap-3">
                                  <div className={`mt-0.5 shrink-0 ${iconColor}`}>{icon}</div>
                                  <span className="text-[13px] text-slate-800 dark:text-white/90">{props.children}</span>
                                </div>
                              </li>
                            );
                          },
                          p: ({ node, ...props }) => {
                            const content = String(props.children);
                            if (content.includes('[FLAG: HIGH UNCERTAINTY]')) {
                              return (
                                <div className="my-6 p-4 bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/80 dark:border-amber-800/30 rounded-2xl flex items-start gap-3">
                                  <span className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5">{Icons.Alert}</span>
                                  <div className="text-[13px] text-amber-900 dark:text-amber-200/90 leading-relaxed">
                                    <strong className="font-bold font-display tracking-wide uppercase text-[11px] block mb-1">Attention Required</strong>
                                    {content.replace('[FLAG: HIGH UNCERTAINTY]', '')}
                                  </div>
                                </div>
                              );
                            }
                            return <p className="mb-4 text-[13px] text-slate-600 dark:text-white/60 leading-relaxed">{props.children}</p>;
                          },
                          strong: ({ node, ...props }) => (
                            <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md mx-0.5">{props.children}</span>
                          )
                        }}
                      >
                        {riskCard.risk_summary}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 dark:text-white/40 leading-relaxed bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl p-6 border border-slate-200/60 dark:border-white/5 text-center flex flex-col items-center justify-center h-full">
                      <span className="text-3xl opacity-50 mb-3">📊</span>
                      <p className="font-bold font-display tracking-wide text-slate-700 dark:text-white/70">No Assessment Data</p>
                      <p className="text-xs mt-1">System could not generate a narrative for this ID.</p>
                    </div>
                  )}
                </div>

                {risk.regulatory_note && (
                  <div className="mt-6 shrink-0 bg-violet-50/80 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-2 h-2 bg-violet-500 dark:bg-violet-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                    <span className="text-[11px] font-bold text-violet-800 dark:text-violet-300 uppercase tracking-widest font-display">
                      Regulatory Note: <span className="font-medium font-body normal-case tracking-normal ml-1 opacity-90">{risk.regulatory_note}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ==============================================================
                COLUMN 2: TIMELINE & SIMULATOR
            ============================================================== */}
            <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">

              {/* Placement Timeline */}
              <div className="glass-card rounded-3xl p-7 flex flex-col sector-reveal" style={{ animationDelay: '100ms' }}>
                <h2 className="text-[13px] font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-1 font-display">Placement Timeline</h2>
                <p className="text-[13px] text-slate-500 dark:text-white/50 mb-5 font-body font-medium">Probability of securing a role</p>
                <div className="flex-1 flex items-center bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                  <PlacementTimeline p_3mo={risk.p_3mo} p_6mo={risk.p_6mo} p_12mo={risk.p_12mo} />
                </div>
              </div>

              {/* What-If Simulator */}
              <div className="glass-card rounded-3xl p-7 flex-1 flex flex-col sector-reveal" style={{ animationDelay: '200ms' }}>
                <h2 className="text-[13px] font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-1 font-display">What-If Simulator</h2>
                <p className="text-[13px] text-slate-500 dark:text-white/50 mb-6 font-body font-medium">Test potential profile improvements</p>
                <div className="flex-1">
                  <WhatIfSimulator
                    baseRisk={risk}
                    currentProfile={{
                      cgpa: student.cgpa,
                      ppo_exists: student.ppo_exists,
                      internship_employer_tier: student.internship_employer_tier,
                      cert_count: student.cert_count,
                    }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
import { useSession } from '../context/SessionContext';
import { useRisk, useRiskCard } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/shared/Card';
import { Spinner } from '../components/shared/Spinner';
import { PlacementTimeline } from '../components/student/PlacementTimeline';
import { WhatIfSimulator } from '../components/student/WhatIfSimulator';
import ReactMarkdown from 'react-markdown';

export function AIInsightsPage() {
  const { student, isLoading: authLoading } = useSession();
  const SID = student?.student_id || '';

  const { data: risk, isLoading: rLoading, isError: rError } = useRisk(SID);
  const { data: riskCard, isLoading: cardLoading } = useRiskCard(SID);

  if (authLoading || rLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/50 dark:bg-slate-950">
        <Spinner size="lg" label="Loading AI insights..." />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
        Please log in.
      </div>
    );
  }

  if (rError || !risk) {
    return (
      <div className="p-10 text-center max-w-md mx-auto mt-20 bg-white dark:bg-slate-800 rounded-xl border border-red-100 dark:border-red-900 shadow-sm">
        <div className="text-red-500 mb-3 text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Connection Error</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Could not load AI insights. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#FAFAFA] dark:bg-slate-950">
      <PageHeader
        title="AI Insights & Placement Outlook"
        subtitle="Deep-learning narrative and timeline simulation"
      />

      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* AI Risk Assessment */}
          <Card className="border-l-4 border-l-blue-500 flex flex-col h-full min-h-[400px] shadow-sm bg-white dark:bg-slate-800" padding="md">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">AI Risk Assessment</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">Deep-learning risk narrative</p>
              </div>
              <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-100 dark:border-blue-700">
                Logic: Conformal
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-2 mt-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              {cardLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3">
                  <Spinner size="sm" />
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 animate-pulse">Analyzing causal pathways...</span>
                </div>
              ) : riskCard ? (
                <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
                  <ReactMarkdown
                    components={{
                      h2: ({ node, ...props }) => (
                        <h3 className="flex items-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mt-6 mb-2 first:mt-0">
                          <span className="mr-2 w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                          {props.children}
                        </h3>
                      ),
                      li: ({ node, ...props }) => {
                        const text = String(props.children);
                        const isMitigant = text.toLowerCase().includes('mitigates');
                        const isAmplifier = text.toLowerCase().includes('amplifies');

                        let liClasses = "mb-3 p-3 rounded-lg border-l-2 flex flex-col ";
                        if (isMitigant) {
                          liClasses += "bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-600";
                        } else if (isAmplifier) {
                          liClasses += "bg-rose-50/50 dark:bg-rose-900/20 border-rose-400 dark:border-rose-600";
                        } else {
                          liClasses += "bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600";
                        }

                        return (
                          <li className={liClasses}>
                            <span className="text-[13px] text-slate-700 dark:text-slate-300">{props.children}</span>
                          </li>
                        );
                      },
                      p: ({ node, ...props }) => {
                        const content = String(props.children);
                        if (content.includes('[FLAG: HIGH UNCERTAINTY]')) {
                          return (
                            <div className="my-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl flex items-start gap-3">
                              <span className="text-xl">⚠</span>
                              <div className="text-xs text-amber-800 dark:text-amber-300 leading-normal">
                                <strong className="text-amber-900 dark:text-amber-200">Attention:</strong> {content.replace('[FLAG: HIGH UNCERTAINTY]', '')}
                              </div>
                            </div>
                          );
                        }
                        return <p className="mb-3 text-[13px] text-slate-600 dark:text-slate-300 leading-snug">{props.children}</p>;
                      },
                      strong: ({ node, ...props }) => (
                        <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 px-1 rounded">{props.children}</span>
                      )
                    }}
                  >
                    {riskCard.risk_summary}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 text-center">
                  <p className="font-medium text-slate-700 dark:text-slate-300">No Assessment Data</p>
                  <p className="text-xs mt-1">System could not generate a narrative for this ID.</p>
                </div>
              )}
            </div>

            {risk.regulatory_note && (
              <div className="mt-3 shrink-0 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-lg p-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Regulatory Note: {risk.regulatory_note}
                </span>
              </div>
            )}
          </Card>

          <div className="flex flex-col gap-6">
            {/* Placement Timeline */}
            <Card className="flex flex-col shadow-sm border border-slate-200/60 dark:border-slate-700" padding="md">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Placement Timeline</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Probability of securing a role</p>
              <div className="flex-1 flex items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
                <PlacementTimeline p_3mo={risk.p_3mo} p_6mo={risk.p_6mo} p_12mo={risk.p_12mo} />
              </div>
            </Card>

            {/* What-If Simulator */}
            <Card className="flex-1 flex flex-col shadow-sm border border-slate-200/60 dark:border-slate-700" padding="md">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">What-If Simulator</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Test potential profile improvements</p>
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
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
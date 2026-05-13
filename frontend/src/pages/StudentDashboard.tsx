import { useSession } from '../context/SessionContext';
import { useRisk, useRiskCard, useInterventions } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/shared/Card';
import { Spinner } from '../components/shared/Spinner';
import { RiskGauge } from '../components/student/RiskGauge';
import { PlacementTimeline } from '../components/student/PlacementTimeline';
import { WhatIfSimulator } from '../components/student/WhatIfSimulator';
import { ActivityFeed } from '../components/student/ActivityFeed';
import { ShapDrivers } from '../components/student/ShapDrivers';
import { InterventionCards } from '../components/student/InterventionCards';
import { RiskBadge } from '../components/shared/RiskBadge';
import ReactMarkdown from 'react-markdown';

export function StudentDashboard() {
  // 1. Grab the dynamic student object and the overall auth loading state
  const { student, isLoading: authLoading } = useSession();

  // 2. Extract SID safely (default to empty string if still loading)
  const SID = student?.student_id || '';

  // 3. Pass the dynamic SID to your hooks
  const { data: risk, isLoading: rLoading, isError: rError } = useRisk(SID);
  const { data: riskCard, isLoading: cardLoading } = useRiskCard(SID);
  const { data: interventionData, isLoading: iLoading } = useInterventions(SID);

  // 4. Handle the Auth loading state BEFORE the Risk loading state
  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/50">
        <Spinner size="lg" label="Authenticating student session..." />
      </div>
    );
  }

  // 5. If they aren't logged in, don't try to render the dashboard
  if (!student) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/50 text-slate-500">
        Please log in to view your dashboard.
      </div>
    );
  }

  // Handle loading state for the entire page core metrics
  if (rLoading || iLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/50">
        <Spinner size="lg" label="Loading live risk profile..." />
      </div>
    );
  }

  // Handle Error state if the backend is unreachable
  if (rError || !risk) {
    return (
      <div className="p-10 text-center max-w-md mx-auto mt-20 bg-white rounded-xl border border-red-100 shadow-sm">
        <div className="text-red-500 mb-3 text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Interrupted</h2>
        <p className="text-sm text-slate-500">We couldn't reach the server to fetch your live risk data. Please refresh or check your connection.</p>
      </div>
    );
  }

  const interventions = interventionData?.interventions || [];
  const tier = risk.risk_score >= 0.75 ? 'HIGH' : risk.risk_score >= 0.55 ? 'MEDIUM' : 'LOW';

  // ... rest of your return statement stays EXACTLY the same ...

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#FAFAFA]">
      <PageHeader
        title="My Risk Dashboard"
        subtitle={`${student.name} · ${student.course} · MBA`}
        actions={<RiskBadge tier={tier} score={risk.risk_score} size="md" />}
      />

      <div className="p-6 max-w-[1400px] mx-auto space-y-6">

        {/* ==============================================================
            SECTION 1: PROFILE RIBBON (Moved to Top)
        ============================================================== */}
        <Card padding="md" className="border border-slate-200/60 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-800">Student Profile Snapshot</h2>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">ID: {SID}</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'CGPA', value: student.cgpa.toFixed(2), icon: '🎓' },
              { label: 'Internships', value: student.internship_count, icon: '💼' },
              { label: 'Certifications', value: student.cert_count, icon: '📜' },
              { label: 'PPO Secured', value: student.ppo_exists ? 'Yes' : 'No', icon: '✅' },
              { label: '10th Score', value: `${student.tenth_board_score}%`, icon: '📝' },
              { label: '12th Score', value: `${student.twelfth_board_score}%`, icon: '📝' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100/50">
                <span className="text-lg opacity-80">{item.icon}</span>
                <div>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ==============================================================
            SECTION 2: CORE METRICS (Gauge, Timeline, Simulator)
        ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Risk Gauge */}
          <Card className="h-full flex flex-col shadow-sm border border-slate-200/60 relative overflow-hidden" padding="md">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Placement Risk</h2>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <RiskGauge score={risk.risk_score} label={`CI: ${(risk.ci_lower * 100).toFixed(0)}%–${(risk.ci_upper * 100).toFixed(0)}%`} />
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div>
                    <p className="text-slate-500 mb-0.5">Repayment Stress</p>
                    <p className={`font-semibold ${
                      risk.repayment_stress_index >= 0.7 ? 'text-red-600' :
                      risk.repayment_stress_index >= 0.5 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>{risk.repayment_stress_label || 'MODERATE'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-0.5">Salary Range</p>
                    <p className="font-semibold text-slate-800">
                      ₹{(risk.predicted_salary_lower / 100000).toFixed(1)}–{(risk.predicted_salary_upper / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-0.5">Monthly EMI</p>
                    <p className="font-semibold text-slate-800">₹{student.loan_emi_monthly.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-0.5">Data Trust Weight</p>
                    <p className="font-semibold text-slate-800">{(risk.data_trust_weight * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
              {risk.needs_human_review && (
                <div className="mt-4 bg-amber-50/80 border border-amber-200/80 rounded px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
                  <span>⚠</span>
                  <span>Wide uncertainty limits — manual review recommended.</span>
                </div>
              )}
            </div>
          </Card>

          {/* Placement Timeline */}
          <Card className="h-full flex flex-col shadow-sm border border-slate-200/60" padding="md">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">Placement Timeline</h2>
            <p className="text-xs text-slate-500 mb-4">Probability of securing a role</p>
            <div className="flex-1 flex items-center bg-slate-50/50 rounded-lg p-2 border border-slate-100">
               <PlacementTimeline p_3mo={risk.p_3mo} p_6mo={risk.p_6mo} p_12mo={risk.p_12mo} />
            </div>
          </Card>

          {/* What-If Simulator */}
          <Card className="h-full flex flex-col shadow-sm border border-slate-200/60" padding="md">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">What-If Simulator</h2>
            <p className="text-xs text-slate-500 mb-4">Test potential profile improvements</p>
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

        {/* ==============================================================
            SECTION 3: AI, DRIVERS, & ACTIONS
        ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* SHAP Drivers */}
          <Card className="h-full flex flex-col shadow-sm border border-slate-200/60" padding="md">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">Risk Drivers</h2>
            <p className="text-xs text-slate-500 mb-4">Variables impacting current score</p>
            <div className="flex-1">
               <ShapDrivers drivers={risk.shap_drivers} />
            </div>
          </Card>

          {/* AI Risk Assessment (Scrollable, Kept Exact Logic) */}
          <Card className="border-l-4 border-l-blue-500 flex flex-col h-full min-h-[320px] max-h-[420px] shadow-sm bg-white" padding="md">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">AI Risk Assessment</h2>
                <p className="text-xs text-slate-400">Deep-learning risk narrative</p>
              </div>
              <div className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-100">
                Logic: Conformal
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 mt-4 scrollbar-thin scrollbar-thumb-slate-200">
              {cardLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3">
                  <Spinner size="sm" />
                  <span className="text-xs font-mono text-slate-400 animate-pulse">Analyzing causal pathways...</span>
                </div>
              ) : riskCard ? (
                <div className="text-sm text-slate-600 leading-relaxed space-y-4">
                  <ReactMarkdown 
                    components={{
                      h2: ({node, ...props}) => (
                        <h3 className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-6 mb-2 first:mt-0">
                          <span className="mr-2 w-1 h-1 bg-slate-300 rounded-full"></span>
                          {props.children}
                        </h3>
                      ),
                      li: ({node, ...props}) => {
                        const text = String(props.children);
                        const isMitigant = text.toLowerCase().includes('mitigates');
                        const isAmplifier = text.toLowerCase().includes('amplifies');
                        
                        return (
                          <li className={`mb-3 p-2 rounded-lg border-l-2 flex flex-col ${
                            isMitigant ? 'bg-emerald-50/50 border-emerald-400' : 
                            isAmplifier ? 'bg-rose-50/50 border-rose-400' : 'bg-slate-50 border-slate-300'
                          }`}>
                            <span className="text-[13px]">{props.children}</span>
                          </li>
                        );
                      },
                      p: ({node, ...props}) => {
                        const content = String(props.children);
                        if (content.includes('[FLAG: HIGH UNCERTAINTY]')) {
                          return (
                            <div className="my-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                              <span className="text-xl">⚠</span>
                              <div className="text-xs text-amber-800 leading-normal">
                                <strong>Attention:</strong> {content.replace('[FLAG: HIGH UNCERTAINTY]', '')}
                              </div>
                            </div>
                          );
                        }
                        return <p className="mb-3 text-[13px] text-slate-600 leading-snug">{props.children}</p>;
                      },
                      strong: ({node, ...props}) => (
                        <span className="font-bold text-slate-900 bg-slate-100 px-1 rounded">{props.children}</span>
                      )
                    }}
                  >
                    {riskCard.risk_summary}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-sm text-slate-500 leading-relaxed bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                  <p className="font-medium text-slate-700">No Assessment Data</p>
                  <p className="text-xs mt-1">System could not generate a narrative for this ID.</p>
                </div>
              )}
            </div>

            {/* Fixed bottom note */}
            {risk.regulatory_note && (
              <div className="mt-3 shrink-0 bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">
                  Regulatory Note: {risk.regulatory_note}
                </span>
              </div>
            )}
          </Card>

          {/* Interventions */}
          <Card className="h-full flex flex-col shadow-sm border border-slate-200/60" padding="md">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">Recommended Actions</h2>
            <p className="text-xs text-slate-500 mb-4">Ranked by placement lift estimate</p>
            <div className="flex-1">
               <InterventionCards interventions={interventions} />
            </div>
          </Card>

        </div>

        {/* ==============================================================
            SECTION 4: ACTIVITY FEED (Bottom Span)
        ============================================================== */}
        <Card className="shadow-sm border border-slate-200/60" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Live Activity Feed</h2>
            <button className="text-xs text-blue-600 hover:underline">View All</button>
          </div>
          <div className="bg-white rounded-lg">
             <ActivityFeed />
          </div>
        </Card>

      </div>
    </div>
  );
}
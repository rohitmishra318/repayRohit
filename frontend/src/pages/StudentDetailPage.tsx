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
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#FAFAFA]">
      <PageHeader
        title={student.name}
        subtitle={`${student.course_type} · ${student.target_field} · ${student.months_since_graduation}mo post-grad`}
        actions={
          <div className="flex items-center gap-4">
            <RiskBadge tier={tier} score={risk.risk_score} size="md" />
            <button onClick={() => navigate(-1)}
              className="text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200/80 px-4 py-2 rounded-md shadow-sm transition-all">
              ← Back to List
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        
        {/* Adjusted Grid: Better responsiveness for complex cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 items-stretch">

          {/* ==============================================================
              COLUMN 1: PROFESSIONAL CANDIDATE DATA SHEET (Redesigned)
          ============================================================== */}
          <div className="col-span-1 md:col-span-1 xl:col-span-3 flex flex-col">
            <Card className="h-full flex flex-col border border-slate-200/60 shadow-sm bg-white" padding="lg">
              
              {/* Header without image */}
              <div className="mb-6 pb-5 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight mb-1">
                  {student.name}
                </h2>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                  {student.course_type}
                </p>
                
                {/* Status Pill */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                  student.placement_status === 'placed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${student.placement_status === 'placed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                  {student.placement_status}
                </div>
              </div>

              {/* Data Rows */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">Core Metrics</h3>
                
                <div className="space-y-3.5 flex-1">
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
                      <span className="text-[13px] text-slate-500">{item.label}</span>
                      <span className={`text-[13px] font-medium ${item.highlight ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                        {item.value ?? '—'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer stat */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 p-3 rounded-md">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Data Trust Level</span>
                  <span className="text-sm font-bold text-slate-800">
                    {((student.data_trust_score || 0.5) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* ==============================================================
              COLUMN 2: RISK ANALYTICS
          ============================================================== */}
          <div className="col-span-1 md:col-span-1 xl:col-span-3 space-y-6 flex flex-col h-full">
            <Card padding="lg" className="flex-1 flex flex-col justify-center border border-slate-200/60 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
              <h2 className="text-sm font-semibold text-slate-800 mb-5">Current Risk Score</h2>
              <RiskGauge score={risk.risk_score} label={`CI: ${(risk.ci_lower * 100).toFixed(0)}%–${(risk.ci_upper * 100).toFixed(0)}%`} />
              
              {risk.needs_human_review && (
                <div className="mt-5 bg-amber-50/80 border border-amber-200/80 rounded p-3 text-xs text-amber-800 flex items-start gap-2">
                  <span className="text-base leading-none">⚠</span>
                  <span className="font-medium leading-relaxed">Wide uncertainty limits detected. Manual counselor review is recommended.</span>
                </div>
              )}
            </Card>

            <Card padding="lg" className="flex-1 flex flex-col border border-slate-200/60 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-800 mb-1">Placement Timeline</h2>
              <p className="text-xs text-slate-500 mb-5">Probability over time</p>
              <div className="flex-1 flex items-center justify-center bg-slate-50/50 rounded-lg p-3 border border-slate-100">
                <PlacementTimeline p_3mo={risk.p_3mo} p_6mo={risk.p_6mo} p_12mo={risk.p_12mo} />
              </div>
            </Card>
          </div>

          {/* ==============================================================
              COLUMN 3: AI & CAUSAL DRIVERS
          ============================================================== */}
          <div className="col-span-1 md:col-span-1 xl:col-span-3 space-y-6 flex flex-col h-full">
            <Card padding="lg" className="flex-1 flex flex-col border border-slate-200/60 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-800 mb-1">Risk Drivers (SHAP)</h2>
              <p className="text-xs text-slate-500 mb-5">Key causal variables</p>
              <div className="flex-1 bg-slate-50/50 rounded-lg p-3 border border-slate-100">
                <ShapDrivers drivers={risk.shap_drivers} />
              </div>
            </Card>

            <Card className="border border-slate-200/60 border-t-4 border-t-blue-500 flex-1 flex flex-col shadow-sm" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-800">AI Narrative</h2>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-100">
                  Conformal
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin max-h-[300px]">
                {cardLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-2">
                    <Spinner size="sm" />
                    <span className="text-[11px] text-slate-400">Generating assessment...</span>
                  </div>
                ) : riskCard ? (
                  <div className="text-[13px] text-slate-600 leading-relaxed">
                    <ReactMarkdown 
                      components={{
                        h2: ({node, ...props}) => <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-widest mt-4 mb-2" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-none space-y-2 mb-3" {...props} />,
                        li: ({node, ...props}) => (
                          <li className="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>{props.children}</span>
                          </li>
                        ),
                        strong: ({node, ...props}) => <span className="font-semibold text-slate-900 bg-slate-100 px-1 rounded" {...props} />
                      }}
                    >
                      {riskCard.risk_summary}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-[13px] text-slate-400 bg-slate-50 rounded border border-dashed border-slate-200 p-4 text-center">
                    AI narrative is currently unavailable for this student record.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* ==============================================================
              COLUMN 4: ACTIONS & ALERTS
          ============================================================== */}
          <div className="col-span-1 md:col-span-1 xl:col-span-3 space-y-6 flex flex-col h-full">
            <Card padding="lg" className="flex-1 flex flex-col border border-slate-200/60 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-800 mb-1">Recommended Interventions</h2>
              <p className="text-xs text-slate-500 mb-4">Ranked by placement impact</p>
              <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                 <InterventionCards interventions={interventions?.interventions || []} />
              </div>
            </Card>

            {studentAlerts.length > 0 && (
              <Card padding="lg" className="shrink-0 border border-slate-200/60 shadow-sm bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-800">Active Alerts</h2>
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {studentAlerts.length}
                  </span>
                </div>
                
                <div className="space-y-3 max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
                  {studentAlerts.map((a: any) => (
                    <div key={a.id} className={`p-3 rounded-md border-l-4 shadow-sm ${
                      a.severity === 'high' 
                        ? 'bg-red-50 border-l-red-500 border-y-red-100 border-r-red-100' 
                        : 'bg-amber-50 border-l-amber-500 border-y-amber-100 border-r-amber-100'
                    }`}>
                      <p className={`text-[13px] font-bold ${a.severity === 'high' ? 'text-red-900' : 'text-amber-900'}`}>
                        {a.trigger_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-base opacity-70">⏱</span>
                        <p className={`text-[11px] font-medium uppercase tracking-wide ${a.severity === 'high' ? 'text-red-600' : 'text-amber-700'}`}>
                          Due: {a.deadline}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
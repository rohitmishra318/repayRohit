import { useSession } from '../context/SessionContext';
import { useRisk, useInterventions } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/shared/Card';
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
      <div className="flex h-full items-center justify-center bg-slate-50/50 dark:bg-slate-950">
        <Spinner size="lg" label="Authenticating student session..." />
      </div>
    );
  }

  // 5. If they aren't logged in, don't try to render the dashboard
  if (!student) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
        Please log in to view your dashboard.
      </div>
    );
  }

  // Handle loading state for the entire page core metrics
  if (rLoading || iLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/50 dark:bg-slate-950">
        <Spinner size="lg" label="Loading live risk profile..." />
      </div>
    );
  }

  // Handle Error state if the backend is unreachable
  if (rError || !risk) {
    return (
      <div className="p-10 text-center max-w-md mx-auto mt-20 bg-white dark:bg-slate-800 rounded-xl border border-red-100 dark:border-red-900 shadow-sm">
        <div className="text-red-500 mb-3 text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Connection Interrupted</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">We couldn't reach the server to fetch your live risk data. Please refresh or check your connection.</p>
      </div>
    );
  }

  const interventions = interventionData?.interventions || [];
  const tier = risk.risk_score >= 0.75 ? 'HIGH' : risk.risk_score >= 0.55 ? 'MEDIUM' : 'LOW';

  // ... rest of your return statement stays EXACTLY the same ...

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#FAFAFA] dark:bg-slate-950">
      <PageHeader
        title="My Risk Dashboard"
        subtitle={`${student.name} · ${student.course}`}
        actions={<RiskBadge tier={tier} score={risk.risk_score} size="md" />}
      />

      <div className="p-6 max-w-[1400px] mx-auto space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Risk Gauge */}
          <Card className="h-full flex flex-col shadow-sm border border-slate-200/60 dark:border-slate-700 relative overflow-hidden" padding="md">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Placement Risk</h2>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <RiskGauge score={risk.risk_score} label={`CI: ${(risk.ci_lower * 100).toFixed(0)}%–${(risk.ci_upper * 100).toFixed(0)}%`} />
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 mb-0.5">Repayment Stress</p>
                    <p className={`font-semibold ${risk.repayment_stress_index >= 0.7 ? 'text-red-600' :
                        risk.repayment_stress_index >= 0.5 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>{risk.repayment_stress_label || 'MODERATE'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 mb-0.5">Salary Range</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      ₹{(risk.predicted_salary_lower / 100000).toFixed(1)}–{(risk.predicted_salary_upper / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 mb-0.5">Monthly EMI</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">₹{student.loan_emi_monthly.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 mb-0.5">Data Trust Weight</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{(risk.data_trust_weight * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
              {risk.needs_human_review && (
                <div className="mt-4 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/80 dark:border-amber-700 rounded px-3 py-2 text-xs text-amber-800 dark:text-amber-400 flex items-start gap-2">
                  <span>⚠</span>
                  <span>Wide uncertainty limits — manual review recommended.</span>
                </div>
              )}
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            {/* SHAP Drivers */}
            <Card className="flex flex-col shadow-sm border border-slate-200/60 dark:border-slate-700" padding="md">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Risk Drivers</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Variables impacting current score</p>
              <div className="flex-1">
                <ShapDrivers drivers={risk.shap_drivers} />
              </div>
            </Card>

            {/* Interventions */}
            <Card className="flex-1 flex flex-col shadow-sm border border-slate-200/60 dark:border-slate-700" padding="md">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Recommended Actions</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Ranked by placement lift estimate</p>
              <div className="flex-1">
                <InterventionCards interventions={interventions} />
              </div>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
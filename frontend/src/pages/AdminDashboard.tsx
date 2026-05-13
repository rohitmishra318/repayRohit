import { useNavigate } from 'react-router-dom';
import { usePortfolio, useStudents } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { KPIRibbon } from '../components/portfolio/KPIRibbon';
import { AlertFeed } from '../components/portfolio/AlertFeed';
import { Card } from '../components/shared/Card';
import { Spinner } from '../components/shared/Spinner';
import { RiskBadge } from '../components/shared/RiskBadge';
import { IndiaMapImage } from './IndiaMapImage';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data: portfolio, isLoading: pLoading } = usePortfolio();
  const { data: students, isLoading: sLoading } = useStudents();

  if (pLoading || sLoading) return <Spinner label="Loading portfolio..." size="lg" />;
  if (!portfolio) return <p className="p-6 text-slate-400 dark:text-slate-500">Failed to load portfolio data.</p>;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 dark:bg-slate-950">
      <PageHeader
        title="Portfolio Dashboard"
        subtitle={`${portfolio.total_students} borrowers · last updated just now`}
        actions={
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 px-3 py-1.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </div>
        }
      />

      <div className="p-6 space-y-5 max-w-screen-xl mx-auto">

        {/* KPI */}
        <KPIRibbon data={portfolio} />

        {/* MAP */}
        <div className="grid grid-cols-1 gap-5">
          <Card className="flex flex-col w-full h-full min-h-[400px]" padding="md">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Geographic Risk Spread</h2>
            <div className="flex-1 min-h-0 bg-slate-50/50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
              <IndiaMapImage students={students || []} />
            </div>
          </Card>
        </div>

        {/* STUDENTS */}
        <div className="grid grid-cols-1 gap-5">

          {/* Student table */}
          <Card className="flex flex-col h-full min-h-[400px]" padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Borrower List</h2>
              <span className="text-xs text-slate-400 dark:text-slate-500">{students?.length} borrowers</span>
            </div>

            <div className="flex-1 overflow-auto min-h-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                    {['Name', 'Course', 'Field', 'Status', 'Risk'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {students?.map(s => (
                    <tr
                      key={s.student_id}
                      onClick={() => navigate(`/student/${s.student_id}`)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{s.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{s.institute_tier}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{s.course_type}</td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400 max-w-32 truncate">
                        {s.target_field}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.placement_status === 'placed'
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
                            : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700'
                            }`}
                        >
                          {s.placement_status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <RiskBadge tier={s.risk_tier} score={s.risk_score} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
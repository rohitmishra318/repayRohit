import { useNavigate } from 'react-router-dom';
import { usePortfolio, useStudents } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { KPIRibbon } from '../components/portfolio/KPIRibbon';
import { SectorTable } from '../components/portfolio/SectorTable';
import { AlertFeed } from '../components/portfolio/AlertFeed';
import { StressTest } from '../components/portfolio/StressTest';
import { Card } from '../components/shared/Card';
import { Spinner } from '../components/shared/Spinner';
import { RiskBadge } from '../components/shared/RiskBadge';
import { IndiaMapImage } from './IndiaMapImage';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data: portfolio, isLoading: pLoading } = usePortfolio();
  const { data: students, isLoading: sLoading } = useStudents();

  if (pLoading || sLoading) return <Spinner label="Loading portfolio..." size="lg" />;
  if (!portfolio) return <p className="p-6 text-slate-400">Failed to load portfolio data.</p>;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <PageHeader
        title="Portfolio Dashboard"
        subtitle={`${portfolio.total_students} borrowers · last updated just now`}
        actions={
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </div>
        }
      />

      <div className="p-6 space-y-5 max-w-screen-xl mx-auto">

        {/* KPI */}
        <KPIRibbon data={portfolio} />

        {/* MAP + RIGHT SIDE */}
        <div className="grid grid-cols-12 gap-5 items-stretch auto-rows-fr">

          {/* Map */}
          <div className="col-span-12 lg:col-span-5 flex">
            <Card className="flex flex-col w-full h-full min-h-[380px]" padding="md">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Geographic Risk Spread</h2>
              <div className="flex-1 min-h-0">
                <IndiaMapImage students={students || []} />
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">

            {/* Sector exposure */}
            <Card className="flex flex-col h-full min-h-[180px]" padding="md">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Sector Risk Exposure</h2>
              <div className="flex items-center gap-6 mb-3 text-xs text-slate-400">
                <span>Field</span>
                <span className="flex-1">Risk level</span>
                <span>Score</span>
                <span>Students</span>
              </div>
              <div className="flex-1 min-h-0">
                <SectorTable data={portfolio.sector_exposure} />
              </div>
            </Card>

            {/* Alerts */}
            <Card className="flex flex-col h-full min-h-[150px]" padding="md">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-800">Active Alerts</h2>
                <button
                  onClick={() => navigate('/alerts')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all →
                </button>
              </div>

              <div className="flex-1 min-h-0">
                <AlertFeed alerts={portfolio.recent_alerts} />
              </div>
            </Card>

          </div>
        </div>

        {/* STUDENTS + STRESS TEST */}
        <div className="grid grid-cols-12 gap-5 items-stretch auto-rows-fr">

          {/* Student table */}
          <Card className="col-span-12 lg:col-span-7 flex flex-col h-full min-h-[300px]" padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Borrower List</h2>
              <span className="text-xs text-slate-400">{students?.length} borrowers</span>
            </div>

            <div className="flex-1 overflow-auto min-h-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Name', 'Course', 'Field', 'Status', 'Risk'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {students?.slice(0, 10).map(s => (
                    <tr
                      key={s.student_id}
                      onClick={() => navigate(`/student/${s.student_id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.institute_tier}</p>
                      </td>

                      <td className="px-5 py-3 text-slate-600">{s.course_type}</td>

                      <td className="px-5 py-3 text-slate-600 max-w-32 truncate">
                        {s.target_field}
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            s.placement_status === 'placed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
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

          {/* Stress test */}
          <Card className="col-span-12 lg:col-span-5 flex flex-col h-full min-h-[300px]" padding="md">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">Scenario Stress Test</h2>
            <p className="text-xs text-slate-400 mb-4">
              Simulate demand shock impact on portfolio
            </p>

            <div className="flex-1 min-h-0">
              {portfolio.sector_exposure.length > 0 && (
                <StressTest sectors={portfolio.sector_exposure} />
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
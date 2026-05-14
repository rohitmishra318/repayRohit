import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio, useStudents } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { KPIRibbon } from '../components/portfolio/KPIRibbon';
import { AlertFeed } from '../components/portfolio/AlertFeed';
import { Card } from '../components/shared/Card';
import { Spinner } from '../components/shared/Spinner';
import { RiskBadge } from '../components/shared/RiskBadge';
import { IndiaMapImage } from './IndiaMapImage';

/* ─────────────────────────────────────────────
   Tiny inline-style helpers (no extra deps)
───────────────────────────────────────────── */
const SECTION_TITLE =
  'font-display text-base font-bold text-slate-800 dark:text-white tracking-tight';
const SECTION_SUB =
  'text-xs text-slate-400 dark:text-white/30 font-body mt-0.5';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data: portfolio, isLoading: pLoading } = usePortfolio();
  const { data: students, isLoading: sLoading } = useStudents();
  const [visibleCount, setVisibleCount] = useState(50);

  if (pLoading || sLoading) return <Spinner label="Loading portfolio..." size="lg" />;
  if (!portfolio)
    return <p className="p-6 text-slate-400 dark:text-slate-500">Failed to load portfolio data.</p>;

  const handleShowMore = () => setVisibleCount(prev => prev + 50);

  return (
    <>
      {/* ── Font + keyframe injection ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }

        @keyframes dashReveal {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbDrift {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(30px,-20px) scale(1.06); }
          70%      { transform: translate(-15px,15px) scale(0.96); }
        }
        @keyframes gridPulse {
          0%,100% { opacity: 0.04; }
          50%      { opacity: 0.08; }
        }
        @keyframes shimmerRow {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50%      { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
        }

        .dash-section { animation: dashReveal 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .orb-drift    { animation: orbDrift 16s ease-in-out infinite; }
        .grid-pulse   { animation: gridPulse 5s ease-in-out infinite; }
        .pulse-dot    { animation: pulse-dot 2s ease-in-out infinite; }

        /* Dark-mode glass card */
        .dark .glass-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.07);
        }
        /* Light-mode glass card */
        .glass-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148,163,184,0.2);
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
        }

        /* Row shimmer on hover */
        .borrow-row:hover .name-shimmer {
          background: linear-gradient(90deg, #6d28d9, #0ea5e9, #6d28d9);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerRow 1.5s linear infinite;
        }

        /* Scanline (dark only) */
        .dark .dash-scanline {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 80px;
          background: linear-gradient(to bottom, transparent, rgba(139,92,246,0.025), transparent);
          animation: scanline 10s linear infinite;
          pointer-events: none;
          z-index: 0;
        }

        /* Risk row left-border accent */
        .risk-high   { border-left: 3px solid #ef4444; }
        .risk-medium { border-left: 3px solid #f59e0b; }
        .risk-low    { border-left: 3px solid #10b981; }
      `}</style>

      <div className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 dark:bg-[#080812] font-body relative">

        {/* ── Dark-mode ambient layer ── */}
        <div className="dark:block hidden fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Orbs */}
          <div className="orb-drift absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)' }} />
          <div className="orb-drift absolute bottom-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)', animationDelay: '-6s' }} />
          {/* Grid */}
          <div className="grid-pulse absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(139,92,246,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.07) 1px,transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
        </div>
        <div className="dash-scanline" />

        {/* ── Light-mode subtle grid ── */}
        <div className="dark:hidden absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

        {/* ── Page Header ── */}
        <div className="relative z-10">
          <PageHeader
            title="Portfolio Dashboard"
            subtitle={`${portfolio.total_students} borrowers · last updated just now`}
            actions={
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400
                              bg-emerald-50 dark:bg-emerald-500/10
                              border border-emerald-200 dark:border-emerald-500/20
                              px-3 py-1.5 rounded-full font-semibold font-body">
                <span className="pulse-dot w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full" />
                Live
              </div>
            }
          />
        </div>

        {/* ── Main content ── */}
        <div className="relative z-10 p-6 space-y-6 max-w-screen-xl mx-auto">

          {/* ── KPI Ribbon ── */}
          <div className="dash-section" style={{ animationDelay: '0ms' }}>
            <KPIRibbon data={portfolio} />
          </div>

          {/* ── Geographic Map ── */}
          <div className="dash-section" style={{ animationDelay: '80ms' }}>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4
                    border-b border-slate-100 dark:border-white/5">
                <div>
                  <p className={SECTION_TITLE}>Geographic Risk Spread</p>
                  <p className={SECTION_SUB}>
                    Borrower distribution across India · hover any marker for details
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-body font-semibold
                      text-violet-600 dark:text-violet-400
                      bg-violet-50 dark:bg-violet-500/10
                      border border-violet-200 dark:border-violet-500/20
                      px-3 py-1.5 rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {Object.keys(students?.reduce((acc, s) => {
                    // count unique inferred states — reuse same hash
                    let hash = 0;
                    const str = s.student_id || '';
                    for (let i = 0; i < str.length; i++) {
                      hash = ((hash << 5) - hash) + str.charCodeAt(i);
                      hash = hash & hash;
                    }
                    const stateKeys = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry', 'Jammu & Kashmir'];
                    acc[stateKeys[Math.abs(hash) % stateKeys.length]] = true;
                    return acc;
                  }, {} as Record<string, boolean>) || {}).length} states
                </div>
              </div>
              <div className="p-4 min-h-[420px]">
                <IndiaMapImage students={students || []} />
              </div>
            </div>
          </div>

          {/* ── Active Alerts ── */}
          <div className="dash-section" style={{ animationDelay: '140ms' }}>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4
                              border-b border-slate-100 dark:border-white/5">
                <div>
                  <p className={SECTION_TITLE}>Active Alerts</p>
                  <p className={SECTION_SUB}>Interventions currently requiring action</p>
                </div>
                <button
                  onClick={() => navigate('/alerts')}
                  className="flex items-center gap-1.5 text-xs font-semibold font-body
                             text-violet-600 dark:text-violet-400
                             bg-violet-50 dark:bg-violet-500/10
                             border border-violet-200 dark:border-violet-500/20
                             px-3 py-1.5 rounded-lg
                             hover:bg-violet-100 dark:hover:bg-violet-500/20
                             transition-colors"
                >
                  View all
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                {portfolio.recent_alerts?.length > 0 ? (
                  <AlertFeed alerts={portfolio.recent_alerts} />
                ) : (
                  /* ── Designed empty state ── */
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 rounded-2xl
                                    bg-emerald-50 dark:bg-emerald-500/10
                                    border border-emerald-100 dark:border-emerald-500/20
                                    flex items-center justify-center mb-4 shadow-sm">
                      <svg className="w-6 h-6 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-white font-display mb-1">
                      Portfolio is clear
                    </p>
                    <p className="text-xs text-slate-400 dark:text-white/30 font-body">
                      No active risk triggers at this time
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Borrower Table ── */}
          <div className="dash-section" style={{ animationDelay: '200ms' }}>
            <div className="glass-card rounded-3xl overflow-hidden">

              {/* Table header */}
              <div className="flex items-center justify-between px-8 py-6
                              border-b border-slate-200/60 dark:border-white/10">
                <div>
                  <h2 className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
                    Borrower List
                  </h2>
                  <p className="text-[13px] text-slate-500 dark:text-white/50 mt-1 font-body font-medium">
                    Click any row to open full risk profile
                  </p>
                </div>
                <span className="text-xs font-bold font-body tracking-wide
                                 text-slate-500 dark:text-white/60
                                 bg-slate-100 dark:bg-white/5
                                 border border-slate-200 dark:border-white/10
                                 px-4 py-2 rounded-full shadow-sm dark:shadow-none">
                  Showing {Math.min(visibleCount, students?.length || 0)} of {students?.length}
                </span>
              </div>

              {/* Column headers */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body table-fixed min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200/60 dark:border-white/5">
                      {[
                        /* Replaced strict w-32/w-40 with proportional percentages */
                        { label: 'Name', w: 'w-[30%]' },
                        { label: 'Course', w: 'w-[15%]' },
                        { label: 'Field', w: 'w-[25%]' },
                        { label: 'Status', w: 'w-[15%]' },
                        { label: 'Risk', w: 'w-[15%]' },
                      ].map(h => (
                        <th key={h.label}
                          className={`${h.w} px-8 py-4 text-left text-[11px] font-bold
                                      text-slate-500 dark:text-white/40
                                      uppercase tracking-widest font-display`}>
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {students?.slice(0, visibleCount).map((s, idx) => {
                      const riskClass =
                        s.risk_tier === 'HIGH' ? 'risk-high'
                          : s.risk_tier === 'MEDIUM' ? 'risk-medium'
                            : 'risk-low';

                      return (
                        <tr
                          key={s.student_id}
                          onClick={() => navigate(`/student/${s.student_id}`)}
                          className={`borrow-row cursor-pointer transition-all duration-200
                            border-b border-slate-100 dark:border-white/[0.03] last:border-0
                            ${riskClass}
                            ${idx % 2 === 0
                              ? 'bg-white dark:bg-transparent'
                              : 'bg-slate-50/40 dark:bg-white/[0.01]'}
                            hover:bg-violet-50/60 dark:hover:bg-violet-500/10
                            hover:shadow-[inset_0_0_0_1px_rgba(139,92,246,0.12)] dark:hover:shadow-[inset_0_0_0_1px_rgba(139,92,246,0.2)]
                          `}
                        >
                          {/* Name - Removed min-w/w classes from all <td> elements */}
                          <td className="px-8 py-4">
                            <p className="name-shimmer font-bold text-slate-800 dark:text-white text-sm font-display transition-all">
                              {s.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-white/40 mt-0.5 font-body font-medium">
                              {s.institute_tier}
                            </p>
                          </td>

                          {/* Course */}
                          <td className="px-8 py-4">
                            <span className="text-[13px] font-medium text-slate-600 dark:text-white/70 font-body">
                              {s.course_type}
                            </span>
                          </td>

                          {/* Field */}
                          <td className="px-8 py-4 truncate pr-8">
                            <span className="text-[13px] font-medium text-slate-600 dark:text-white/70 font-body">
                              {s.target_field}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-8 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full font-bold font-body uppercase tracking-wider border ${s.placement_status === 'placed'
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'
                              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${s.placement_status === 'placed' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                              {s.placement_status}
                            </span>
                          </td>

                          {/* Risk */}
                          <td className="px-8 py-4">
                            <RiskBadge tier={s.risk_tier} score={s.risk_score} size="xs" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Show More */}
              {students && visibleCount < students.length && (
                <div className="px-8 py-5 flex items-center justify-between
                                border-t border-slate-200/60 dark:border-white/10
                                bg-slate-50/80 dark:bg-white/[0.02]">
                  <span className="text-[13px] text-slate-500 dark:text-white/40 font-body font-medium">
                    {students.length - visibleCount} more borrowers not shown
                  </span>
                  <button
                    onClick={handleShowMore}
                    className="flex items-center gap-2 text-[13px] font-bold font-display tracking-wide
                               text-violet-600 dark:text-violet-400
                               bg-violet-50 dark:bg-violet-500/10
                               border border-violet-200 dark:border-violet-500/20
                               px-5 py-2.5 rounded-xl
                               hover:bg-violet-100 dark:hover:bg-violet-500/20
                               transition-all active:scale-95 shadow-sm dark:shadow-none"
                  >
                    Show 50 more
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* All loaded state */}
              {students && visibleCount >= students.length && students.length > 0 && (
                <div className="px-8 py-5 text-center border-t border-slate-200/60 dark:border-white/10
                                bg-slate-50/80 dark:bg-white/[0.02]">
                  <span className="text-[13px] font-medium text-slate-500 dark:text-white/40 font-body">
                    All {students.length} borrowers loaded
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
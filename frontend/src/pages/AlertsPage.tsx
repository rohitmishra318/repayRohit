import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlerts, usePatchAlert } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { Spinner } from '../components/shared/Spinner';
import type { Alert } from '../types';

const STATES: Array<'triggered' | 'actioned' | 'resolved'> = ['triggered', 'actioned', 'resolved'];

export function AlertsPage() {
  const navigate = useNavigate();
  const [stateFilter, setStateFilter] = useState<'triggered' | 'actioned' | 'resolved'>('triggered');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { data: alertsList = [], isLoading, error } = useAlerts(stateFilter);
  const patch = usePatchAlert();

  const handleMarkDone = (alertId: string, note: string) => {
    patch.mutate(
      { id: alertId, action: note || 'Reviewed' },
      {
        onSuccess: () => {
          setNotes(p => {
            const newNotes = { ...p };
            delete newNotes[alertId];
            return newNotes;
          });
        },
      }
    );
  };

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
        @keyframes orbDrift {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(25px,-18px) scale(1.05); }
        }
        @keyframes gridPulse {
          0%,100% { opacity: 0.04; }
          50%      { opacity: 0.075; }
        }

        .sector-reveal { animation: sectorReveal 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .orb-drift     { animation: orbDrift 14s ease-in-out infinite; }
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

        /* sector row - table hover effects */
        .sector-row {
          border-left: 3px solid transparent;
          transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
        }
        .sector-row:hover {
          background: rgba(99,102,241,0.04);
          border-left-color: rgba(124,58,237,0.35);
        }
        .dark .sector-row:hover {
          background: rgba(139,92,246,0.05);
          border-left-color: rgba(139,92,246,0.5);
        }
        .sector-row.high-risk:hover   { border-left-color: rgba(239,68,68,0.6); background: rgba(239,68,68,0.04); }
        .sector-row.medium-risk:hover { border-left-color: rgba(245,158,11,0.6); background: rgba(245,158,11,0.04); }
      `}</style>

      <div className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 dark:bg-[#080812] font-body relative min-h-screen">

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

        <div className="relative z-10">
          <PageHeader title="Alert Case List" subtitle="All triggered interventions requiring action" />
        </div>

        <div className="relative z-10 p-6 max-w-screen-xl mx-auto">

          {/* ── Segmented Control Filter ── */}
          <div className="flex gap-2 mb-8 p-1.5 bg-white/50 dark:bg-white/5 rounded-xl backdrop-blur-md border border-slate-200/60 dark:border-white/10 w-fit sector-reveal" style={{ animationDelay: '0ms' }}>
            {STATES.map(s => (
              <button key={s} onClick={() => setStateFilter(s)}
                className={`px-5 py-2 text-sm rounded-lg transition-all font-display font-bold tracking-wide ${stateFilter === s
                    ? 'bg-white dark:bg-white/10 text-violet-700 dark:text-violet-300 shadow-sm border border-slate-200/50 dark:border-white/5'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent'
                  }`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl text-red-700 dark:text-red-400 text-sm font-medium sector-reveal">
              Failed to load alerts: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          )}

          {isLoading ? (
            <div className="py-20">
              <Spinner label="Loading alerts..." />
            </div>
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden sector-reveal" style={{ animationDelay: '100ms' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-white/10">
                    {['Student', 'Course', 'Trigger', 'Severity', 'Assignee', 'Deadline', 'Action'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-display">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-white/5">
                  {!alertsList?.length && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-white/30 font-medium">
                        No alerts in state: <span className="font-bold text-slate-500 dark:text-white/50">{stateFilter}</span>
                      </td>
                    </tr>
                  )}
                  {alertsList?.map((alert: Alert, i: number) => (
                    <tr key={alert.id}
                      className={`sector-row ${alert.severity === 'high' ? 'high-risk' : 'medium-risk'}`}
                      style={{ animationDelay: `${150 + (i * 30)}ms` }}>
                      <td className="px-6 py-4">
                        <button onClick={() => navigate(`/student/${alert.student_id}`)}
                          className="font-display font-bold text-slate-800 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                          {alert.student_name}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-white/60 text-xs font-medium">{alert.student_course}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-white/80 font-medium">{alert.trigger_name}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${alert.severity === 'high'
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30'
                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30'
                          }`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-white/50 text-xs font-medium">{alert.assignee}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-white/70 text-xs font-mono font-medium">{alert.deadline || '—'}</td>
                      <td className="px-6 py-3">
                        {stateFilter === 'triggered' ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add note..."
                              value={notes[alert.id] || ''}
                              onChange={e => setNotes(p => ({ ...p, [alert.id]: e.target.value }))}
                              disabled={patch.isPending}
                              className="text-xs border border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-800 dark:text-white rounded-lg px-3 py-2 w-36 outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 dark:focus:border-violet-500 disabled:opacity-50 transition-all font-body placeholder:text-slate-400 dark:placeholder:text-white/20"
                            />
                            <button
                              onClick={() => handleMarkDone(alert.id, notes[alert.id])}
                              disabled={patch.isPending}
                              className="text-xs font-bold bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors font-display tracking-wide">
                              {patch.isPending ? 'Saving...' : 'Done'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-white/40 italic">{alert.action_taken || '—'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
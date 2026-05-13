import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlerts, usePatchAlert } from '../hooks';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/shared/Card';
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
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 dark:bg-slate-950">
      <PageHeader title="Alert Case List" subtitle="All triggered interventions requiring action" />
      <div className="p-6 max-w-screen-xl">

        {/* State filter */}
        <div className="flex gap-2 mb-5">
          {STATES.map(s => (
            <button key={s} onClick={() => setStateFilter(s)}
              className={`px-4 py-2 text-sm rounded-lg border transition-all font-medium ${
                stateFilter === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500'
              }`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm">
            Failed to load alerts: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        )}

        {isLoading ? <Spinner label="Loading alerts..." /> : (
          <Card padding="none">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  {['Student', 'Course', 'Trigger', 'Severity', 'Assignee', 'Deadline', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {!alertsList?.length && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400 dark:text-slate-500">
                      No alerts in state: {stateFilter}
                    </td>
                  </tr>
                )}
                {alertsList?.map((alert: Alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-3">
                      <button onClick={() => navigate(`/student/${alert.student_id}`)}
                        className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">
                        {alert.student_name}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-xs">{alert.student_course}</td>
                    <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{alert.trigger_name}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                        alert.severity === 'high'
                          ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700'
                          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700'
                      }`}>{alert.severity}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-xs">{alert.assignee}</td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-xs">{alert.deadline || '—'}</td>
                    <td className="px-5 py-3">
                      {stateFilter === 'triggered' ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add note..."
                            value={notes[alert.id] || ''}
                            onChange={e => setNotes(p => ({ ...p, [alert.id]: e.target.value }))}
                            disabled={patch.isPending}
                            className="text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1.5 w-32 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400" />
                          <button
                            onClick={() => handleMarkDone(alert.id, notes[alert.id])}
                            disabled={patch.isPending}
                            className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                            {patch.isPending ? 'Saving...' : 'Done'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">{alert.action_taken || '—'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
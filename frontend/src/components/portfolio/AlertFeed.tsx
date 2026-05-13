import { useNavigate } from 'react-router-dom';
import type { Alert } from '../../types';

interface Props { alerts: Alert[] }

const severityStyle = {
  high:   'bg-red-50 border-red-200 text-red-700',
  medium: 'bg-amber-50 border-amber-200 text-amber-700',
  low:    'bg-blue-50 border-blue-200 text-blue-700',
};

export function AlertFeed({ alerts }: Props) {
  const navigate = useNavigate();
  if (!alerts.length) {
    return <p className="text-sm text-slate-400 py-4 text-center">No active alerts</p>;
  }
  return (
    <div className="space-y-2">
      {alerts.slice(0, 5).map(a => (
        <button key={a.id} onClick={() => navigate(`/student/${a.student_id}`)}
          className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
          <span className={`mt-0.5 text-xs px-1.5 py-0.5 rounded border font-medium shrink-0 ${severityStyle[a.severity]}`}>
            {a.severity.toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800 truncate">{a.student_name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{a.trigger_name}</p>
          </div>
          <div className="shrink-0 text-xs text-slate-400">{a.deadline}</div>
        </button>
      ))}
    </div>
  );
}
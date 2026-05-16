import { useNavigate } from 'react-router-dom';
import type { Alert } from '../../types';

interface Props { alerts: Alert[] }

export function AlertFeed({ alerts }: Props) {
  const navigate = useNavigate();

  if (!alerts.length) {
    return (
      <p className="text-[13px] font-body font-medium text-slate-400 dark:text-white/40 py-6 text-center">
        No active alerts
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.slice(0, 5).map(a => {
        // Define dynamic theme classes based on severity
        const isHigh = a.severity === 'high';
        const isMedium = a.severity === 'medium';

        let cardClass = '';
        let badgeClass = '';

        if (isHigh) {
          cardClass = 'bg-rose-50/50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/10 hover:bg-rose-100/50 dark:hover:bg-rose-500/10';
          badgeClass = 'bg-rose-100/80 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30';
        } else if (isMedium) {
          cardClass = 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10 hover:bg-amber-100/50 dark:hover:bg-amber-500/10';
          badgeClass = 'bg-amber-100/80 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
        } else {
          // Low severity styling (Blue)
          cardClass = 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/10 hover:bg-blue-100/50 dark:hover:bg-blue-500/10';
          badgeClass = 'bg-blue-100/80 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
        }

        return (
          <button
            key={a.id}
            onClick={() => navigate(`/student/${a.student_id}`)}
            className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 border group active:scale-[0.98] ${cardClass}`}
          >
            {/* ── Severity Badge ── */}
            <span className={`mt-0.5 text-[10px] font-bold font-display uppercase tracking-widest px-2.5 py-1 rounded-lg border shrink-0 transition-colors ${badgeClass}`}>
              {a.severity}
            </span>

            {/* ── Text Content ── */}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold font-display tracking-wide text-slate-800 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {a.student_name}
              </p>
              <p className="text-[11px] font-medium font-body text-slate-500 dark:text-white/50 leading-relaxed truncate mt-0.5">
                {a.trigger_name}
              </p>
            </div>

            {/* ── Deadline ── */}
            {a.deadline && (
              <div className="shrink-0 text-[10px] font-bold font-mono tracking-widest uppercase text-slate-400 dark:text-white/30 pt-1">
                {a.deadline}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
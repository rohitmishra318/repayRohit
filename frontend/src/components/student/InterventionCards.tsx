import type { Intervention } from '../../types';

interface Props { interventions: Intervention[] }

const costColor: Record<string, string> = {
  'free':   'text-emerald-600 bg-emerald-50 border-emerald-200',
  'low':    'text-blue-600 bg-blue-50 border-blue-200',
  'medium': 'text-amber-600 bg-amber-50 border-amber-200',
  'high':   'text-red-600 bg-red-50 border-red-200',
};

export function InterventionCards({ interventions }: Props) {
  if (!interventions?.length) return <p className="text-sm text-slate-400">No recommendations available</p>;

  return (
    <div className="space-y-3">
      {interventions.slice(0, 3).map((item, i) => {
        const lift = typeof item.predicted_lift === 'number'
          ? `${(item.predicted_lift * 100).toFixed(0)}pp`
          : item.predicted_lift;
        const costKey = (item.cost || '').toLowerCase();
        const costClass = costColor[costKey] || costColor['low'];
        return (
          <div key={i} className="border border-slate-200 rounded-lg p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-sm font-medium text-slate-800">{item.name}</p>
              <span className="text-sm font-semibold text-emerald-600 shrink-0">+{lift}</span>
            </div>
            {item.description && (
              <p className="text-xs text-slate-500 mb-2">{item.description}</p>
            )}
            <div className="flex gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${costClass}`}>
                {item.cost || 'Free'}
              </span>
              {item.effort && (
                <span className="text-xs px-2 py-0.5 rounded-full border border-slate-200 text-slate-500 bg-slate-50">
                  {item.effort}
                </span>
              )}
              {item.time_to_impact && (
                <span className="text-xs text-slate-400 ml-auto">{item.time_to_impact}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
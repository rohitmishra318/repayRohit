import type { Intervention } from '../../types';

interface Props { interventions: Intervention[] }

// Added dark mode text, subtle backgrounds, and border colors for the badges
const costColor: Record<string, string> = {
  'zero cost': 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  'low cost': 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20',
  'medium cost': 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20',
  'high cost': 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20',
};

// Helper to format the category cleanly (e.g., "career_pivot" -> "Career Pivot")
const formatCategory = (str: string) => {
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export function InterventionCards({ interventions }: Props) {
  if (!interventions?.length) return <p className="text-sm text-slate-400 dark:text-slate-500">No recommendations available</p>;

  return (
    <div className="space-y-3">
      {interventions.slice(0, 3).map((item, i) => {
        // Use adjusted_lift_pp from the new backend data
        const lift = item.adjusted_lift_pp ? `+${item.adjusted_lift_pp}pp` : '';

        // Match the specific 'cost_tier' string
        const costKey = (item.cost_tier || '').toLowerCase();
        // Added dark mode default styling fallback
        const costClass = costColor[costKey] || 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10';

        return (
          <div
            key={item.id || i}
            // Card container styling with dark mode hover effects
            className="border border-slate-200 dark:border-white/5 rounded-lg p-4 bg-white dark:bg-slate-900/40 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-blue-50/30 dark:hover:bg-blue-500/10 transition-colors"
          >
            {/* Header: Name and Lift */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  {item.name}
                </p>
                {/* Display formatted category directly under the name */}
                {item.category && (
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    {formatCategory(item.category)}
                  </p>
                )}
              </div>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 shrink-0 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-500/20">
                {lift}
              </span>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                {item.description}
              </p>
            )}

            {/* Footer Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-auto">
              {/* Cost Tier */}
              {item.cost_tier && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${costClass}`}>
                  {item.cost_tier}
                </span>
              )}

              {/* Delivery Method */}
              {item.delivery && (
                <span className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/50 shadow-sm dark:shadow-none">
                  {item.delivery}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
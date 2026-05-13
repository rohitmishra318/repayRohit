interface Intervention {
  name: string;
  base_lift_pp: number;
  cost_tier: string;
  delivery: string;
  description: string;
}

interface Props { interventions: Intervention[] }

const COST_COLORS: Record<string, string> = {
  'Zero cost': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Low cost':  'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Medium cost': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

export function InterventionPanel({ interventions }: Props) {
  const maxLift = Math.max(...interventions.map(i => i.base_lift_pp), 1);
  return (
    <div className="space-y-3">
      <p className="text-xs text-white/25 font-body">Research-calibrated placement lift estimates</p>
      {interventions.map((item, i) => (
        <div key={i} className="bg-white/3 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-sm font-medium text-white/80 font-body">{item.name}</span>
            <span className="text-xs text-emerald-400 font-mono shrink-0">+{item.base_lift_pp}pp</span>
          </div>
          <div className="bg-white/5 rounded-full h-1 mb-3">
            <div className="bg-emerald-500 h-1 rounded-full transition-all"
              style={{ width: `${(item.base_lift_pp / maxLift) * 100}%` }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${COST_COLORS[item.cost_tier] || 'text-white/30 bg-white/5 border-white/10'}`}>
              {item.cost_tier}
            </span>
            <span className="text-xs text-white/25 font-body">{item.delivery}</span>
          </div>
        </div>
      ))}
      <p className="text-xs text-white/15 font-body">Lifts are priors — update as real outcomes accumulate</p>
    </div>
  );
}
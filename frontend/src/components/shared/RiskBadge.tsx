interface Props {
  tier: 'HIGH' | 'MEDIUM' | 'LOW';
  score?: number;
  size?: 'xs' | 'sm' | 'md';
}

const cfg = {
  HIGH:   { dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50 border-red-200'    },
  MEDIUM: { dot: 'bg-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200'  },
  LOW:    { dot: 'bg-emerald-500',text: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200'},
};

export function RiskBadge({ tier, score, size = 'sm' }: Props) {
  const c = cfg[tier];
  const cls = size === 'md' ? 'px-3 py-1.5 text-sm gap-2' : size === 'xs' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5';
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${cls} ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {tier}{score !== undefined ? ` · ${(score * 100).toFixed(0)}%` : ''}
    </span>
  );
}
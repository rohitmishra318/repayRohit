interface Props {
  tier: 'HIGH' | 'MEDIUM' | 'LOW';
  score?: number;
  size?: 'xs' | 'sm' | 'md';
}

const cfg = {
  HIGH: {
    dot: 'bg-red-500',
    text: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800',
  },

  MEDIUM: {
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800',
  },

  LOW: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800',
  },
};

export function RiskBadge({
  tier,
  score,
  size = 'sm',
}: Props) {
  const c = cfg[tier];

  const cls =
    size === 'md'
      ? 'px-3 py-1.5 text-sm gap-2'
      : size === 'xs'
        ? 'px-2 py-0.5 text-[11px] gap-1'
        : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`
        inline-flex items-center
        rounded-full border
        font-medium
        transition-colors duration-200
        ${cls}
        ${c.bg}
        ${c.text}
      `}
    >
      <span
        className={`
          w-1.5 h-1.5
          rounded-full
          ${c.dot}
        `}
      />

      {tier}
      {score !== undefined
        ? ` · ${(score * 100).toFixed(0)}%`
        : ''}
    </span>
  );
}
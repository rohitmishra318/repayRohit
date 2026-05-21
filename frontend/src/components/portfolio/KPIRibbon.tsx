import type { PortfolioSummary } from '../../types/index.ts';

interface Props { data: PortfolioSummary }

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const RupeeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M6 3h12M6 8h12M6 13l8.5 8L18 13" /><path d="M6 8a5 5 0 005 5" />
  </svg>
);

const GaugeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 2a10 10 0 11-6.88 17.24" /><path d="M12 12l-3.5-3.5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <path d="M2.05 12A10 10 0 0112 2" />
  </svg>
);

export function KPIRibbon({ data }: Props) {
  const totalValue = data.total_students * 850000;

  const riskColor =
    data.avg_risk_score >= 0.75 ? {
      val: 'text-red-500 dark:text-red-400',
      icon: 'text-red-400 dark:text-red-400',
      iconBg: 'bg-red-500/10 dark:bg-red-400/10',
    } : data.avg_risk_score >= 0.55 ? {
      val: 'text-amber-500 dark:text-amber-400',
      icon: 'text-amber-400 dark:text-amber-400',
      iconBg: 'bg-amber-500/10 dark:bg-amber-400/10',
    } : {
      val: 'text-emerald-500 dark:text-emerald-400',
      icon: 'text-emerald-400 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    };

  const kpis = [
    {
      label: 'Critical Risks',
      value: data.high_risk_count,
      sub: `${((data.high_risk_count / data.total_students) * 100).toFixed(1)}% of portfolio`,
      valueColor: 'text-red-500 dark:text-red-400',
      iconColor: 'text-red-400 dark:text-red-400',
      iconBg: 'bg-red-500/10 dark:bg-red-400/10',
      cardBg: 'bg-white dark:bg-red-950/20',
      border: 'border-slate-200/80 dark:border-red-900/30',
      Icon: AlertIcon,
    },
    {
      label: 'Total Students',
      value: data.total_students.toLocaleString(),
      sub: `${data.medium_risk_count} medium risk`,
      valueColor: 'text-slate-900 dark:text-white',
      iconColor: 'text-blue-500 dark:text-blue-400',
      iconBg: 'bg-blue-500/10 dark:bg-blue-400/10',
      cardBg: 'bg-white dark:bg-slate-800/40',
      border: 'border-slate-200/80 dark:border-slate-700/40',
      Icon: UsersIcon,
    },
    {
      label: 'Portfolio Value',
      value: `₹${(totalValue / 10000000).toFixed(1)}Cr`,
      sub: 'Estimated total exposure',
      valueColor: 'text-sky-600 dark:text-sky-400',

      iconColor: 'text-sky-500 dark:text-sky-400',
      iconBg: 'bg-sky-500/10 dark:bg-sky-400/10',
      cardBg: 'bg-white dark:bg-sky-950/20',
      border: 'border-slate-200/80 dark:border-sky-900/30',
      Icon: RupeeIcon,
    },
    {
      label: 'Avg Risk Score',
      value: `${(data.avg_risk_score * 100).toFixed(1)}%`,
      sub: data.avg_risk_score >= 0.75
        ? 'Portfolio at risk'
        : data.avg_risk_score >= 0.55
          ? 'Moderate exposure'
          : 'Healthy portfolio',
      valueColor: riskColor.val,

      iconColor: riskColor.icon,
      iconBg: riskColor.iconBg,
      cardBg: 'bg-white dark:bg-slate-800/40',
      border: 'border-slate-200/80 dark:border-slate-700/40',
      Icon: GaugeIcon,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map(k => (
        <div
          key={k.label}
          className={`
            relative rounded-2xl border-t-[3px] border ${k.topBorder} ${k.border} ${k.cardBg}
            p-5 backdrop-blur-sm
            shadow-sm dark:shadow-none
            transition-all duration-200
            hover:shadow-md dark:hover:shadow-none
            hover:-translate-y-0.5
          `}
        >
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]
                             text-slate-400 dark:text-white/30 font-body">
              {k.label}
            </span>
            {/* Icon box — explicit colors, never inherits opacity */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.iconBg}`}>
              <span className={k.iconColor}>
                <k.Icon />
              </span>
            </div>
          </div>

          {/* Value */}
          <div className={`font-display text-3xl font-bold tracking-tight mb-1 ${k.valueColor}`}>
            {k.value}
          </div>

          {/* Sub label */}
          <div className="text-[11px] text-slate-500 dark:text-white/30 font-body font-medium">
            {k.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
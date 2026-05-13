import  type {PortfolioSummary } from '../../types/index.ts';

interface Props { data: PortfolioSummary }

export function KPIRibbon({ data }: Props) {
  const totalValue = data.total_students * 850000; // estimated avg loan value

  const kpis = [
    {
      label: 'Critical Risks',
      value: data.high_risk_count,
      sub: `${((data.high_risk_count / data.total_students) * 100).toFixed(1)}% of portfolio`,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
      icon: '⚠',
    },

    {
      label: 'Total Students',
      value: data.total_students.toLocaleString(),
      sub: `${data.medium_risk_count} medium risk`,
      color: 'text-slate-900',
      bg: 'bg-slate-50',
      border: 'border-slate-100',
      icon: '👥',
    },
    {
      label: 'Portfolio Value',
      value: `₹${(totalValue / 10000000).toFixed(1)}Cr`,
      sub: 'Estimated total exposure',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      icon: '₹',
    },
    {
      label: 'Avg Risk Score',
      value: `${(data.avg_risk_score * 100).toFixed(1)}%`,
      sub: data.avg_risk_score >= 0.75 ? 'Portfolio at risk' : data.avg_risk_score >= 0.55 ? 'Moderate exposure' : 'Healthy portfolio',
      color: data.avg_risk_score >= 0.75 ? 'text-red-600' : data.avg_risk_score >= 0.55 ? 'text-amber-600' : 'text-emerald-600',
      bg: 'bg-slate-50',
      border: 'border-slate-100',
      icon: '◉',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map(k => (
        <div key={k.label} className={`rounded-xl border ${k.border} ${k.bg} p-5`}>
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{k.label}</span>
            <span className="text-base">{k.icon}</span>
          </div>
          <div className={`text-2xl font-semibold ${k.color} mb-1`}>{k.value}</div>
          <div className="text-xs text-slate-500">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}
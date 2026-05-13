interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  color?: 'default' | 'red' | 'amber' | 'emerald' | 'blue';
  trend?: { direction: 'up' | 'down'; value: string };
}

const colorMap = {
  default: 'text-slate-900',
  red: 'text-red-600',
  amber: 'text-amber-600',
  emerald: 'text-emerald-600',
  blue: 'text-blue-600',
};

export function StatCard({ label, value, sub, icon, color = 'default', trend }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-2xl font-semibold ${colorMap[color]}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-lg">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend.direction === 'up' ? 'text-red-600' : 'text-emerald-600'}`}>
          <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
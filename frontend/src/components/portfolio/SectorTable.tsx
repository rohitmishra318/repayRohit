import type { SectorExposure } from '../../types';

interface Props { data: SectorExposure[] }

export function SectorTable({ data }: Props) {
  return (
    <div className="space-y-2">
      {data.slice(0, 6).map((s) => {
        const riskPct = s.avg_risk * 100;
        const color = s.avg_risk >= 0.75 ? 'bg-red-500' : s.avg_risk >= 0.55 ? 'bg-amber-500' : 'bg-emerald-500';
        const textColor = s.avg_risk >= 0.75 ? 'text-red-600' : s.avg_risk >= 0.55 ? 'text-amber-600' : 'text-emerald-600';
        return (
          <div key={s.field} className="flex items-center gap-3">
            <div className="w-28 text-xs text-slate-600 truncate shrink-0">{s.field}</div>
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${riskPct}%` }} />
            </div>
            <div className={`text-xs font-mono font-medium w-10 text-right ${textColor}`}>
              {riskPct.toFixed(0)}%
            </div>
            <div className="text-xs text-slate-400 w-8 text-right">{s.student_count}</div>
          </div>
        );
      })}
    </div>
  );
}
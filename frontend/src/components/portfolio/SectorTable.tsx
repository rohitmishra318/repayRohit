import type { SectorExposure } from '../../types';

interface Props { data: SectorExposure[] }

export function SectorTable({ data }: Props) {
  if (!data?.length) return null;

  return (
    <div className="w-full flex flex-col">

      {/* 1. Integrated Grid Header (Guarantees perfect alignment) */}
      <div className="grid grid-cols-[3fr_5fr_120px_110px] gap-4 items-center pb-3 mb-3 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        <div>Field</div>
        <div>Risk Level Distribution</div>
        <div className="text-right">Avg Risk Score</div>
        <div className="text-right">Total Students</div>
      </div>

      {/* 2. Grid Data Rows */}
      <div className="space-y-3">
        {data.slice(0, 19).map((s) => {
          const riskPct = s.avg_risk * 100;

          // Color logic
          const isHigh = s.avg_risk >= 0.75;
          const isMedium = s.avg_risk >= 0.55;

          const barColor = isHigh ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500';
          const textColor = isHigh ? 'text-rose-600' : isMedium ? 'text-amber-600' : 'text-emerald-600';

          return (
            <div key={s.field} className="grid grid-cols-[3fr_5fr_120px_110px] gap-4 items-center group hover:bg-slate-50 p-1.5 -ml-1.5 rounded-lg transition-colors">

              {/* Field Name */}
              <div className="text-[13px] text-slate-700 font-medium truncate pr-4" title={s.field}>
                {s.field}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex items-center">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                  style={{ width: `${riskPct}%`, minWidth: riskPct > 0 ? '4px' : '0' }}
                />
              </div>

              {/* Percentage Score */}
              <div className={`text-[13px] font-mono font-bold text-right ${textColor}`}>
                {riskPct.toFixed(0)}%
              </div>

              {/* Student Count */}
              <div className="text-[13px] font-medium text-slate-500 text-right pr-2">
                {s.student_count.toLocaleString()}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
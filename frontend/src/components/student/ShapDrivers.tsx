interface ShapDriver {
  feature: string;
  direction: 'increases_risk' | 'reduces_risk';
  magnitude: number;
  display: string;
}

interface Props { drivers: ShapDriver[] }

const FEATURE_ICONS: Record<string, string> = {
  cgpa_percentile:          '🎓',
  internship_access_score:  '💼',
  ppo_binary:               '✅',
  demand_percentile:        '📈',
  months_since_graduation:  '📅',
  cert_count_norm:          '📜',
  placement_gap_months:     '⏱',
  data_trust_weight:        '🔒',
};

export function ShapDrivers({ drivers }: Props) {
  if (!drivers?.length) {
    return (
      <div className="p-4 text-center bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-400">
        No causal driver data available to analyze.
      </div>
    );
  }

  // Calculate max magnitude for bar width scaling
  const maxMag = Math.max(...drivers.map(d => Math.abs(d.magnitude ?? 0)), 0.001);

  return (
    <div className="flex flex-col">
      
      {/* Sleek Legend */}
      <div className="flex items-center gap-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]"></span>
          <span>Increases Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"></span>
          <span>Reduces Risk</span>
        </div>
      </div>

      {/* Drivers List */}
      <div className="space-y-4">
        {drivers.map((d, i) => {
          const icon = FEATURE_ICONS[d.feature] || '✨';
          const isIncreasingRisk = d.direction === 'increases_risk';
          const magnitude = d.magnitude ?? 0;
          const pct = (Math.abs(magnitude) / maxMag) * 100;

          return (
            <div key={i} className="group flex flex-col gap-2">
              <div className="flex items-center justify-between">
                
                <div className="flex items-center gap-3">
                  {/* Professional Icon Container */}
                  <div className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200/80 rounded shadow-sm text-sm group-hover:border-slate-300 transition-colors">
                    {icon}
                  </div>
                  <span className="text-[13px] font-medium text-slate-700">{d.display}</span>
                </div>

                {/* Magnitude Badge */}
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                  isIncreasingRisk 
                    ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {isIncreasingRisk ? '+' : '-'}{magnitude.toFixed(3)}
                </span>
              </div>
              
              {/* Diverging Bar Chart - Unified Track Design */}
              <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex mt-0.5">
                
                {/* Absolute Center Axis Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 z-10" />
                
                {/* Left side - Reduces risk (Green) */}
                <div className="flex-1 flex justify-end">
                  {!isIncreasingRisk && (
                    <div 
                      className="bg-emerald-500 h-full rounded-l-full transition-all duration-500 ease-out"
                      style={{ width: `${pct}%`, minWidth: pct > 0 ? '2px' : '0' }} 
                    />
                  )}
                </div>
                
                {/* Right side - Increases risk (Red) */}
                <div className="flex-1 flex justify-start">
                  {isIncreasingRisk && (
                    <div 
                      className="bg-rose-500 h-full rounded-r-full transition-all duration-500 ease-out"
                      style={{ width: `${pct}%`, minWidth: pct > 0 ? '2px' : '0' }} 
                    />
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
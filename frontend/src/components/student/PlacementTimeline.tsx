interface Props {
  p_3mo: number;
  p_6mo: number;
  p_12mo: number;
}

export function PlacementTimeline({ p_3mo, p_6mo, p_12mo }: Props) {
  const points = [
    { label: '3 Months', value: p_3mo, icon: '◷' },
    { label: '6 Months', value: p_6mo, icon: '◷' },
    { label: '12 Months', value: p_12mo, icon: '◷' },
  ];

  return (
    <div className="w-full flex flex-col space-y-4">
      {points.map((pt, i) => {
        const pct = pt.value * 100;
        
        // Define color states matching the professional badge styling
        let theme = {
          bar: 'bg-rose-500',
          badge: 'bg-rose-50 text-rose-600 border-rose-100',
        };

        if (pct >= 70) {
          theme = {
            bar: 'bg-emerald-500',
            badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          };
        } else if (pct >= 45) {
          theme = {
            bar: 'bg-amber-500',
            badge: 'bg-amber-50 text-amber-600 border-amber-100',
          };
        }

        return (
          <div key={i} className="group flex flex-col gap-2">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Professional Icon Container (Matches ShapDrivers) */}
                <div className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200/80 rounded shadow-sm text-sm group-hover:border-slate-300 transition-colors">
                  <span className="opacity-70">{pt.icon}</span>
                </div>
                <span className="text-[13px] font-medium text-slate-700">{pt.label}</span>
              </div>

              {/* Data Pill Badge */}
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${theme.badge}`}>
                {pct.toFixed(0)}%
              </span>
            </div>

            {/* Sleek Progress Track */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out ${theme.bar}`}
                style={{ width: `${pct}%`, minWidth: pct > 0 ? '4px' : '0' }} 
              />
            </div>

          </div>
        );
      })}

      {/* Refined Footer Note */}
      <div className="mt-2 pt-3 border-t border-slate-100 flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">
          Probability of placement · 80% CI
        </p>
      </div>
    </div>
  );
}
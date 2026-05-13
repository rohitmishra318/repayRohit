interface Props {
  score: number;
  label: string;
}

export function RiskGauge({ score, label }: Props) {
  const pct = score * 100;
  // SVG arc gauge
  const R = 70;
  const cx = 90, cy = 90;
  const startAngle = -200;
  const endAngle = 20;
  const totalDeg = endAngle - startAngle;
  const fillDeg = (score * totalDeg);


  function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
    const s = polarToCartesian(cx, cy, r, start);
    const e = polarToCartesian(cx, cy, r, end);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const color = score >= 0.75 ? '#DC2626' : score >= 0.55 ? '#D97706' : '#16A34A';
  const tier = score >= 0.75 ? 'HIGH RISK' : score >= 0.55 ? 'MEDIUM RISK' : 'LOW RISK';

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="180" height="130" viewBox="0 0 180 130">
          {/* Track */}
          <path d={arcPath(cx, cy, R, startAngle, endAngle)}
            fill="none" stroke="#E2E8F0" strokeWidth="10" strokeLinecap="round" />
          {/* Fill */}
          <path d={arcPath(cx, cy, R, startAngle, startAngle + fillDeg)}
            fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map(t => {
            const deg = startAngle + (t / 100) * totalDeg;
            const inner = polarToCartesian(cx, cy, R - 14, deg);
            const outer = polarToCartesian(cx, cy, R - 6, deg);
            return <line key={t} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#CBD5E1" strokeWidth="1.5" />;
          })}
          {/* Center value */}
          <text x={cx} y={cy + 8} textAnchor="middle" fontSize="22" fontWeight="700"
            fill={color} fontFamily="DM Sans, sans-serif">
            {pct.toFixed(0)}%
          </text>
          <text x={cx} y={cy + 26} textAnchor="middle" fontSize="9" fill="#94A3B8"
            fontFamily="DM Sans, sans-serif" letterSpacing="0.5">
            PLACEMENT RISK
          </text>
        </svg>
      </div>
      <div className="mt-1 text-center">
        <span className={`text-xs font-semibold tracking-widest uppercase ${
          score >= 0.75 ? 'text-red-600' : score >= 0.55 ? 'text-amber-600' : 'text-emerald-600'
        }`}>{tier}</span>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
import type { ShapDriver } from '../../types/risk';

interface Props { drivers: ShapDriver[] }

export function ShapDriverBars({ drivers }: Props) {
  const maxMag = Math.max(...drivers.map(d => d.magnitude), 0.01);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-white/30 font-body">Why this score?</p>
        <p className="text-xs text-white/20 font-body">↑ raises · ↓ lowers risk</p>
      </div>
      {drivers.map((d, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white/60 font-body">{d.display}</span>
            <span className={d.direction === 'increases_risk' ? 'text-red-400' : 'text-emerald-400'}>
              {d.direction === 'increases_risk' ? '↑' : '↓'} {d.magnitude.toFixed(3)}
            </span>
          </div>
          <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ${
                d.direction === 'increases_risk' ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${(d.magnitude / maxMag) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
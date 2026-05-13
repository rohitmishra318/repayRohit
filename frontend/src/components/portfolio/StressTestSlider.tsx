import { useState, useCallback } from 'react';
import { portfolioApi } from '../../api/portfolio';
import type { SectorExposure } from '../../types/portfolio';

interface Props { sectors: SectorExposure[] }

export function StressTestSlider({ sectors }: Props) {
  const [shock, setShock] = useState(20);
  const [field, setField] = useState(sectors[0]?.field || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (f: string, s: number) => {
    setLoading(true);
    try {
      const res = await portfolioApi.stressTest(f, s);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (f: string, s: number) => {
    setField(f); setShock(s);
    run(f, s);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center flex-wrap">
        <select value={field} onChange={e => handleChange(e.target.value, shock)}
          className="text-sm bg-white/5 border border-white/10 text-white/70 rounded-lg px-3 py-1.5 outline-none focus:border-purple-500/50 font-body">
          {sectors.map(s => <option key={s.field} value={s.field}>{s.field}</option>)}
        </select>
        <span className="text-sm text-white/30 font-body">demand drops</span>
        <span className="text-sm font-semibold text-white w-10 font-body">{shock}%</span>
      </div>
      <input type="range" min="0" max="50" value={shock}
        onChange={e => handleChange(field, Number(e.target.value))}
        className="w-full accent-purple-500" />
      {loading && <p className="text-xs text-white/30 font-body">Recalculating...</p>}
      {result && !loading && (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
          <div className="text-sm font-medium text-orange-300 mb-3 font-body">{result.shock_applied}</div>
          <div className="flex gap-6">
            {[
              { label: 'Before', value: result.baseline_high_risk, color: 'text-white' },
              { label: 'After', value: result.shocked_high_risk, color: 'text-red-400' },
              { label: 'New at risk', value: `+${result.new_at_risk}`, color: 'text-orange-400' },
            ].map(item => (
              <div key={item.label}>
                <div className="text-xs text-white/30 font-body">{item.label}</div>
                <div className={`text-2xl font-display font-semibold ${item.color}`}>{item.value}</div>
                <div className="text-xs text-white/20 font-body">high-risk</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
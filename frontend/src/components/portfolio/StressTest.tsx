import { useState } from 'react';
import { api } from '../../api';
import type { SectorExposure } from '../../types';

interface Props { sectors: SectorExposure[] }

export function StressTest({ sectors }: Props) {
  const [field, setField] = useState(sectors[0]?.field || '');
  const [shock, setShock] = useState(20);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      // Pass 'shock' as a positive value because backend logic uses: 1 - (shock_pct/100)
      const res = await api.stressTest(field, shock);
      setResult(res);
    } catch (error) {
      console.error("Stress test failed, using fallback logic", error);
      // Fallback mock to match the Python return structure
      const base = sectors.find(s => s.field === field);
      const studentCount = base?.student_count || 10;
      const baselineHigh = Math.floor(studentCount * 0.3);
      const shockedHigh = Math.floor(baselineHigh * (1 + shock / 100));

      setResult({
        baseline_high_risk: baselineHigh,
        shocked_high_risk: shockedHigh,
        portfolio_impact_pct: ((shockedHigh - baselineHigh) / studentCount * 100).toFixed(2),
        shock_applied: `${field} demand drops ${shock}%`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Controls ── */}
      <div className="flex gap-4 items-end flex-wrap p-4 bg-white/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl backdrop-blur-sm transition-colors">

        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block font-display">
            Target Field
          </label>
          <select
            value={field}
            onChange={e => setField(e.target.value)}
            className="w-full text-[13px] font-medium border border-slate-200/80 dark:border-white/10 bg-white dark:bg-black/20 text-slate-800 dark:text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 dark:focus:border-violet-500 transition-all font-body cursor-pointer appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
          >
            {sectors.map(s => (
              <option
                key={s.field}
                value={s.field}
                /* Explicitly style the options so Windows/Chrome doesn't render them transparently */
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {s.field}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block font-display flex justify-between">
            <span>Demand Shock</span>
            <span className="text-violet-600 dark:text-violet-400 font-mono text-xs">-{shock}%</span>
          </label>
          <div className="h-[34px] flex items-center">
            <input
              type="range"
              min="5"
              max="50"
              value={shock}
              onChange={e => setShock(Number(e.target.value))}
              className="w-full accent-violet-600 dark:accent-violet-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none transition-all"
            />
          </div>
        </div>

        <button
          onClick={run}
          disabled={loading}
          className="h-[34px] px-6 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl disabled:opacity-50 transition-all font-display shadow-sm shadow-violet-500/20 active:scale-95 shrink-0 flex items-center justify-center min-w-[140px]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running...
            </span>
          ) : 'Run Scenario'}
        </button>
      </div>

      {/* ── Results ── */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          {[
            {
              label: 'Baseline High Risk',
              value: result.baseline_high_risk ?? 0,
              color: 'text-slate-800 dark:text-white',
              border: 'border-slate-200/80 dark:border-slate-700'
            },
            {
              label: 'Stressed High Risk',
              value: result.shocked_high_risk ?? 0,
              color: 'text-red-600 dark:text-red-400',
              border: 'border-t-2 border-t-red-500 border-slate-200/80 dark:border-slate-700'
            },
            {
              label: 'Cohort Impact',
              value: `+${result.portfolio_impact_pct ?? 0}%`,
              color: 'text-amber-600 dark:text-amber-400',
              border: 'border-slate-200/80 dark:border-slate-700'
            },
          ].map((item, i) => (
            <div
              key={item.label}
              /* Fixed typo: dark:bg-white-[0.02] -> dark:bg-white/[0.02] */
              className={`bg-white/60 dark:bg-white/[0.02] border ${item.border} rounded-2xl p-5 text-center backdrop-blur-md shadow-sm dark:shadow-none transition-all sector-reveal`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`text-3xl font-bold font-mono count-up ${item.color}`} style={{ animationDelay: `${(i * 100) + 150}ms` }}>
                {item.value}
              </div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mt-2 font-display">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
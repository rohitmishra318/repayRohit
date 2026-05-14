import { useState } from 'react';
import type { RiskData } from '../../types';

interface Props {
  baseRisk: RiskData;
  currentProfile: {
    cgpa: number;
    ppo_exists: boolean;
    internship_employer_tier: string;
    cert_count: number;
  };
}

type Action = 'add_internship' | 'get_cert' | 'ppo' | 'improve_cgpa';

// --- Professional SVG Icons ---
const Icons = {
  Briefcase: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
  Award: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>,
  CheckCircle: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>,
  TrendingUp: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>,
  Check: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M20 6 9 17l-5-5" /></svg>
};

const ACTIONS: { id: Action; label: string; icon: JSX.Element; desc: string; liftRange: [number, number] }[] = [
  { id: 'add_internship', label: 'Complete Internship', icon: Icons.Briefcase, desc: 'Add a verified internship', liftRange: [0.08, 0.15] },
  { id: 'get_cert', label: 'Get Certification', icon: Icons.Award, desc: 'Industry certification', liftRange: [0.03, 0.06] },
  { id: 'ppo', label: 'Secure PPO', icon: Icons.CheckCircle, desc: 'Pre-placement offer secured', liftRange: [0.18, 0.25] },
  { id: 'improve_cgpa', label: 'Improve CGPA 0.5', icon: Icons.TrendingUp, desc: 'Academic improvement', liftRange: [0.04, 0.08] },
];

export function WhatIfSimulator({ baseRisk, currentProfile }: Props) {
  const [selected, setSelected] = useState<Set<Action>>(new Set());

  const toggle = (id: Action) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  // Calculate simulated score
  let simScore = baseRisk.risk_score;
  selected.forEach(id => {
    const action = ACTIONS.find(a => a.id === id)!;
    const lift = (action.liftRange[0] + action.liftRange[1]) / 2;
    simScore = Math.max(0.05, simScore - lift);
  });

  const improvement = baseRisk.risk_score - simScore;

  // Added dark mode text colors for the score readouts
  const color = simScore >= 0.75
    ? 'text-red-600 dark:text-red-400'
    : simScore >= 0.55
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-emerald-600 dark:text-emerald-400';

  // Added subtle neon glow effects for the progress bar in dark mode
  const barColor = simScore >= 0.75
    ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
    : simScore >= 0.55
      ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
      : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACTIONS.map((action, i) => {
          const isSelected = selected.has(action.id);
          const disabled = action.id === 'ppo' && currentProfile.ppo_exists;

          return (
            <button
              key={action.id}
              disabled={disabled}
              onClick={() => toggle(action.id)}
              className={`text-left p-4 rounded-2xl border transition-all duration-200 animate-in fade-in zoom-in-95 group ${isSelected
                  ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700/50 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.1)] dark:shadow-[inset_0_0_0_1px_rgba(139,92,246,0.2)]'
                  : disabled
                    ? 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-100 dark:border-white/5 opacity-60 cursor-not-allowed'
                    : 'bg-slate-50/80 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/5 hover:border-violet-300 dark:hover:border-violet-500/50 hover:bg-white dark:hover:bg-white/[0.04]'
                }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className={`transition-colors ${isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-white/30 group-hover:text-violet-500 dark:group-hover:text-violet-400'}`}>
                  {action.icon}
                </span>
                <span className={`font-bold font-display tracking-wide text-[13px] transition-colors ${isSelected ? 'text-violet-900 dark:text-violet-200' : 'text-slate-700 dark:text-white/80 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                  {action.label}
                </span>
                {isSelected && (
                  <span className="ml-auto text-violet-600 dark:text-violet-400 animate-in zoom-in">
                    {Icons.Check}
                  </span>
                )}
              </div>
              <div className={`text-[11px] font-medium font-body pl-6.5 transition-colors ${isSelected ? 'text-violet-600/80 dark:text-violet-300/60' : 'text-slate-500 dark:text-white/40'}`}>
                {action.desc}
              </div>
            </button>
          );
        })}
      </div>

      {selected.size > 0 && (
        <div className="bg-white/60 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-sm dark:shadow-none animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest font-display">Simulated Risk Score</span>
            <span className={`text-2xl font-bold font-mono ${color}`}>
              {(simScore * 100).toFixed(0)}%
            </span>
          </div>

          <div className="bg-slate-200/60 dark:bg-white/10 rounded-full h-1.5 mb-4 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
              style={{ width: `${simScore * 100}%` }} />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold font-body uppercase tracking-wider">
            <span className="text-slate-400 dark:text-white/40">Current: {(baseRisk.risk_score * 100).toFixed(0)}%</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              {(improvement * 100).toFixed(0)}pp improvement
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
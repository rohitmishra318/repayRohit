import { useState } from 'react';
import type  { RiskData } from '../../types';

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

const ACTIONS: { id: Action; label: string; icon: string; desc: string; liftRange: [number, number] }[] = [
  { id: 'add_internship', label: 'Complete Internship', icon: '💼', desc: 'Add a verified internship', liftRange: [0.08, 0.15] },
  { id: 'get_cert', label: 'Get Certification', icon: '📜', desc: 'Industry certification', liftRange: [0.03, 0.06] },
  { id: 'ppo', label: 'Secure PPO', icon: '✅', desc: 'Pre-placement offer secured', liftRange: [0.18, 0.25] },
  { id: 'improve_cgpa', label: 'Improve CGPA 0.5', icon: '📈', desc: 'Academic improvement', liftRange: [0.04, 0.08] },
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
  const color = simScore >= 0.75 ? 'text-red-600' : simScore >= 0.55 ? 'text-amber-600' : 'text-emerald-600';
  const barColor = simScore >= 0.75 ? 'bg-red-500' : simScore >= 0.55 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map(action => {
          const isSelected = selected.has(action.id);
          const disabled = action.id === 'ppo' && currentProfile.ppo_exists;
          return (
            <button key={action.id} disabled={disabled}
              onClick={() => toggle(action.id)}
              className={`text-left p-3 rounded-lg border transition-all text-sm ${
                isSelected
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : disabled
                  ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 text-slate-700'
              }`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span>{action.icon}</span>
                <span className="font-medium text-xs">{action.label}</span>
                {isSelected && <span className="ml-auto text-blue-600">✓</span>}
              </div>
              <div className="text-xs text-slate-400">{action.desc}</div>
            </button>
          );
        })}
      </div>

      {selected.size > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">Simulated Risk Score</span>
            <span className={`text-lg font-semibold font-mono ${color}`}>
              {(simScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="bg-slate-200 rounded-full h-2 mb-2">
            <div className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${simScore * 100}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Current: {(baseRisk.risk_score * 100).toFixed(0)}%</span>
            <span className="text-emerald-600 font-medium">
              ↓ {(improvement * 100).toFixed(0)}pp improvement
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';

interface Props {
  score: number;
  label: string;
}

export function RiskGauge({ score, label }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const pct = score * 100;

  // SVG Parameters
  const size = 160;
  const center = size / 2;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2 - 8; // Inner radius
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore * circumference);

  const isHigh = score >= 0.75;
  const isMedium = score >= 0.55 && score < 0.75;

  // Theme-adaptive classes
  const colorClass = isHigh
    ? 'text-red-500 dark:text-red-400'
    : isMedium
      ? 'text-amber-500 dark:text-amber-400'
      : 'text-emerald-500 dark:text-emerald-400';

  const glowColor = isHigh
    ? 'rgba(239,68,68,0.5)'
    : isMedium
      ? 'rgba(245,158,11,0.5)'
      : 'rgba(16,185,129,0.5)';

  const tier = isHigh ? 'HIGH RISK' : isMedium ? 'MEDIUM RISK' : 'LOW RISK';

  return (
    <div className="flex flex-col items-center sector-reveal">

      {/* ── Visual Gauge Container ── */}
      <div className="relative flex items-center justify-center w-[160px] h-[160px]">

        {/* Background Glow (Dark Mode Only) */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-0 dark:opacity-20 transition-opacity duration-1000"
          style={{ backgroundColor: glowColor, transform: 'scale(0.8)' }}
        />

        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 relative z-10 overflow-visible">

          {/* Outer Decorative Dashed Ring (Radar effect) */}
          <circle
            cx={center}
            cy={center}
            r={radius + 12}
            fill="none"
            className="stroke-slate-300 dark:stroke-white/10"
            strokeWidth="1.5"
            strokeDasharray="2 6"
          />

          {/* Inner Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className="stroke-slate-100 dark:stroke-white/5"
            strokeWidth={strokeWidth}
          />

          {/* Animated Foreground Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className={`stroke-current ${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`
            }}
          />
        </svg>

        {/* ── Centered HTML Typography ── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className={`text-3xl font-bold font-mono tracking-tight ${colorClass} transition-colors duration-500`}>
            {pct.toFixed(0)}<span className="text-xl opacity-70">%</span>
          </span>
          <span className="text-[9px] font-bold font-display text-slate-400 dark:text-white/40 tracking-[0.2em] mt-0.5">
            RISK
          </span>
        </div>

      </div>

      {/* ── Footer Information ── */}
      <div className="mt-4 text-center flex flex-col gap-1.5 items-center">
        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-[10px] font-bold font-display tracking-widest uppercase border ${isHigh ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30' :
            isMedium ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30' :
              'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'
          }`}>
          {tier}
        </span>
        <p className="text-[11px] font-medium font-body text-slate-500 dark:text-white/50 max-w-[140px] leading-tight">
          {label}
        </p>
      </div>
    </div>
  );
}
import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

interface Props { p_3mo: number; p_6mo: number; p_12mo: number; }

export function SurvivalCurveChart({ p_3mo, p_6mo, p_12mo }: Props) {
  const data = [
    { month: 0,  prob: 100, ci_hi: 100, ci_lo: 100 },
    { month: 3,  prob: p_3mo * 100, ci_hi: Math.min(100, p_3mo * 100 + 12), ci_lo: Math.max(0, p_3mo * 100 - 12) },
    { month: 6,  prob: p_6mo * 100, ci_hi: Math.min(100, p_6mo * 100 + 10), ci_lo: Math.max(0, p_6mo * 100 - 10) },
    { month: 12, prob: p_12mo * 100, ci_hi: Math.min(100, p_12mo * 100 + 8),  ci_lo: Math.max(0, p_12mo * 100 - 8) },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
          label={{ value: 'Months', position: 'insideBottom', offset: -10, fontSize: 11, fill: 'rgba(255,255,255,0.2)' }} />
        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`}
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
        <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`}
          contentStyle={{ background: '#1E1E28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: 'rgba(255,255,255,0.4)' }}
          itemStyle={{ color: 'rgba(255,255,255,0.8)' }} />
        <ReferenceLine x={6} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
        <Area type="monotone" dataKey="ci_hi" stroke="none" fill="url(#rg)" />
        <Area type="monotone" dataKey="ci_lo" stroke="none" fill="#0F0F13" />
        <Area type="monotone" dataKey="prob" stroke="#7C5CFC" strokeWidth={2}
          fill="transparent" dot={{ r: 4, fill: '#7C5CFC', strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
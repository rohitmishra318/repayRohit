import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import type { SectorExposure } from '../../types/portfolio';

interface Props { data: SectorExposure[] }

function riskColor(r: number) {
  if (r >= 0.7) return '#EF4444';
  if (r >= 0.4) return '#F59E0B';
  return '#22C55E';
}

export function SectorExposureChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 70, right: 30, top: 5, bottom: 5 }}>
        <XAxis type="number" domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`}
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
        <YAxis type="category" dataKey="field" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} width={70} />
        <Tooltip
          formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
          contentStyle={{ background: '#1E1E28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
          itemStyle={{ color: 'rgba(255,255,255,0.8)' }}
        />
        <Bar dataKey="avg_risk" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => <Cell key={i} fill={riskColor(d.avg_risk)} fillOpacity={0.8} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
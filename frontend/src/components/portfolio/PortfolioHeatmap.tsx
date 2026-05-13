import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import type { StudentListItem } from '../../types/student';

interface Props { students: StudentListItem[] }

const TIER_COLOR = { HIGH: '#EF4444', MEDIUM: '#F59E0B', LOW: '#22C55E' };
const COURSE_TYPES = ['Engineering', 'MBA', 'Nursing', 'Arts', 'CA'];

export function PortfolioHeatmap({ students }: Props) {
  const navigate = useNavigate();

  const data = students.map(s => ({
    x: s.months_since_graduation,
    y: Math.max(0, COURSE_TYPES.indexOf(s.course_type)),
    student_id: s.student_id,
    name: s.name || 'Student',
    risk_score: s.risk_score,
    tier: s.risk_tier,
  }));

  return (
    <div>
      <p className="text-xs text-white/25 mb-3 font-body">Click any dot to open student risk card</p>
      <ResponsiveContainer width="100%" height={200}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 40 }}>
          <XAxis dataKey="x" type="number" domain={[0, 18]} name="Months"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            label={{ value: 'Months post-graduation', position: 'insideBottom', offset: -10, fontSize: 11, fill: 'rgba(255,255,255,0.2)' }} />
          <YAxis dataKey="y" type="number" domain={[-0.5, 4.5]} ticks={[0,1,2,3,4]}
            tickFormatter={v => COURSE_TYPES[v] || ''}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
          <Tooltip
            cursor={false}
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-[#1E1E28] border border-white/10 rounded-xl p-3 text-xs shadow-xl">
                  <div className="font-medium text-white mb-1">{d.name}</div>
                  <div className="text-white/40">{(d.risk_score * 100).toFixed(0)}% risk · {d.tier}</div>
                </div>
              );
            }}
          />
          <Scatter data={data} onClick={d => navigate(`/student/${d.student_id}`)}>
            {data.map((d, i) => (
              <Cell key={i} fill={TIER_COLOR[d.tier as keyof typeof TIER_COLOR]}
                style={{ cursor: 'pointer' }} fillOpacity={0.85} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2">
        {Object.entries(TIER_COLOR).map(([tier, color]) => (
          <div key={tier} className="flex items-center gap-1.5 text-xs text-white/30 font-body">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            {tier}
          </div>
        ))}
      </div>
    </div>
  );
}
// Static mock — no backend endpoint exists for activity feed

const MOCK_ACTIVITIES = [
  { id: 1, time: '2 hours ago', icon: '🔍', text: 'Risk score recalculated', detail: 'ML model re-run triggered', type: 'info' },
  { id: 2, time: '1 day ago',  icon: '📊', text: 'SHAP analysis updated',  detail: 'New feature importances computed', type: 'info' },
  { id: 3, time: '2 days ago', icon: '⚠️', text: 'Alert triggered',       detail: 'No internship and no PPO detected', type: 'warning' },
  { id: 4, time: '4 days ago', icon: '💡', text: 'New interventions ready', detail: '3 recommendations available', type: 'success' },
  { id: 5, time: '1 week ago', icon: '🎓', text: 'Profile onboarded',      detail: 'MBA · Campus family · Tier-2', type: 'info' },
];

export function ActivityFeed() {
  return (
    <div className="space-y-0">
      {MOCK_ACTIVITIES.map((a, i) => (
        <div key={a.id} className="flex gap-3 relative">
          {/* Timeline line */}
          {i < MOCK_ACTIVITIES.length - 1 && (
            <div className="absolute left-[18px] top-8 bottom-0 w-px bg-slate-100" />
          )}
          <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm shrink-0 z-10 ${
            a.type === 'warning' ? 'bg-amber-50 border-amber-200' :
            a.type === 'success' ? 'bg-emerald-50 border-emerald-200' :
            'bg-slate-50 border-slate-200'
          }`}>
            {a.icon}
          </div>
          <div className="pb-4 min-w-0">
            <p className="text-sm font-medium text-slate-800">{a.text}</p>
            <p className="text-xs text-slate-400">{a.detail}</p>
            <p className="text-xs text-slate-300 mt-0.5">{a.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
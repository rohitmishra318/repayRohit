import React from 'react';

// --- Professional SVG Icons ---
const Icons = {
  Process: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>,
  Chart: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  Alert: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Zap: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  User: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>
};

// Static mock — no backend endpoint exists for activity feed
const MOCK_ACTIVITIES = [
  { id: 1, time: '2 hours ago', icon: Icons.Process, text: 'Risk score recalculated', detail: 'ML model re-run triggered', type: 'info' },
  { id: 2, time: '1 day ago', icon: Icons.Chart, text: 'SHAP analysis updated', detail: 'New feature importances computed', type: 'info' },
  { id: 3, time: '2 days ago', icon: Icons.Alert, text: 'Alert triggered', detail: 'No internship and no PPO detected', type: 'warning' },
  { id: 4, time: '4 days ago', icon: Icons.Zap, text: 'New interventions ready', detail: '3 recommendations available', type: 'success' },
  { id: 5, time: '1 week ago', icon: Icons.User, text: 'Profile onboarded', detail: 'MBA · Campus family · Tier-2', type: 'info' },
];

export function ActivityFeed() {
  return (
    <div className="space-y-0 mt-2">
      {MOCK_ACTIVITIES.map((a, i) => {

        // Golden Standard Theme Colors
        let themeClasses = 'bg-violet-50 dark:bg-violet-500/10 border-violet-200/80 dark:border-violet-500/20 text-violet-600 dark:text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.15)]';
        if (a.type === 'warning') {
          themeClasses = 'bg-amber-50 dark:bg-amber-500/10 border-amber-200/80 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]';
        } else if (a.type === 'success') {
          themeClasses = 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/80 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
        }

        return (
          <div key={a.id} className="flex gap-4 relative group animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>

            {/* Timeline line */}
            {i < MOCK_ACTIVITIES.length - 1 && (
              <div className="absolute left-[19px] top-10 bottom-0 w-px bg-slate-200/60 dark:bg-white/10 group-hover:bg-violet-300 dark:group-hover:bg-violet-500/30 transition-colors duration-300" />
            )}

            {/* Icon Badge */}
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 ${themeClasses}`}>
              {a.icon}
            </div>

            {/* Content Payload */}
            <div className="pb-6 min-w-0 flex-1">
              <p className="text-[13px] font-bold font-display tracking-wide text-slate-800 dark:text-white transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
                {a.text}
              </p>
              <p className="text-xs text-slate-500 dark:text-white/50 font-body mt-0.5 leading-relaxed">
                {a.detail}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                <p className="text-[10px] font-bold font-mono tracking-widest uppercase text-slate-400 dark:text-white/30">
                  {a.time}
                </p>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
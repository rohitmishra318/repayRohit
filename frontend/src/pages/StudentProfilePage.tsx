import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { useUpdateProfile } from '../hooks/useStudents';
import { PageHeader } from '../components/layout/PageHeader';
import { Spinner } from '../components/shared/Spinner';
import { ActivityFeed } from '../components/student/ActivityFeed';
import type { StudentUpdatePayload } from '../types';

// --- Professional SVG Icons ---
const Icons = {
  GPA: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
  Briefcase: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
  Award: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>,
  ShieldCheck: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>,
  FileText: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>,
  Target: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
  Building: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>,
  Hourglass: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M5 22h14" /><path d="M5 2h14" /><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" /><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" /></svg>
};

export function StudentProfilePage() {
  const { student, isLoading } = useSession();
  const updateProfileMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudentUpdatePayload>({});

  if (isLoading) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812]">
        <Spinner size="lg" label="Loading profile..." />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812] text-slate-500 dark:text-white/40 font-body font-medium">
        Please log in to view your profile.
      </div>
    );
  }

  const SID = student.student_id || '';

  const handleEditClick = () => {
    setFormData({
      cgpa: student.cgpa,
      internship_count: student.internship_count,
      cert_count: student.cert_count,
      ppo_exists: student.ppo_exists,
      tenth_board_score: student.tenth_board_score || undefined,
      twelfth_board_score: student.twelfth_board_score || undefined,
      target_field: student.target_field,
      target_city_tier: student.target_city_tier,
      months_since_graduation: student.months_since_graduation,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleSave = () => {
    updateProfileMutation.mutate(
      { id: SID, data: formData },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleChange = (field: keyof StudentUpdatePayload, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* ── Golden Standard Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;600&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .font-mono    { font-family: 'JetBrains Mono', monospace; }

        @keyframes sectorReveal {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridPulse {
          0%,100% { opacity: 0.04; }
          50%      { opacity: 0.075; }
        }

        .sector-reveal { animation: sectorReveal 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .grid-pulse    { animation: gridPulse 5s ease-in-out infinite; }

        /* glass card — dual theme */
        .glass-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148,163,184,0.18);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04);
        }
        .dark .glass-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: none;
        }
      `}</style>

      <div className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 dark:bg-[#080812] font-body relative min-h-screen">

        {/* ── Ambient Grid (NO PURPLE ORBS) ── */}
        <div className="dark:block hidden fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="grid-pulse absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.07) 1px,transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
        </div>

        <div className="dark:hidden absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

        <div className="relative z-10 shrink-0">
          <PageHeader
            title="My Profile"
            subtitle={`${student.name} · ${student.course}`}
          />
        </div>

        <div className="relative z-10 p-6 max-w-[1400px] mx-auto space-y-6 pb-20">

          {/* ── PROFILE SNAPSHOT CARD ── */}
          <div className="glass-card rounded-3xl p-8 sector-reveal" style={{ animationDelay: '0ms' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-slate-200/60 dark:border-white/10 pb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white mb-1">Academic & Professional Snapshot</h2>
                <span className="text-[11px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest font-mono">ID: {SID}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {!isEditing ? (
                  <button
                    onClick={handleEditClick}
                    className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 border border-violet-200/80 dark:border-violet-500/20 px-5 py-2.5 rounded-xl shadow-sm dark:shadow-none transition-all font-display active:scale-95"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCancel}
                      className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/70 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 px-5 py-2.5 rounded-xl shadow-sm dark:shadow-none transition-all font-display active:scale-95"
                      disabled={updateProfileMutation.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="text-xs font-bold uppercase tracking-wider text-white bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 px-5 py-2.5 rounded-xl shadow-sm shadow-violet-500/20 transition-all font-display flex items-center gap-2 active:scale-95"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                {[
                  { label: 'CGPA', value: student.cgpa.toFixed(2), icon: Icons.GPA },
                  { label: 'Internships', value: student.internship_count, icon: Icons.Briefcase },
                  { label: 'Certifications', value: student.cert_count, icon: Icons.Award },
                  { label: 'PPO Secured', value: student.ppo_exists ? 'Yes' : 'No', icon: Icons.ShieldCheck },
                  { label: '10th Score', value: student.tenth_board_score ? `${student.tenth_board_score}%` : 'N/A', icon: Icons.FileText },
                  { label: '12th Score', value: student.twelfth_board_score ? `${student.twelfth_board_score}%` : 'N/A', icon: Icons.FileText },
                  { label: 'Target Field', value: student.target_field, icon: Icons.Target },
                  { label: 'Target City Tier', value: `Tier ${student.target_city_tier}`, icon: Icons.Building },
                  { label: 'Graduation', value: `${student.months_since_graduation} mo ago`, icon: Icons.Hourglass },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.04] transition-colors border border-slate-200/60 dark:border-white/5 group">
                    <span className="text-slate-400 dark:text-white/30 group-hover:text-violet-500 transition-colors flex items-center justify-center">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest font-display truncate mb-1">{item.label}</p>
                      <p className="text-[15px] font-semibold text-slate-800 dark:text-white truncate font-body" title={String(item.value)}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-2 animate-in fade-in zoom-in-95 duration-300">
                {[
                  { label: 'CGPA', type: 'number', field: 'cgpa', step: '0.1' },
                  { label: 'Internships', type: 'number', field: 'internship_count' },
                  { label: 'Certifications', type: 'number', field: 'cert_count' },
                  { label: '10th Board Score (%)', type: 'number', field: 'tenth_board_score' },
                  { label: '12th Board Score (%)', type: 'number', field: 'twelfth_board_score' },
                  { label: 'Target Field', type: 'text', field: 'target_field' },
                  { label: 'Months Since Graduation', type: 'number', field: 'months_since_graduation' },
                ].map((input) => (
                  <div key={input.field} className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-display block">
                      {input.label}
                    </label>
                    <input
                      type={input.type}
                      step={input.step}
                      className="w-full px-4 py-2.5 text-[13px] font-medium border border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 dark:focus:border-violet-500 transition-all font-body"
                      value={(formData as any)[input.field] ?? ''}
                      onChange={(e) => handleChange(input.field as keyof StudentUpdatePayload, input.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-display block">
                    Target City Tier
                  </label>
                  <select
                    className="w-full px-4 py-2.5 text-[13px] font-medium border border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 dark:focus:border-violet-500 transition-all font-body cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.75rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                    value={formData.target_city_tier || 1}
                    onChange={(e) => handleChange('target_city_tier', parseInt(e.target.value))}
                  >
                    <option value={1} className="bg-white dark:bg-slate-900">Tier 1</option>
                    <option value={2} className="bg-white dark:bg-slate-900">Tier 2</option>
                    <option value={3} className="bg-white dark:bg-slate-900">Tier 3</option>
                  </select>
                </div>

                <div className="space-y-2 flex items-center pt-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="checkbox"
                        className="peer w-5 h-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 dark:border-slate-600 checked:bg-violet-600 checked:border-violet-600 transition-all"
                        checked={formData.ppo_exists || false}
                        onChange={(e) => handleChange('ppo_exists', e.target.checked)}
                      />
                      <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-display group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      PPO Secured (Pre-Placement Offer)
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ── ACTIVITY FEED CARD ── */}
          <div className="glass-card rounded-3xl p-8 sector-reveal" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-6 border-b border-slate-200/60 dark:border-white/10 pb-4">
              <h2 className="text-lg font-bold font-display tracking-tight text-slate-900 dark:text-white">Live Activity Feed</h2>
              <button className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 uppercase tracking-widest font-display transition-colors">
                View All
              </button>
            </div>
            <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl p-4">
              <ActivityFeed />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
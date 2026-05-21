import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { useUpdateProfile } from '../hooks/useStudents';
import { PageHeader } from '../components/layout/PageHeader';
import { Spinner } from '../components/shared/Spinner';
import type { StudentUpdatePayload } from '../types';

// ── Icons ──────────────────────────────────────────────────────────────────
const GpaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect width="20" height="14" x="2" y="7" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
  </svg>
);
const AwardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
  </svg>
);
const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" />
    <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const TrendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);
const CreditCardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

// ── Stat tile ──────────────────────────────────────────────────────────────
function StatTile({
  label, value, icon, accent = 'violet', sub,
}: {
  label: string; value: string | number; icon: React.ReactNode;
  accent?: 'violet' | 'sky' | 'emerald' | 'amber' | 'rose' | 'slate';
  sub?: string;
}) {
  const colors = {
    violet: { icon: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-100 dark:border-violet-500/15' },
    sky: { icon: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-sky-100 dark:border-sky-500/15' },
    emerald: { icon: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/15' },
    amber: { icon: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/15' },
    rose: { icon: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-500/15' },
    slate: { icon: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-white/5', border: 'border-slate-200 dark:border-white/8' },
  }[accent];

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border
                     bg-white dark:bg-white/[0.02] ${colors.border}
                     hover:shadow-sm dark:hover:bg-white/[0.04]
                     transition-all group`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                       ${colors.bg} ${colors.icon} border ${colors.border}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em]
                      text-slate-400 dark:text-white/25 font-body mb-0.5">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-800 dark:text-white font-display
                      truncate leading-tight" title={String(value)}>
          {value}
        </p>
        {sub && (
          <p className="text-[10px] text-slate-400 dark:text-white/20 font-body mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

// ── Section heading ─────────────────────────────────────────────────────────
function SectionHeading({ icon, title, accent = 'violet' }: {
  icon: React.ReactNode; title: string; accent?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center
                       bg-${accent}-50 dark:bg-${accent}-500/10
                       text-${accent}-500 dark:text-${accent}-400 shrink-0`}>
        {icon}
      </div>
      <h3 className="text-sm font-bold font-display text-slate-700 dark:text-white/80 tracking-tight">
        {title}
      </h3>
      <div className="flex-1 h-px bg-slate-100 dark:bg-white/5" />
    </div>
  );
}

// ── Input field ─────────────────────────────────────────────────────────────
const INPUT_CLS = `w-full px-4 py-2.5 text-sm font-medium
  border border-slate-200 dark:border-white/10
  bg-white dark:bg-white/[0.03]
  text-slate-800 dark:text-white
  rounded-xl outline-none
  focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 dark:focus:border-violet-500
  transition-all font-body placeholder-slate-300 dark:placeholder-white/15`;

// ── Completeness score ───────────────────────────────────────────────────────
function profileCompleteness(student: any): { score: number; missing: string[] } {
  const checks = [
    { key: 'cgpa', label: 'CGPA' },
    { key: 'internship_count', label: 'Internships' },
    { key: 'cert_count', label: 'Certifications' },
    { key: 'target_field', label: 'Target Field' },
    { key: 'target_city_tier', label: 'Target City' },
    { key: 'tenth_board_score', label: '10th Score' },
    { key: 'twelfth_board_score', label: '12th Score' },
    { key: 'loan_emi_monthly', label: 'Loan EMI' },
  ];
  const missing = checks.filter(c => !student[c.key] && student[c.key] !== 0).map(c => c.label);
  return { score: Math.round(((checks.length - missing.length) / checks.length) * 100), missing };
}

// ── Main ─────────────────────────────────────────────────────────────────────
export function StudentProfilePage() {
  const { student, isLoading } = useSession();
  const updateProfileMutation = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudentUpdatePayload>({});

  if (isLoading) return (
    <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812]">
      <Spinner size="lg" label="Loading profile..." />
    </div>
  );

  if (!student) return (
    <div className="flex h-full min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080812] text-slate-500 dark:text-white/40 font-body font-medium">
      Please log in to view your profile.
    </div>
  );

  const SID = student.student_id || '';
  const { score: completeness, missing } = profileCompleteness(student);

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
  const handleCancel = () => { setIsEditing(false); setFormData({}); };
  const handleSave = () => {
    updateProfileMutation.mutate({ id: SID, data: formData }, {
      onSuccess: () => setIsEditing(false),
    });
  };
  const handleChange = (field: keyof StudentUpdatePayload, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const gradDate = student.graduation_month && student.graduation_year
    ? new Date(student.graduation_year, student.graduation_month - 1)
      .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;600&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .font-mono    { font-family: 'JetBrains Mono', monospace; }

        @keyframes pageReveal {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridPulse {
          0%,100% { opacity: 0.04; }
          50%      { opacity: 0.075; }
        }
        .page-reveal { animation: pageReveal 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .grid-pulse  { animation: gridPulse 5s ease-in-out infinite; }

        .glass-card {
          background: rgba(255,255,255,0.92);
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

        {/* Ambient backgrounds */}
        <div className="dark:block hidden fixed inset-0 pointer-events-none z-0">
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
          <PageHeader title="My Profile" subtitle={`${student.name} · ${student.course_type ?? ''}`} />
        </div>

        <div className="relative z-10 p-6 max-w-[1400px] mx-auto space-y-5 pb-20">

          {/* ══ ROW 1: Identity + Completeness ════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Identity card */}
            <div className="glass-card rounded-3xl p-6 page-reveal lg:col-span-2" style={{ animationDelay: '0ms' }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600
                                  flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
                    <span className="font-display text-xl font-bold text-white">
                      {student.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white leading-tight">
                      {student.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-white/40 font-body mt-0.5">
                      {student.course_type} · {student.course_family}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest
                                       text-violet-600 dark:text-violet-400
                                       bg-violet-50 dark:bg-violet-500/10
                                       border border-violet-100 dark:border-violet-500/20
                                       px-2 py-0.5 rounded-full font-mono">
                        {student.placement_status ?? 'searching'}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 dark:text-white/20">
                        ID: {SID.slice(0, 8)}…
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit / Save buttons */}
                {!isEditing ? (
                  <button onClick={handleEditClick}
                    className="text-xs font-bold uppercase tracking-wider
                               text-violet-600 dark:text-violet-400
                               bg-violet-50 dark:bg-violet-500/10
                               hover:bg-violet-100 dark:hover:bg-violet-500/20
                               border border-violet-200 dark:border-violet-500/20
                               px-4 py-2 rounded-xl transition-all font-display active:scale-95 shrink-0">
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={handleCancel} disabled={updateProfileMutation.isPending}
                      className="text-xs font-bold text-slate-600 dark:text-white/60
                                 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10
                                 px-4 py-2 rounded-xl transition-all font-display active:scale-95">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={updateProfileMutation.isPending}
                      className="text-xs font-bold text-white bg-violet-600 hover:bg-violet-700
                                 disabled:bg-slate-300 dark:disabled:bg-slate-700
                                 px-4 py-2 rounded-xl transition-all font-display
                                 flex items-center gap-1.5 active:scale-95
                                 shadow-sm shadow-violet-500/20">
                      {updateProfileMutation.isPending && (
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      )}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              {/* Quick identity stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Institute', value: student.institute_tier ?? '—', accent: 'violet' as const },
                  { label: 'Graduated', value: gradDate, accent: 'sky' as const },
                  { label: 'Target City', value: `Tier ${student.target_city_tier}`, accent: 'amber' as const },
                  {
                    label: 'Monthly EMI', value: student.loan_emi_monthly
                      ? `₹${student.loan_emi_monthly.toLocaleString('en-IN')}`
                      : '—', accent: 'rose' as const
                  },
                ].map(s => {
                  const c = {
                    violet: 'border-violet-100 dark:border-violet-500/15 bg-violet-50/50 dark:bg-violet-500/5 text-violet-600 dark:text-violet-400',
                    sky: 'border-sky-100 dark:border-sky-500/15 bg-sky-50/50 dark:bg-sky-500/5 text-sky-600 dark:text-sky-400',
                    amber: 'border-amber-100 dark:border-amber-500/15 bg-amber-50/50 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400',
                    rose: 'border-rose-100 dark:border-rose-500/15 bg-rose-50/50 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400',
                  }[s.accent];
                  return (
                    <div key={s.label} className={`rounded-xl border px-3 py-2.5 ${c}`}>
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-60 font-body mb-1">{s.label}</p>
                      <p className="text-sm font-bold font-display truncate">{s.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Profile completeness */}
            <div className="glass-card rounded-3xl p-6 page-reveal flex flex-col" style={{ animationDelay: '60ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold font-display text-slate-800 dark:text-white">
                  Profile Strength
                </h3>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full ${completeness >= 80
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                    : completeness >= 50
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                      : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'
                  }`}>
                  {completeness}%
                </span>
              </div>

              {/* Ring */}
              <div className="flex items-center justify-center my-4">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none"
                      stroke="currentColor" strokeWidth="10"
                      className="text-slate-100 dark:text-white/5" />
                    <circle cx="50" cy="50" r="40" fill="none"
                      strokeWidth="10" strokeLinecap="round"
                      stroke={completeness >= 80 ? '#10b981' : completeness >= 50 ? '#f59e0b' : '#ef4444'}
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - completeness / 100)}`}
                      style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-2xl font-bold text-slate-800 dark:text-white">
                      {completeness}%
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-white/25 font-body uppercase tracking-wider">
                      complete
                    </span>
                  </div>
                </div>
              </div>

              {/* Missing fields */}
              {missing.length > 0 ? (
                <div className="space-y-1.5 mt-auto">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 font-body mb-2">
                    Missing fields
                  </p>
                  {missing.map(m => (
                    <div key={m} className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/35 font-body">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      {m}
                    </div>
                  ))}
                  <button onClick={handleEditClick}
                    className="w-full mt-3 text-xs font-bold text-violet-600 dark:text-violet-400
                               bg-violet-50 dark:bg-violet-500/10
                               border border-violet-100 dark:border-violet-500/20
                               py-2 rounded-xl font-display transition-all hover:bg-violet-100 dark:hover:bg-violet-500/20">
                    Complete Profile →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center mt-auto text-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-2">
                    <span className="text-emerald-500"><CheckIcon /></span>
                  </div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-display">
                    Profile complete!
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-white/25 font-body mt-0.5">
                    All fields filled in
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ══ ROW 2: Grouped stat tiles (view mode) ══════════════════════ */}
          {!isEditing && (
            <div className="glass-card rounded-3xl p-6 page-reveal" style={{ animationDelay: '120ms' }}>

              {/* Academic */}
              <SectionHeading icon={<GpaIcon />} title="Academic Performance" accent="violet" />
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
                <StatTile label="CGPA" value={student.cgpa?.toFixed(2) ?? '—'} icon={<GpaIcon />} accent="violet" />
                <StatTile label="10th Score" value={student.tenth_board_score ? `${student.tenth_board_score}%` : 'Not set'} icon={<FileIcon />} accent="sky" />
                <StatTile label="12th Score" value={student.twelfth_board_score ? `${student.twelfth_board_score}%` : 'Not set'} icon={<FileIcon />} accent="sky" />
                <StatTile label="Course" value={student.course_type ?? '—'} icon={<BookIcon />} accent="slate" />
                <StatTile label="Course Family" value={student.course_family ?? '—'} icon={<BookIcon />} accent="slate" />
              </div>

              {/* Experience */}
              <SectionHeading icon={<BriefcaseIcon />} title="Professional Experience" accent="sky" />
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
                <StatTile label="Internships" value={student.internship_count ?? 0} icon={<BriefcaseIcon />} accent="sky" />
                <StatTile label="Employer Tier" value={student.internship_employer_tier ?? '—'} icon={<BuildingIcon />} accent="sky" />
                <StatTile label="Certifications" value={student.cert_count ?? 0} icon={<AwardIcon />} accent="amber" />
                <StatTile label="PPO Secured"
                  value={student.ppo_exists ? 'Yes ✓' : 'No'}
                  icon={<ShieldIcon />}
                  accent={student.ppo_exists ? 'emerald' : 'slate'}
                  sub={student.ppo_exists ? 'Pre-placement offer' : 'No offer yet'}
                />
              </div>

              {/* Goals */}
              <SectionHeading icon={<TargetIcon />} title="Career Goals & Timeline" accent="amber" />
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                <StatTile label="Target Field" value={student.target_field ?? '—'} icon={<TargetIcon />} accent="amber" />
                <StatTile label="Target City Tier" value={`Tier ${student.target_city_tier}`} icon={<MapPinIcon />} accent="amber" />
                <StatTile label="Graduation" value={gradDate} icon={<CalendarIcon />} accent="sky" />
                <StatTile label="Months Post-Grad" value={`${student.months_since_graduation ?? 0} mo`} icon={<ClockIcon />} accent="slate"
                  sub={student.months_since_graduation === 0 ? 'Not yet graduated' : 'since graduation'} />
              </div>
            </div>
          )}

          {/* ══ ROW 2 (edit mode): Edit form ═══════════════════════════════ */}
          {isEditing && (
            <div className="glass-card rounded-3xl p-6 page-reveal" style={{ animationDelay: '120ms' }}>
              <SectionHeading icon={<GpaIcon />} title="Edit Academic Details" accent="violet" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
                {[
                  { label: 'CGPA (0–4 scale)', field: 'cgpa', type: 'number', step: '0.01' },
                  { label: '10th Board Score (%)', field: 'tenth_board_score', type: 'number', step: '0.1' },
                  { label: '12th Board Score (%)', field: 'twelfth_board_score', type: 'number', step: '0.1' },
                ].map(f => (
                  <div key={f.field}>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25 font-body block mb-1.5">{f.label}</label>
                    <input type={f.type} step={f.step} className={INPUT_CLS}
                      value={(formData as any)[f.field] ?? ''}
                      onChange={e => handleChange(f.field as keyof StudentUpdatePayload,
                        f.type === 'number' ? parseFloat(e.target.value) : e.target.value)} />
                  </div>
                ))}
              </div>

              <SectionHeading icon={<BriefcaseIcon />} title="Edit Experience" accent="sky" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
                {[
                  { label: 'Internship Count', field: 'internship_count', type: 'number' },
                  { label: 'Certifications', field: 'cert_count', type: 'number' },
                ].map(f => (
                  <div key={f.field}>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25 font-body block mb-1.5">{f.label}</label>
                    <input type={f.type} className={INPUT_CLS}
                      value={(formData as any)[f.field] ?? ''}
                      onChange={e => handleChange(f.field as keyof StudentUpdatePayload, parseFloat(e.target.value))} />
                  </div>
                ))}
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input type="checkbox"
                        className="peer w-5 h-5 cursor-pointer appearance-none rounded-md
                                   border-2 border-slate-300 dark:border-slate-600
                                   checked:bg-violet-600 checked:border-violet-600 transition-all"
                        checked={formData.ppo_exists || false}
                        onChange={e => handleChange('ppo_exists', e.target.checked)} />
                      <span className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity">
                        <CheckIcon />
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-white/70 font-display
                                     group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      PPO Secured
                    </span>
                  </label>
                </div>
              </div>

              <SectionHeading icon={<TargetIcon />} title="Edit Goals & Timeline" accent="amber" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25 font-body block mb-1.5">Target Field</label>
                  <input type="text" className={INPUT_CLS}
                    value={formData.target_field ?? ''}
                    onChange={e => handleChange('target_field', e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25 font-body block mb-1.5">Target City Tier</label>
                  <select className={INPUT_CLS + ' cursor-pointer'}
                    value={formData.target_city_tier || 1}
                    onChange={e => handleChange('target_city_tier', parseInt(e.target.value))}>
                    <option value={1}>Tier 1 — Metro</option>
                    <option value={2}>Tier 2 — Major cities</option>
                    <option value={3}>Tier 3 — Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25 font-body block mb-1.5">Months Since Graduation</label>
                  <input type="number" className={INPUT_CLS}
                    value={formData.months_since_graduation ?? ''}
                    onChange={e => handleChange('months_since_graduation', parseFloat(e.target.value))} />
                </div>
              </div>
            </div>
          )}

          {/* ══ ROW 3: Risk factors + Loan info ═══════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Risk signal card */}
            <div className="glass-card rounded-3xl p-6 page-reveal" style={{ animationDelay: '180ms' }}>
              <SectionHeading icon={<TrendIcon />} title="Risk Signal Factors" accent="rose" />
              <div className="space-y-3">
                {[
                  {
                    label: 'Academic Score',
                    score: Math.min(100, Math.round((student.cgpa / 4) * 100)),
                    good: student.cgpa >= 3.0,
                    detail: `CGPA ${student.cgpa?.toFixed(2)} / 4.00`,
                  },
                  {
                    label: 'Industry Experience',
                    score: Math.min(100, Math.round(((student.internship_count || 0) / 3) * 100)),
                    good: (student.internship_count || 0) >= 1,
                    detail: `${student.internship_count ?? 0} internship${student.internship_count !== 1 ? 's' : ''}`,
                  },
                  {
                    label: 'Skill Certifications',
                    score: Math.min(100, Math.round(((student.cert_count || 0) / 5) * 100)),
                    good: (student.cert_count || 0) >= 2,
                    detail: `${student.cert_count ?? 0} certification${student.cert_count !== 1 ? 's' : ''}`,
                  },
                  {
                    label: 'Placement Assurance',
                    score: student.ppo_exists ? 100 : 0,
                    good: student.ppo_exists,
                    detail: student.ppo_exists ? 'PPO confirmed' : 'No pre-placement offer',
                  },
                ].map(r => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-600 dark:text-white/60 font-body">{r.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 dark:text-white/25 font-body">{r.detail}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${r.good
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                            : 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'
                          }`}>
                          {r.good ? 'OK' : 'LOW'}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${r.score >= 66 ? 'bg-emerald-500' : r.score >= 33 ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                        style={{ width: `${r.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loan snapshot */}
            <div className="glass-card rounded-3xl p-6 page-reveal" style={{ animationDelay: '220ms' }}>
              <SectionHeading icon={<CreditCardIcon />} title="Loan Snapshot" accent="sky" />
              <div className="grid grid-cols-2 gap-3 mb-5">
                <StatTile
                  label="Monthly EMI"
                  value={student.loan_emi_monthly ? `₹${student.loan_emi_monthly.toLocaleString('en-IN')}` : '—'}
                  icon={<CreditCardIcon />} accent="sky"
                />
                <StatTile
                  label="Annual EMI Burden"
                  value={student.loan_emi_monthly ? `₹${(student.loan_emi_monthly * 12).toLocaleString('en-IN')}` : '—'}
                  icon={<TrendIcon />} accent="rose"
                />
              </div>

              {/* EMI-to-expected-salary ratio */}
              {student.loan_emi_monthly > 0 && (
                <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 p-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20 font-body mb-2">
                    EMI Affordability Signal
                  </p>
                  {(() => {
                    const estSalary = 40000; // estimated monthly take-home
                    const ratio = (student.loan_emi_monthly / estSalary) * 100;
                    const isGood = ratio < 30;
                    return (
                      <>
                        <div className="flex items-end justify-between mb-1.5">
                          <span className="text-xs text-slate-500 dark:text-white/40 font-body">
                            {ratio.toFixed(1)}% of est. entry salary
                          </span>
                          <span className={`text-xs font-bold font-mono ${isGood ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                            {isGood ? 'Manageable' : 'High burden'}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isGood ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(ratio, 100)}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-slate-400 dark:text-white/15 font-body mt-1.5">
                          Based on ₹40,000 estimated entry-level take-home
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
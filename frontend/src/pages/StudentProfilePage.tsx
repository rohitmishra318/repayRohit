import { useSession } from '../context/SessionContext';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/shared/Card';
import { Spinner } from '../components/shared/Spinner';
import { ActivityFeed } from '../components/student/ActivityFeed';

export function StudentProfilePage() {
  const { student, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/50 dark:bg-slate-950">
        <Spinner size="lg" label="Loading profile..." />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
        Please log in to view your profile.
      </div>
    );
  }

  const SID = student.student_id || '';

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#FAFAFA] dark:bg-slate-950">
      <PageHeader
        title="My Profile"
        subtitle={`${student.name} · ${student.course}`}
      />

      <div className="p-6 max-w-[1400px] mx-auto space-y-6">

        {/* PROFILE SNAPSHOT */}
        <Card padding="md" className="border border-slate-200/60 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Academic & Professional Snapshot</h2>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">ID: {SID}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'CGPA', value: student.cgpa.toFixed(2), icon: '🎓' },
              { label: 'Internships', value: student.internship_count, icon: '💼' },
              { label: 'Certifications', value: student.cert_count, icon: '📜' },
              { label: 'PPO Secured', value: student.ppo_exists ? 'Yes' : 'No', icon: '✅' },
              { label: '10th Score', value: `${student.tenth_board_score}%`, icon: '📝' },
              { label: '12th Score', value: `${student.twelfth_board_score}%`, icon: '📝' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-md bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100/50 dark:border-slate-600/50">
                <span className="text-lg opacity-80">{item.icon}</span>
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ACTIVITY FEED */}
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-700" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Live Activity Feed</h2>
            <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View All</button>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg">
            <ActivityFeed />
          </div>
        </Card>

      </div>
    </div>
  );
}

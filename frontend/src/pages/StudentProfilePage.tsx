import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { useUpdateProfile } from '../hooks/useStudents';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/shared/Card';
import { Spinner } from '../components/shared/Spinner';
import { ActivityFeed } from '../components/student/ActivityFeed';
import type { StudentUpdatePayload } from '../types';

export function StudentProfilePage() {
  const { student, isLoading } = useSession();
  const updateProfileMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudentUpdatePayload>({});

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
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">ID: {SID}</span>
              {!isEditing ? (
                <button
                  onClick={handleEditClick}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium px-3 py-1.5 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    disabled={updateProfileMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-medium px-3 py-1.5 rounded flex items-center gap-2 transition-colors"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {[
                { label: 'CGPA', value: student.cgpa.toFixed(2), icon: '🎓' },
                { label: 'Internships', value: student.internship_count, icon: '💼' },
                { label: 'Certifications', value: student.cert_count, icon: '📜' },
                { label: 'PPO Secured', value: student.ppo_exists ? 'Yes' : 'No', icon: '✅' },
                { label: '10th Score', value: student.tenth_board_score ? `${student.tenth_board_score}%` : 'N/A', icon: '📝' },
                { label: '12th Score', value: student.twelfth_board_score ? `${student.twelfth_board_score}%` : 'N/A', icon: '📝' },
                { label: 'Target Field', value: student.target_field, icon: '🎯' },
                { label: 'Target City Tier', value: `Tier ${student.target_city_tier}`, icon: '🏢' },
                { label: 'Graduation', value: `${student.months_since_graduation} mo ago`, icon: '⏳' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-md bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100/50 dark:border-slate-600/50">
                  <span className="text-lg opacity-80">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={String(item.value)}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.cgpa ?? ''}
                  onChange={(e) => handleChange('cgpa', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Internships</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.internship_count ?? ''}
                  onChange={(e) => handleChange('internship_count', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Certifications</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.cert_count ?? ''}
                  onChange={(e) => handleChange('cert_count', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">10th Board Score (%)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.tenth_board_score ?? ''}
                  onChange={(e) => handleChange('tenth_board_score', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">12th Board Score (%)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.twelfth_board_score ?? ''}
                  onChange={(e) => handleChange('twelfth_board_score', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Target Field</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.target_field || ''}
                  onChange={(e) => handleChange('target_field', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Target City Tier</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.target_city_tier || 1}
                  onChange={(e) => handleChange('target_city_tier', parseInt(e.target.value))}
                >
                  <option value={1}>Tier 1</option>
                  <option value={2}>Tier 2</option>
                  <option value={3}>Tier 3</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Months Since Graduation</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.months_since_graduation ?? 0}
                  onChange={(e) => handleChange('months_since_graduation', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-1 flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    checked={formData.ppo_exists || false}
                    onChange={(e) => handleChange('ppo_exists', e.target.checked)}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">PPO Secured (Pre-Placement Offer)</span>
                </label>
              </div>
            </div>
          )}
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

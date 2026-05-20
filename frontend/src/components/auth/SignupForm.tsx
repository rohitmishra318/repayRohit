import { useState } from 'react';
import { registerWithFirebase, auth } from '../../services/firebase';
import { createStudent } from '../../api/auth';
import { Spinner } from '../shared/Spinner';

interface SignupFormProps {
  onSuccess: () => void;
  onBackClick: () => void;
}

interface FormData {
  // Basic
  email: string;
  password: string;
  confirmPassword: string;
  name: string;

  // Education
  instituteName: string;
  instituteTier: 'tier_1' | 'tier_2' | 'tier_3';
  courseType: string;
  courseFamily: string;
  cgpa: number;
  tenthBoardScore?: number;
  twelfthBoardScore?: number;

  // Work Experience
  internshipCount: number;
  internshipEmployerTier: 'recognized' | 'unverified' | 'none';
  ppoExists: boolean;
  certCount: number;

  // Graduation & Target
  graduationMonth: number;
  graduationYear: number;
  targetField: string;
  targetCityTier: 1 | 2 | 3;

  // Loan
  loanEmiMonthly: number;

  // Location
  city: string;
}

export function SignupForm({ onSuccess, onBackClick }: SignupFormProps) {
  const [step, setStep] = useState<'basic' | 'education' | 'experience' | 'target' | 'loan'>('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    instituteName: '',
    instituteTier: 'tier_2',
    courseType: '',
    courseFamily: '',
    cgpa: 0,
    internshipCount: 0,
    internshipEmployerTier: 'none',
    ppoExists: false,
    certCount: 0,
    graduationMonth: 6,
    graduationYear: new Date().getFullYear(),
    targetField: '',
    targetCityTier: 2,
    loanEmiMonthly: 0,
    city: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.currentTarget;

    // Handle checkboxes separately
    if (type === 'checkbox') {
      const checked = (e.currentTarget as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    // Handle number inputs
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Register with Firebase
      const firebaseUser = await registerWithFirebase(formData.email, formData.password);

      // Create student record in backend
      await createStudent({
        firebase_uid: firebaseUser.uid,
        email: formData.email,
        name: formData.name,
        institute_name: formData.instituteName,
        institute_tier: formData.instituteTier,
        course_type: formData.courseType,
        course_family: formData.courseFamily,
        cgpa: formData.cgpa,
        internship_count: formData.internshipCount,
        internship_employer_tier: formData.internshipEmployerTier,
        ppo_exists: formData.ppoExists,
        cert_count: formData.certCount,
        graduation_month: formData.graduationMonth,
        graduation_year: formData.graduationYear,
        target_field: formData.targetField,
        target_city_tier: formData.targetCityTier,
        loan_emi_monthly: formData.loanEmiMonthly,
        tenth_board_score: formData.tenthBoardScore,
        twelfth_board_score: formData.twelfthBoardScore,
        city: formData.city || undefined,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-blue-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => step === 'basic' ? onBackClick() : setStep('basic')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
          >
            <span>←</span> {step === 'basic' ? 'Back' : 'Start Over'}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RS</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">RepaySignal</h1>
          </div>
          <div className="w-12" />
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2">
            {['basic', 'education', 'experience', 'target', 'loan'].map((s, i) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-all ${['basic', 'education', 'experience', 'target', 'loan'].indexOf(step) >= i
                  ? 'bg-blue-600'
                  : 'bg-slate-200'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">

          {/* Heading */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">
              {step === 'basic' && 'Create Your Account'}
              {step === 'education' && 'Your Education'}
              {step === 'experience' && 'Your Experience'}
              {step === 'target' && 'Your Target'}
              {step === 'loan' && 'Loan Information'}
            </h2>
            <p className="text-slate-600">
              {step === 'basic' && 'Let\'s get started with your basic information'}
              {step === 'education' && 'Tell us about your educational background'}
              {step === 'experience' && 'Share your professional experience'}
              {step === 'target' && 'What\'s your target career path?'}
              {step === 'loan' && 'Help us understand your loan situation'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 space-y-5">

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* BASIC STEP */}
            {step === 'basic' && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </>
            )}

            {/* EDUCATION STEP */}
            {step === 'education' && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Institution Name</label>
                  <input
                    type="text"
                    name="instituteName"
                    value={formData.instituteName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., IIT Delhi, BITS Pilani"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Institution Tier</label>
                  <select
                    name="instituteTier"
                    value={formData.instituteTier}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="tier_1">Tier 1 (Elite: IIT, BITS, IIIT, NIT)</option>
                    <option value="tier_2">Tier 2 (Good: State Universities, Colleges)</option>
                    <option value="tier_3">Tier 3 (Other Institutions)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Course Type</label>
                  <input
                    type="text"
                    name="courseType"
                    value={formData.courseType}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., BTech, MBA, BSc"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Course Family</label>
                  <select
                    name="courseFamily"
                    value={formData.courseFamily}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select...</option>
                    <option value="engineering">Engineering</option>
                    <option value="management">Management</option>
                    <option value="sciences">Sciences</option>
                    <option value="commerce">Commerce</option>
                    <option value="arts">Arts</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">CGPA (4.0 scale)</label>
                  <input
                    type="number"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="4"
                    required
                    placeholder="3.5"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">10th Board %</label>
                    <input
                      type="number"
                      name="tenthBoardScore"
                      value={formData.tenthBoardScore || ''}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="85"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">12th Board %</label>
                    <input
                      type="number"
                      name="twelfthBoardScore"
                      value={formData.twelfthBoardScore || ''}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="88"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </>
            )}

            {/* EXPERIENCE STEP */}
            {step === 'experience' && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Number of Internships</label>
                  <input
                    type="number"
                    name="internshipCount"
                    value={formData.internshipCount}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Best Internship Employer Tier</label>
                  <select
                    name="internshipEmployerTier"
                    value={formData.internshipEmployerTier}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="none">No internship</option>
                    <option value="unverified">Unverified company</option>
                    <option value="recognized">Recognized/Top company</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="ppoExists"
                      checked={formData.ppoExists}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">Have a Pre-Placement Offer (PPO)?</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Certifications/Courses Completed</label>
                  <input
                    type="number"
                    name="certCount"
                    value={formData.certCount}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    required
                    placeholder="2"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </>
            )}

            {/* TARGET STEP */}
            {step === 'target' && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Target Field/Domain</label>
                  <input
                    type="text"
                    name="targetField"
                    value={formData.targetField}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Software Development, Finance, Data Science"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Target City Tier</label>
                  <select
                    name="targetCityTier"
                    value={formData.targetCityTier}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="1">Tier 1 (Metro: Delhi, Mumbai, Bangalore, Hyderabad)</option>
                    <option value="2">Tier 2 (Major cities: Pune, Jaipur, Ahmedabad)</option>
                    <option value="3">Tier 3 (Other cities)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Your City</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select your city...</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Bhopal">Bhopal</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Kochi">Kochi</option>
                    <option value="Indore">Indore</option>
                    <option value="Patna">Patna</option>
                    <option value="Bhubaneswar">Bhubaneswar</option>
                    <option value="Visakhapatnam">Visakhapatnam</option>
                    <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                    <option value="Guwahati">Guwahati</option>
                    <option value="Dehradun">Dehradun</option>
                    <option value="Ranchi">Ranchi</option>
                    <option value="Raipur">Raipur</option>
                    <option value="Srinagar">Srinagar</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Expected Graduation</label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      name="graduationMonth"
                      value={formData.graduationMonth}
                      onChange={handleInputChange}
                      className="px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="1">January</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="12">December</option>
                    </select>
                    <select
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleInputChange}
                      className="px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {[2024, 2025, 2026, 2027, 2028].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* LOAN STEP */}
            {step === 'loan' && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Monthly Loan EMI (₹)</label>
                  <input
                    type="number"
                    name="loanEmiMonthly"
                    value={formData.loanEmiMonthly}
                    onChange={handleInputChange}
                    required
                    step="100"
                    min="0"
                    max="1000000"
                    placeholder="25000"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-xs text-slate-500">This helps us assess your repayment capacity</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-slate-900">Summary of your info:</p>
                  <ul className="text-xs text-slate-700 space-y-1">
                    <li>✓ From {formData.instituteName} ({formData.instituteTier})</li>
                    <li>✓ CGPA: {formData.cgpa}/4.0</li>
                    <li>✓ Target: {formData.targetField} in Tier {formData.targetCityTier}</li>
                    <li>✓ Monthly EMI: ₹{formData.loanEmiMonthly}</li>
                  </ul>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {step !== 'basic' && (
                <button
                  type="button"
                  onClick={() => {
                    const steps: Array<'basic' | 'education' | 'experience' | 'target' | 'loan'> = ['basic', 'education', 'experience', 'target', 'loan'];
                    const currentIndex = steps.indexOf(step);
                    if (currentIndex > 0) {
                      setStep(steps[currentIndex - 1]);
                    }
                  }}
                  className="flex-1 py-2.5 border-2 border-slate-300 text-slate-900 font-semibold rounded-lg hover:border-slate-400"
                >
                  Back
                </button>
              )}

              <button
                type={step === 'loan' ? 'submit' : 'button'}
                onClick={() => {
                  if (step !== 'loan') {
                    const steps: Array<'basic' | 'education' | 'experience' | 'target' | 'loan'> = ['basic', 'education', 'experience', 'target', 'loan'];
                    const currentIndex = steps.indexOf(step);
                    if (currentIndex < steps.length - 1) {
                      setStep(steps[currentIndex + 1]);
                    }
                  }
                }}
                disabled={loading}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" /> Creating...
                  </>
                ) : step === 'loan' ? (
                  'Create Account'
                ) : (
                  'Next'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

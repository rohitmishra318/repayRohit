import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithFirebase, registerWithFirebase } from '../services/firebase';
import { createStudent } from '../api/auth';
import { useSession } from '../context/SessionContext';
import { Spinner } from '../components/shared/Spinner';

type Mode = 'login' | 'register';
type SignupStep = 'basic' | 'education' | 'experience' | 'target' | 'loan';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  instituteName: string;
  instituteTier: 'tier_1' | 'tier_2' | 'tier_3';
  courseType: string;
  courseFamily: string;
  cgpa: number;
  tenthBoardScore?: number;
  twelfthBoardScore?: number;
  internshipCount: number;
  internshipEmployerTier: 'recognized' | 'unverified' | 'none';
  ppoExists: boolean;
  certCount: number;
  graduationMonth: number;
  graduationYear: number;
  targetField: string;
  targetCityTier: 1 | 2 | 3;
  loanEmiMonthly: number;
}

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useSession();

  const [mode, setMode] = useState<Mode>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>('basic');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Signup form
  const [signupForm, setSignupForm] = useState<SignupFormData>({
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
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await loginWithFirebase(loginForm.email, loginForm.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Validate passwords
      if (signupForm.password !== signupForm.confirmPassword) {
        setError('Passwords do not match');
        setSubmitting(false);
        return;
      }

      if (signupForm.password.length < 6) {
        setError('Password must be at least 6 characters');
        setSubmitting(false);
        return;
      }

      // Register with Firebase
      const firebaseUser = await registerWithFirebase(signupForm.email, signupForm.password);

      // Create student record in backend
      await createStudent({
        firebase_uid: firebaseUser.uid,
        email: signupForm.email,
        name: signupForm.name,
        institute_name: signupForm.instituteName,
        institute_tier: signupForm.instituteTier,
        course_type: signupForm.courseType,
        course_family: signupForm.courseFamily,
        cgpa: signupForm.cgpa,
        internship_count: signupForm.internshipCount,
        internship_employer_tier: signupForm.internshipEmployerTier,
        ppo_exists: signupForm.ppoExists,
        cert_count: signupForm.certCount,
        graduation_month: signupForm.graduationMonth,
        graduation_year: signupForm.graduationYear,
        target_field: signupForm.targetField,
        target_city_tier: signupForm.targetCityTier,
        loan_emi_monthly: signupForm.loanEmiMonthly,
        tenth_board_score: signupForm.tenthBoardScore,
        twelfth_board_score: signupForm.twelfthBoardScore,
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.currentTarget;

    if (type === 'checkbox') {
      const checked = (e.currentTarget as HTMLInputElement).checked;
      setSignupForm(prev => ({ ...prev, [name]: checked }));
      return;
    }

    if (type === 'number') {
      setSignupForm(prev => ({ ...prev, [name]: parseFloat(value) }));
      return;
    }

    setSignupForm(prev => ({ ...prev, [name]: value }));
  };

  const nextSignupStep = () => {
    const steps: SignupStep[] = ['basic', 'education', 'experience', 'target', 'loan'];
    const currentIndex = steps.indexOf(signupStep);
    if (currentIndex < steps.length - 1) {
      setSignupStep(steps[currentIndex + 1]);
    }
  };

  const prevSignupStep = () => {
    const steps: SignupStep[] = ['basic', 'education', 'experience', 'target', 'loan'];
    const currentIndex = steps.indexOf(signupStep);
    if (currentIndex > 0) {
      setSignupStep(steps[currentIndex - 1]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="font-display text-xl font-bold text-slate-900">
          Repay<span className="text-purple-600">Signal</span>
        </div>
        <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-body font-semibold">
          ✦ SYSTEM V2.4 ONLINE
        </span>
      </nav>

      {/* Hero */}
      {mode === 'login' && (
        <div className="relative z-10 flex flex-col items-center text-center pt-16 pb-10 px-4 animate-fade-up">
          <h1 className="font-display text-5xl md:text-7xl font-bold text-slate-900 leading-none mb-4">
            Smarter Lending<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-600">
              through Career Intelligence
            </span>
          </h1>
          <p className="text-slate-500 text-lg font-body max-w-xl mt-4">
            Predicting placement timelines, salary ranges, and repayment risk for education loan portfolios.
          </p>
        </div>
      )}

      {/* Feature pills - only show in login mode */}
      {mode === 'login' && (
        <div className="relative z-10 flex justify-center gap-4 flex-wrap px-4 mb-12">
          {[
            { icon: '◈', label: 'Predictive Analytics', desc: 'Real-time risk scoring' },
            { icon: '◉', label: 'Behavioral Modeling', desc: 'Live engagement tracking' },
            { icon: '◇', label: 'Portfolio Protection', desc: 'Heatmap visualization' },
          ].map(f => (
            <div key={f.label}
              className="bg-white border border-slate-200 rounded-2xl p-4 w-52 text-left hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5 transition-all">
              <div className="text-2xl text-purple-600 mb-3">{f.icon}</div>
              <div className="text-sm font-bold text-slate-800 font-display mb-1">{f.label}</div>
              <div className="text-xs text-slate-400 font-body">{f.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Auth panel */}
      <div className="relative z-10 flex justify-center px-4 pb-16">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm">

          {/* Mode toggle */}
          <div className="flex gap-4 mb-6">
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setSignupStep('basic'); setError(''); }}
                className={`text-sm pb-1 border-b-2 transition-all font-body font-semibold flex-1 ${
                  mode === m
                    ? 'text-purple-600 border-purple-600'
                    : 'text-slate-300 border-transparent hover:text-slate-500'
                }`}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Progress bar for signup */}
          {mode === 'register' && (
            <div className="flex gap-2 mb-6">
              {['basic', 'education', 'experience', 'target', 'loan'].map((s, i) => (
                <div
                  key={s}
                  className={`flex-1 h-1 rounded-full transition-all ${
                    ['basic', 'education', 'experience', 'target', 'loan'].indexOf(signupStep) >= i
                      ? 'bg-purple-600'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-200 font-body flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" /> Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          )}

          {/* SIGNUP FORM - BASIC STEP */}
          {mode === 'register' && signupStep === 'basic' && (
            <form className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={signupForm.name}
                  onChange={handleSignupInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={signupForm.email}
                  onChange={handleSignupInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={signupForm.password}
                  onChange={handleSignupInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={signupForm.confirmPassword}
                  onChange={handleSignupInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                />
              </div>
              <button
                type="button"
                onClick={nextSignupStep}
                className="w-full mt-5 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-200 font-body"
              >
                Next
              </button>
            </form>
          )}

          {/* EDUCATION STEP */}
          {mode === 'register' && signupStep === 'education' && (
            <form className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Institution Name</label>
                <input
                  type="text"
                  name="instituteName"
                  placeholder="e.g., IIT Delhi"
                  value={signupForm.instituteName}
                  onChange={handleSignupInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Institution Tier</label>
                <select
                  name="instituteTier"
                  value={signupForm.instituteTier}
                  onChange={handleSignupInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                >
                  <option value="tier_1">Tier 1 (Elite: IIT, BITS)</option>
                  <option value="tier_2">Tier 2 (Good: State Universities)</option>
                  <option value="tier_3">Tier 3 (Other Institutions)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Course Type</label>
                <input
                  type="text"
                  name="courseType"
                  placeholder="e.g., BTech, MBA"
                  value={signupForm.courseType}
                  onChange={handleSignupInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Course Family</label>
                <select
                  name="courseFamily"
                  value={signupForm.courseFamily}
                  onChange={handleSignupInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                >
                  <option value="">Select...</option>
                  <option value="engineering">Engineering</option>
                  <option value="management">Management</option>
                  <option value="sciences">Sciences</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">CGPA (4.0 scale)</label>
                <input
                  type="number"
                  name="cgpa"
                  step="0.01"
                  min="0"
                  max="4"
                  value={signupForm.cgpa}
                  onChange={handleSignupInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={prevSignupStep}
                  className="flex-1 border-2 border-slate-300 text-slate-900 py-3 rounded-xl text-sm font-bold transition-all font-body"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextSignupStep}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-bold transition-all font-body"
                >
                  Next
                </button>
              </div>
            </form>
          )}

          {/* EXPERIENCE STEP */}
          {mode === 'register' && signupStep === 'experience' && (
            <form className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Internships</label>
                <input
                  type="number"
                  name="internshipCount"
                  min="0"
                  max="10"
                  value={signupForm.internshipCount}
                  onChange={handleSignupInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Best Employer Tier</label>
                <select
                  name="internshipEmployerTier"
                  value={signupForm.internshipEmployerTier}
                  onChange={handleSignupInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                >
                  <option value="none">No internship</option>
                  <option value="unverified">Unverified</option>
                  <option value="recognized">Recognized</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="ppoExists"
                  checked={signupForm.ppoExists}
                  onChange={handleSignupInputChange}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-slate-700">Have a Pre-Placement Offer?</span>
              </label>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Certifications</label>
                <input
                  type="number"
                  name="certCount"
                  min="0"
                  max="50"
                  value={signupForm.certCount}
                  onChange={handleSignupInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={prevSignupStep}
                  className="flex-1 border-2 border-slate-300 text-slate-900 py-3 rounded-xl text-sm font-bold transition-all font-body"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextSignupStep}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-bold transition-all font-body"
                >
                  Next
                </button>
              </div>
            </form>
          )}

          {/* TARGET STEP */}
          {mode === 'register' && signupStep === 'target' && (
            <form className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Target Field</label>
                <input
                  type="text"
                  name="targetField"
                  placeholder="e.g., Software Development"
                  value={signupForm.targetField}
                  onChange={handleSignupInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Target City Tier</label>
                <select
                  name="targetCityTier"
                  value={signupForm.targetCityTier}
                  onChange={handleSignupInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                >
                  <option value="1">Tier 1 (Metro)</option>
                  <option value="2">Tier 2 (Major cities)</option>
                  <option value="3">Tier 3 (Other)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Grad Month</label>
                  <select
                    name="graduationMonth"
                    value={signupForm.graduationMonth}
                    onChange={handleSignupInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                  >
                    <option value="1">Jan</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="12">Dec</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Grad Year</label>
                  <select
                    name="graduationYear"
                    value={signupForm.graduationYear}
                    onChange={handleSignupInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={prevSignupStep}
                  className="flex-1 border-2 border-slate-300 text-slate-900 py-3 rounded-xl text-sm font-bold transition-all font-body"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextSignupStep}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-bold transition-all font-body"
                >
                  Next
                </button>
              </div>
            </form>
          )}

          {/* LOAN STEP */}
          {mode === 'register' && signupStep === 'loan' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Monthly Loan EMI (₹)</label>
                <input
                  type="number"
                  name="loanEmiMonthly"
                  step="100"
                  min="0"
                  max="1000000"
                  value={signupForm.loanEmiMonthly}
                  onChange={handleSignupInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body"
                />
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-slate-700">
                <p className="font-semibold mb-2">Your Profile:</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ From {signupForm.instituteName} ({signupForm.instituteTier})</li>
                  <li>✓ CGPA: {signupForm.cgpa}/4.0</li>
                  <li>✓ Target: {signupForm.targetField}</li>
                  <li>✓ EMI: ₹{signupForm.loanEmiMonthly}</li>
                </ul>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={prevSignupStep}
                  className="flex-1 border-2 border-slate-300 text-slate-900 py-3 rounded-xl text-sm font-bold transition-all font-body"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-200 font-body flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" /> Creating...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Helper text */}
          {mode === 'login' && (
            <p className="text-xs text-slate-400 text-center mt-4 font-body">
              Don't have an account? <button onClick={() => setMode('register')} className="text-purple-600 hover:underline">Create one</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
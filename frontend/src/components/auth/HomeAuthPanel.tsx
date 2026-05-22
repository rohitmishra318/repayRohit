import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithFirebase, registerWithFirebase } from '../../services/firebase';
import { createStudent } from '../../api/auth';
import { Spinner } from '../shared/Spinner';

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
  city: string;
}

const STEPS: SignupStep[] = ['basic', 'education', 'experience', 'target', 'loan'];

const STEP_LABELS: Record<SignupStep, string> = {
  basic: 'Account',
  education: 'Education',
  experience: 'Experience',
  target: 'Goals',
  loan: 'Loan',
};

const INPUT_CLASS =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-violet-400/60 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10 transition-all';
const LABEL_CLASS = 'text-xs font-semibold text-white/50 mb-1.5 block uppercase tracking-widest';
const SELECT_CLASS =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/10 transition-all appearance-none';

const CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata',
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Bhopal', 'Nagpur',
  'Coimbatore', 'Kochi', 'Indore', 'Patna', 'Bhubaneswar', 'Visakhapatnam',
  'Thiruvananthapuram', 'Guwahati', 'Dehradun', 'Ranchi', 'Raipur', 'Srinagar',
];

export function HomeAuthPanel() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>('basic');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState<SignupFormData>({
    email: '', password: '', confirmPassword: '', name: '',
    instituteName: '', instituteTier: 'tier_2',
    courseType: '', courseFamily: '', cgpa: 0,
    internshipCount: 0, internshipEmployerTier: 'none',
    ppoExists: false, certCount: 0,
    graduationMonth: 6, graduationYear: new Date().getFullYear(),
    targetField: '', targetCityTier: 2, loanEmiMonthly: 0,
    city: '',
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginWithFirebase(loginForm.email, loginForm.password);
      navigate('/');
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
      const firebaseUser = await registerWithFirebase(signupForm.email, signupForm.password);
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
        city: signupForm.city || undefined,
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
      setSignupForm(prev => ({ ...prev, [name]: (e.currentTarget as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setSignupForm(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setSignupForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => {
    const i = STEPS.indexOf(signupStep);
    if (i < STEPS.length - 1) setSignupStep(STEPS[i + 1]);
  };
  const prevStep = () => {
    const i = STEPS.indexOf(signupStep);
    if (i > 0) setSignupStep(STEPS[i - 1]);
  };
  const currentStepIndex = STEPS.indexOf(signupStep);

  return (
    <>
      {/* Why Repay Signal Button */}
      <button
        onClick={() => navigate('/about')}
        className="w-full mb-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-xl hover:bg-violet-500/20 hover:text-violet-300 transition-all font-display flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(124,58,237,0.05)] cursor-pointer"
      >
        <span>Why RepaySignal?</span>
        <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="panel-glow glass-panel rounded-3xl p-8 relative overflow-hidden">
        {/* Panel inner glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-violet-500/5 rounded-b-full blur-xl" />

        {/* Mode tabs */}
        <div className="flex gap-1 mb-7 bg-white/4 rounded-xl p-1">
          {(['login', 'register'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setSignupStep('basic'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all font-body ${mode === m
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                : 'text-white/35 hover:text-white/60'
                }`}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Signup step progress */}
        {mode === 'register' && (
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all font-body ${i < currentStepIndex
                    ? 'bg-violet-500 text-white'
                    : i === currentStepIndex
                      ? 'bg-violet-500/20 border-2 border-violet-500 text-violet-400'
                      : 'bg-white/5 text-white/20'
                    }`}>
                    {i < currentStepIndex ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className={`text-[9px] font-semibold font-body uppercase tracking-wide ${i === currentStepIndex ? 'text-violet-400' : 'text-white/20'
                    }`}>{STEP_LABELS[s]}</span>
                </div>
              ))}
            </div>
            <div className="relative h-0.5 bg-white/5 rounded-full mt-1">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-5 text-sm text-rose-300 font-body">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className={LABEL_CLASS}>Email Address</label>
              <input type="email" placeholder="you@example.com"
                value={loginForm.email}
                onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                required className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Password</label>
              <input type="password" placeholder="••••••••"
                value={loginForm.password}
                onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                required className={INPUT_CLASS} />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
              {submitting ? <><Spinner size="sm" /> Signing in...</> : 'Sign In →'}
            </button>
            <p className="text-xs text-white/25 text-center font-body pt-1">
              No account?{' '}
              <button type="button" onClick={() => setMode('register')} className="text-violet-400 hover:text-violet-300 transition-colors">
                Create one free
              </button>
            </p>
          </form>
        )}

        {/* ── STEP: BASIC ── */}
        {mode === 'register' && signupStep === 'basic' && (
          <div className="space-y-4">
            <div><label className={LABEL_CLASS}>Full Name</label>
              <input type="text" name="name" placeholder="John Doe" value={signupForm.name} onChange={handleSignupInputChange} required className={INPUT_CLASS} /></div>
            <div><label className={LABEL_CLASS}>Email</label>
              <input type="email" name="email" placeholder="you@example.com" value={signupForm.email} onChange={handleSignupInputChange} required className={INPUT_CLASS} /></div>
            <div><label className={LABEL_CLASS}>Password</label>
              <input type="password" name="password" placeholder="••••••••" value={signupForm.password} onChange={handleSignupInputChange} required className={INPUT_CLASS} /></div>
            <div><label className={LABEL_CLASS}>Confirm Password</label>
              <input type="password" name="confirmPassword" placeholder="••••••••" value={signupForm.confirmPassword} onChange={handleSignupInputChange} required className={INPUT_CLASS} /></div>
            <button type="button" onClick={nextStep} className="btn-primary w-full">Next →</button>
          </div>
        )}

        {/* ── STEP: EDUCATION ── */}
        {mode === 'register' && signupStep === 'education' && (
          <div className="space-y-4">
            <div><label className={LABEL_CLASS}>Institution Name</label>
              <input type="text" name="instituteName" placeholder="e.g., IIT Delhi" value={signupForm.instituteName} onChange={handleSignupInputChange} required className={INPUT_CLASS} /></div>
            <div><label className={LABEL_CLASS}>Institution Tier</label>
              <select name="instituteTier" value={signupForm.instituteTier} onChange={handleSignupInputChange} className={SELECT_CLASS}>
                <option value="tier_1">Tier 1 — Elite (IIT, BITS)</option>
                <option value="tier_2">Tier 2 — State Universities</option>
                <option value="tier_3">Tier 3 — Other Institutions</option>
              </select></div>
            <div><label className={LABEL_CLASS}>Course Type</label>
              <input type="text" name="courseType" placeholder="e.g., BTech, MBA" value={signupForm.courseType} onChange={handleSignupInputChange} required className={INPUT_CLASS} /></div>
            <div><label className={LABEL_CLASS}>Course Family</label>
              <select name="courseFamily" value={signupForm.courseFamily} onChange={handleSignupInputChange} required className={SELECT_CLASS}>
                <option value="">Select...</option>
                <option value="engineering">Engineering</option>
                <option value="management">Management</option>
                <option value="sciences">Sciences</option>
              </select></div>
            <div><label className={LABEL_CLASS}>CGPA (4.0 scale)</label>
              <input type="number" name="cgpa" step="0.01" min="0" max="4" value={signupForm.cgpa} onChange={handleSignupInputChange} required className={INPUT_CLASS} /></div>
            <div className="step-btn-nav">
              <button type="button" onClick={prevStep} className="btn-back">← Back</button>
              <button type="button" onClick={nextStep} className="btn-primary">Next →</button>
            </div>
          </div>
        )}

        {/* ── STEP: EXPERIENCE ── */}
        {mode === 'register' && signupStep === 'experience' && (
          <div className="space-y-4">
            <div><label className={LABEL_CLASS}>Number of Internships</label>
              <input type="number" name="internshipCount" min="0" max="10" value={signupForm.internshipCount} onChange={handleSignupInputChange} className={INPUT_CLASS} /></div>
            <div><label className={LABEL_CLASS}>Best Employer Tier</label>
              <select name="internshipEmployerTier" value={signupForm.internshipEmployerTier} onChange={handleSignupInputChange} className={SELECT_CLASS}>
                <option value="none">No internship</option>
                <option value="unverified">Unverified employer</option>
                <option value="recognized">Recognized employer</option>
              </select></div>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/8 hover:border-violet-500/30 transition-colors">
              <input type="checkbox" name="ppoExists" checked={signupForm.ppoExists} onChange={handleSignupInputChange} className="w-4 h-4 rounded accent-violet-500" />
              <div>
                <p className="text-sm font-semibold text-white font-body">Pre-Placement Offer (PPO)</p>
                <p className="text-xs text-white/30 font-body">I have a confirmed job offer</p>
              </div>
            </label>
            <div><label className={LABEL_CLASS}>Certifications Count</label>
              <input type="number" name="certCount" min="0" max="50" value={signupForm.certCount} onChange={handleSignupInputChange} className={INPUT_CLASS} /></div>
            <div className="step-btn-nav">
              <button type="button" onClick={prevStep} className="btn-back">← Back</button>
              <button type="button" onClick={nextStep} className="btn-primary">Next →</button>
            </div>
          </div>
        )}

        {/* ── STEP: TARGET ── */}
        {mode === 'register' && signupStep === 'target' && (
          <div className="space-y-4">
            <div><label className={LABEL_CLASS}>Target Field</label>
              <input type="text" name="targetField" placeholder="e.g., Software Development" value={signupForm.targetField} onChange={handleSignupInputChange} required className={INPUT_CLASS} /></div>
            <div><label className={LABEL_CLASS}>Target City Tier</label>
              <select name="targetCityTier" value={signupForm.targetCityTier} onChange={handleSignupInputChange} className={SELECT_CLASS}>
                <option value="1">Tier 1 — Metro cities</option>
                <option value="2">Tier 2 — Major cities</option>
                <option value="3">Tier 3 — Other</option>
              </select></div>
            <div><label className={LABEL_CLASS}>Your City</label>
              <select name="city" value={signupForm.city} onChange={handleSignupInputChange} required className={SELECT_CLASS}>
                <option value="">Select your city...</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other</option>
              </select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={LABEL_CLASS}>Grad Month</label>
                <select name="graduationMonth" value={signupForm.graduationMonth} onChange={handleSignupInputChange} className={SELECT_CLASS}>
                  <option value="1">January</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="12">December</option>
                </select></div>
              <div><label className={LABEL_CLASS}>Grad Year</label>
                <select name="graduationYear" value={signupForm.graduationYear} onChange={handleSignupInputChange} className={SELECT_CLASS}>
                  {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                </select></div>
            </div>
            <div className="step-btn-nav">
              <button type="button" onClick={prevStep} className="btn-back">← Back</button>
              <button type="button" onClick={nextStep} className="btn-primary">Next →</button>
            </div>
          </div>
        )}

        {/* ── STEP: LOAN ── */}
        {mode === 'register' && signupStep === 'loan' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div><label className={LABEL_CLASS}>Monthly Loan EMI (₹)</label>
              <input type="number" name="loanEmiMonthly" step="100" min="0" value={signupForm.loanEmiMonthly} onChange={handleSignupInputChange} required className={INPUT_CLASS} /></div>

            {/* Profile summary */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-violet-500/8 to-indigo-500/5 border border-violet-500/15">
              <p className="text-xs font-bold text-violet-300 font-display uppercase tracking-widest mb-3">Profile Summary</p>
              <div className="grid grid-cols-2 gap-y-2 text-xs font-body">
                {[
                  { k: 'Institution', v: signupForm.instituteName || '—' },
                  { k: 'Tier', v: signupForm.instituteTier },
                  { k: 'CGPA', v: `${signupForm.cgpa} / 4.0` },
                  { k: 'Target Field', v: signupForm.targetField || '—' },
                  { k: 'City', v: signupForm.city || '—' },
                ].map(({ k, v }) => (
                  <div key={k}>
                    <p className="text-white/30 mb-0.5">{k}</p>
                    <p className="text-white/80 font-semibold truncate">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="step-btn-nav">
              <button type="button" onClick={prevStep} className="btn-back">← Back</button>
              <button type="submit" disabled={submitting} className="btn-primary flex items-center justify-center gap-2">
                {submitting ? <><Spinner size="sm" /> Creating...</> : 'Create Account ✓'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Trust badges below panel */}
      <div className="flex items-center justify-center gap-6 mt-5">
        {['256-bit Encryption', 'Firebase Auth', 'GDPR Ready'].map(b => (
          <span key={b} className="flex items-center gap-1.5 text-xs text-white/20 font-body">
            <svg className="w-3 h-3 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {b}
          </span>
        ))}
      </div>
    </>
  );
}

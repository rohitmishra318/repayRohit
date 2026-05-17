import { useState, useEffect, useRef } from 'react';
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

// Animated counter hook
function useCounter(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useSession();

  const [mode, setMode] = useState<Mode>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>('basic');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState<SignupFormData>({
    email: '', password: '', confirmPassword: '', name: '',
    instituteName: '', instituteTier: 'tier_2',
    courseType: '', courseFamily: '', cgpa: 0,
    internshipCount: 0, internshipEmployerTier: 'none',
    ppoExists: false, certCount: 0,
    graduationMonth: 6, graduationYear: new Date().getFullYear(),
    targetField: '', targetCityTier: 2, loanEmiMonthly: 0,
  });

  // Entrance reveal
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Stats intersection observer
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/');
  }, [isAuthenticated, isLoading, navigate]);

  const c1 = useCounter(94, 1600, statsVisible);
  const c2 = useCounter(12800, 2000, statsVisible);
  const c3 = useCounter(3, 1200, statsVisible);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080812] flex items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  return (
    <>
      {/* ── Keyframes injected once ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        :root {
          --font-display: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
        }

        .font-display { font-family: var(--font-display); }
        .font-body    { font-family: var(--font-body); }

        @keyframes revealUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes revealFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatA {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-18px) rotate(3deg); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(14px) rotate(-2deg); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes gridPulse {
          0%,100% { opacity: 0.035; }
          50%      { opacity: 0.06; }
        }
        @keyframes orb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(40px,-30px) scale(1.08); }
          66%      { transform: translate(-20px,20px) scale(0.95); }
        }
        @keyframes orb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(-50px,40px) scale(1.1); }
          66%      { transform: translate(30px,-15px) scale(0.92); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes borderGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
          50%      { box-shadow: 0 0 0 3px rgba(139,92,246,0.15), 0 0 40px rgba(139,92,246,0.08); }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes badgePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50%      { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }

        .reveal-up   { opacity: 0; animation: revealUp 0.75s cubic-bezier(0.22,1,0.36,1) forwards; }
        .reveal-fade { opacity: 0; animation: revealFade 0.9s ease forwards; }
        .float-a     { animation: floatA 7s ease-in-out infinite; }
        .float-b     { animation: floatB 9s ease-in-out infinite; }
        .grid-bg     { animation: gridPulse 4s ease-in-out infinite; }
        .orb-1       { animation: orb1 12s ease-in-out infinite; }
        .orb-2       { animation: orb2 15s ease-in-out infinite; }
        .badge-pulse { animation: badgePulse 2s ease-in-out infinite; }
        .panel-glow  { animation: borderGlow 3s ease-in-out infinite; }
        .ticker-track{ animation: ticker 22s linear infinite; }

        .shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #a78bfa 40%, #38bdf8 60%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .glass-panel {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .noise-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        .scanline {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 120px;
          background: linear-gradient(to bottom, transparent, rgba(139,92,246,0.03), transparent);
          animation: scanline 8s linear infinite;
          pointer-events: none;
          z-index: 1;
        }

        select option { background: #1a1a2e; color: #fff; }

        .step-btn-nav {
          display: flex;
          gap: 8px;
          padding-top: 8px;
        }
        .btn-back {
          flex: 1;
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.6);
          padding: 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
          font-family: var(--font-body);
          cursor: pointer;
          background: transparent;
        }
        .btn-back:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
        .btn-primary {
          flex: 1;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff;
          padding: 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          transition: all 0.2s;
          font-family: var(--font-body);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 24px rgba(124,58,237,0.35);
        }
        .btn-primary:hover { background: linear-gradient(135deg, #8b5cf6, #7c3aed); transform: translateY(-1px); box-shadow: 0 6px 32px rgba(124,58,237,0.45); }
        .btn-primary:disabled { opacity: 0.4; transform: none; }
      `}</style>

      <div className="min-h-screen bg-[#080812] font-body relative overflow-x-hidden noise-overlay">
        <div className="scanline" />

        {/* ── Animated background orbs ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="orb-1 absolute top-[-15%] left-[-5%] w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />
          <div className="orb-2 absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)' }} />
          <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
        </div>

        {/* ── Grid background ── */}
        <div className="grid-bg fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />

        {/* ── Nav ── */}
        <nav
          className={`relative z-20 flex items-center justify-between px-8 py-5 reveal-fade`}
          style={{ animationDelay: '0ms', animationPlayState: revealed ? 'running' : 'paused' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-white tracking-tight">
              Repay<span className="text-violet-400">Signal</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge-pulse hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              System Online
            </span>
            <span className="text-xs text-white/30 hidden md:block font-body">v2.4</span>
          </div>
        </nav>

        {/* ── Ticker tape ── */}
        <div
          className={`relative z-10 border-y border-white/5 py-2.5 overflow-hidden reveal-fade`}
          style={{ animationDelay: '200ms', animationPlayState: revealed ? 'running' : 'paused' }}
        >
          <div className="ticker-track flex gap-16 whitespace-nowrap w-max">
            {[...Array(2)].map((_, ri) => (
              <div key={ri} className="flex gap-16">
                {[
                  { label: 'PLACEMENT RISK SCORE', val: '0.62', up: false },
                  { label: 'PORTFOLIO HEALTH', val: '94.2%', up: true },
                  { label: 'AVG SURVIVAL 12MO', val: '87.4%', up: true },
                  { label: 'HIGH RISK COUNT', val: '3', up: false },
                  { label: 'INTERVENTIONS ACTIVE', val: '7', up: false },
                  { label: 'STRESS INDEX', val: '0.44', up: false },
                  { label: 'ACTIVE BORROWERS', val: '12,847', up: true },
                  { label: 'EMI COVERAGE RATIO', val: '2.3x', up: true },
                ].map((t) => (
                  <span key={t.label} className="text-xs font-body font-medium">
                    <span className="text-white/25 mr-2">{t.label}</span>
                    <span className={t.up ? 'text-emerald-400' : 'text-rose-400'}>{t.val}</span>
                    <span className="text-white/15 ml-4">◆</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN SPLIT LAYOUT ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* ── LEFT: Brand + features ── */}
            <div className="space-y-10">

              {/* Tag line */}
              <div
                className={`reveal-up`}
                style={{ animationDelay: '100ms', animationPlayState: revealed ? 'running' : 'paused' }}
              >
                <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
                  <span className="text-xs text-violet-300 font-semibold font-body tracking-wide uppercase">AI-Powered Risk Platform</span>
                </div>

                <h1 className="font-display text-5xl xl:text-6xl font-extrabold leading-[1.05] text-white mb-5">
                  Smarter Lending<br />
                  <span className="shimmer-text">through Career<br />Intelligence</span>
                </h1>

                <p className="text-white/45 text-lg font-body leading-relaxed max-w-lg">
                  Predict placement timelines, salary trajectories, and repayment risk for education loan portfolios using live career signals.
                </p>
              </div>

              {/* Stats row */}
              <div
                ref={statsRef}
                className={`reveal-up`}
                style={{ animationDelay: '250ms', animationPlayState: revealed ? 'running' : 'paused' }}
              >
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: `${c1}%`, label: 'Prediction Accuracy', color: 'text-violet-300' },
                    { value: c2.toLocaleString(), label: 'Active Borrowers', color: 'text-sky-300' },
                    { value: `${c3}s`, label: 'Avg Risk Score Time', color: 'text-emerald-300' },
                  ].map((s) => (
                    <div key={s.label} className="glass-panel rounded-2xl p-4 text-center">
                      <div className={`font-display text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
                      <div className="text-xs text-white/30 font-body leading-tight">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature cards */}
              <div
                className={`reveal-up`}
                style={{ animationDelay: '380ms', animationPlayState: revealed ? 'running' : 'paused' }}
              >
                <div className="space-y-3">
                  {[
                    {
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                        </svg>
                      ),
                      title: 'XGBoost Risk Engine',
                      desc: 'Real-time ML scoring with 80% confidence intervals and SHAP explainability',
                      accent: 'from-violet-500/20 to-violet-500/5',
                      border: 'border-violet-500/15',
                      iconColor: 'text-violet-400',
                    },
                    {
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                      ),
                      title: 'Survival Analysis',
                      desc: 'Cox PH models predicting placement probability at 3, 6 and 12 months',
                      accent: 'from-sky-500/20 to-sky-500/5',
                      border: 'border-sky-500/15',
                      iconColor: 'text-sky-400',
                    },
                    {
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      ),
                      title: 'Intelligent Alerting',
                      desc: 'Auto-triggered interventions ranked by predicted lift and implementation cost',
                      accent: 'from-emerald-500/20 to-emerald-500/5',
                      border: 'border-emerald-500/15',
                      iconColor: 'text-emerald-400',
                    },
                  ].map((f) => (
                    <div
                      key={f.title}
                      className={`flex items-start gap-4 rounded-2xl p-4 bg-gradient-to-r ${f.accent} border ${f.border} hover:scale-[1.015] transition-transform cursor-default`}
                    >
                      <div className={`mt-0.5 shrink-0 ${f.iconColor}`}>{f.icon}</div>
                      <div>
                        <p className="text-sm font-bold text-white font-display mb-0.5">{f.title}</p>
                        <p className="text-xs text-white/40 font-body leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating mini chart decoration */}
              <div
                className={`float-b reveal-fade hidden lg:block`}
                style={{ animationDelay: '500ms', animationPlayState: revealed ? 'running' : 'paused' }}
              >
                <div className="glass-panel rounded-2xl px-5 py-4 inline-flex items-center gap-4">
                  <div className="flex items-end gap-1 h-8">
                    {[4, 6, 3, 8, 5, 9, 7, 10, 6, 11].map((h, i) => (
                      <div
                        key={i}
                        className="w-2 rounded-sm transition-all"
                        style={{
                          height: `${h * 3}px`,
                          background: i >= 7 ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.12)',
                        }}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white font-display">Portfolio Trend</p>
                    <p className="text-xs text-emerald-400 font-body">↑ 2.3% this week</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Auth Panel ── */}
            <div
              className={`reveal-up`}
              style={{ animationDelay: '180ms', animationPlayState: revealed ? 'running' : 'paused' }}
            >
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
              <div
                className={`reveal-fade flex items-center justify-center gap-6 mt-5`}
                style={{ animationDelay: '400ms', animationPlayState: revealed ? 'running' : 'paused' }}
              >
                {['256-bit Encryption', 'Firebase Auth', 'GDPR Ready'].map(b => (
                  <span key={b} className="flex items-center gap-1.5 text-xs text-white/20 font-body">
                    <svg className="w-3 h-3 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer
          className={`relative z-10 border-t border-white/5 px-8 py-5 flex items-center justify-between reveal-fade`}
          style={{ animationDelay: '600ms', animationPlayState: revealed ? 'running' : 'paused' }}
        >
          <span className="text-xs text-white/20 font-body">© 2026 RepaySignal. All rights reserved.</span>
          <span className="text-xs text-white/15 font-body hidden sm:block">Built for smarter education lending</span>
        </footer>
      </div>
    </>
  );
}
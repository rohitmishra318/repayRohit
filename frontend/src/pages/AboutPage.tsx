import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Scroll-reveal hook ──────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Parallax hook ───────────────────────────────────────────────────────────
function useParallax(speed = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const offset = (window.innerHeight / 2 - rect.top - rect.height / 2) * speed;
      ref.current.style.transform = `translateY(${offset}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);
  return ref;
}

// ── Animated counter ────────────────────────────────────────────────────────
function Counter({ target, suffix = '', prefix = '', duration = 2000, start }: {
  target: number; suffix?: string; prefix?: string; duration?: number; start: boolean;
}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let s: number;
    const step = (ts: number) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setVal(Math.floor(e * target));
      if (p < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

// ── Section wrapper ─────────────────────────────────────────────────────────
function Section({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}>
      {children}
    </div>
  );
}

// ── Timeline entry ──────────────────────────────────────────────────────────
function TimelineEntry({ step, title, body, tag, delay }: {
  step: string; title: string; body: string; tag: string; delay: number;
}) {
  const { ref, visible } = useInView(0.2);
  return (
    <div ref={ref} className="relative pl-12"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-30px)',
        transition: `all 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}>
      {/* Step node */}
      <div className="absolute left-0 top-1 w-8 h-8 rounded-xl
                      bg-gradient-to-br from-violet-500 to-indigo-600
                      flex items-center justify-center
                      shadow-lg shadow-violet-500/30 text-white text-xs font-bold font-mono">
        {step}
      </div>
      {/* Connector line */}
      <div className="absolute left-3.5 top-9 bottom-0 w-px bg-gradient-to-b from-violet-500/30 to-transparent" />
      <div className="mb-10">
        <span className="inline-block text-[9px] font-bold uppercase tracking-[0.18em]
                         text-violet-400 bg-violet-500/10 border border-violet-500/20
                         px-2.5 py-1 rounded-full font-mono mb-3">
          {tag}
        </span>
        <h3 className="font-display text-xl font-bold text-white mb-2 leading-tight">{title}</h3>
        <p className="text-white/50 font-body text-sm leading-relaxed max-w-xl">{body}</p>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export function AboutPage() {
  const navigate = useNavigate();
  const heroParallax = useParallax(0.2);
  const orbParallax1 = useParallax(0.15);
  const orbParallax2 = useParallax(-0.1);
  const statsSection = useInView(0.3);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollY / 500);
  const heroScale = 1 - scrollY * 0.0002;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Inter', sans-serif; letter-spacing: -0.02em; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .font-mono    { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }

        @keyframes gridPulse {
          0%,100% { opacity: 0.035; }
          50%      { opacity: 0.065; }
        }
        @keyframes floatOrb {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(40px,-30px) scale(1.07); }
          70%      { transform: translate(-20px,18px) scale(0.95); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(200vh); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 20px rgba(139,92,246,0.2); }
          50%      { box-shadow: 0 0 40px rgba(139,92,246,0.4); }
        }
        @keyframes borderRotate {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes dotBlink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.2; }
        }

        .grid-pulse  { animation: gridPulse 5s ease-in-out infinite; }
        .float-orb   { animation: floatOrb 14s ease-in-out infinite; }
        .float-orb-2 { animation: floatOrb 18s ease-in-out infinite reverse; }
        .scanline    { animation: scanline 12s linear infinite; }
        .ticker-run  { animation: ticker 28s linear infinite; }
        .glow-pulse  { animation: glowPulse 3s ease-in-out infinite; }

        .shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #a78bfa 35%, #38bdf8 55%, #34d399 75%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }

        .glass {
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .glass-strong {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(32px);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .card-hover {
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1),
                      border-color 0.3s ease,
                      box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          border-color: rgba(139,92,246,0.3);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(139,92,246,0.08);
        }

        .gradient-border {
          position: relative;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139,92,246,0.5), rgba(14,165,233,0.3), rgba(16,185,129,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .dot-blink { animation: dotBlink 1.8s ease-in-out infinite; }

        /* Horizontal rule with gradient */
        .hr-gradient {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), rgba(14,165,233,0.2), transparent);
        }

        /* Problem stat — large editorial number */
        .editorial-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 700;
          line-height: 0.9;
          letter-spacing: -0.04em;
          font-variant-numeric: tabular-nums;
        }

        /* Noise overlay */
        .noise::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1;
        }
      `}</style>

      <div className="min-h-screen bg-[#06060f] text-white font-body noise" style={{ overflowX: 'hidden' }}>

        {/* ══ AMBIENT BACKGROUND ══════════════════════════════════════════ */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="grid-pulse absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(139,92,246,0.055) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.055) 1px,transparent 1px)',
              backgroundSize: '64px 64px',
            }} />
          <div ref={orbParallax1} className="float-orb absolute top-[-15%] left-[-8%] w-[800px] h-[800px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 68%)' }} />
          <div ref={orbParallax2} className="float-orb-2 absolute top-[30%] right-[-12%] w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 68%)' }} />
          <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 68%)' }} />
          {/* Scanline */}
          <div className="scanline absolute top-0 left-0 right-0 h-[100px]"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(139,92,246,0.025), transparent)', pointerEvents: 'none' }} />
        </div>

        {/* ══ NAV ═════════════════════════════════════════════════════════ */}
        <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600
                            flex items-center justify-center shadow-lg shadow-violet-500/30
                            group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Repay<span className="text-violet-400">Signal</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono uppercase tracking-widest
                            text-emerald-400 bg-emerald-500/10 border border-emerald-500/20
                            px-3 py-1.5 rounded-full">
              <span className="dot-blink w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              System Online
            </div>
            <button onClick={() => navigate('/')}
              className="text-[11px] font-bold font-display uppercase tracking-widest
                         text-white/50 glass border border-white/8
                         px-4 py-2 rounded-xl hover:border-white/20 hover:text-white transition-all active:scale-95">
              ← Home
            </button>
          </div>
        </nav>

        {/* ══ TICKER TAPE ══════════════════════════════════════════════════ */}
        <div className="relative z-10 border-y border-white/5 py-2.5 overflow-hidden">
          <div className="ticker-run flex gap-20 whitespace-nowrap w-max">
            {[...Array(2)].map((_, ri) => (
              <div key={ri} className="flex gap-20">
                {[
                  { l: 'PLACEMENT RISK ENGINE', v: 'ACTIVE', c: 'text-emerald-400' },
                  { l: 'SHAP EXPLAINABILITY', v: 'v2.1', c: 'text-violet-400' },
                  { l: 'CONFORMAL PREDICTION', v: '80% CI', c: 'text-sky-400' },
                  { l: 'COX PH SURVIVAL MODEL', v: 'RUNNING', c: 'text-emerald-400' },
                  { l: 'PORTFOLIO BORROWERS', v: '12,847', c: 'text-amber-400' },
                  { l: 'BIAS DETECTION', v: 'ENABLED', c: 'text-violet-400' },
                  { l: 'PREDICTION ACCURACY', v: '94.2%', c: 'text-emerald-400' },
                  { l: 'MAPIE INTERVALS', v: 'CALIBRATED', c: 'text-sky-400' },
                ].map(t => (
                  <span key={t.l} className="text-[10px] font-mono">
                    <span className="text-white/20 mr-2">{t.l}</span>
                    <span className={t.c}>{t.v}</span>
                    <span className="text-white/10 ml-4">◆</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ══ HERO ════════════════════════════════════════════════════════ */}
        <section className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center
                            text-center px-6 pt-16 pb-24">
          <div ref={heroParallax}
            style={{ opacity: heroOpacity, transform: `scale(${heroScale})`, willChange: 'transform, opacity' }}>

            <Section>
              <div className="inline-flex items-center gap-2 glass border border-violet-500/20
                              rounded-full px-4 py-2 mb-8">
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full shadow-[0_0_6px_rgba(167,139,250,0.8)]" />
                <span className="text-[10px] font-bold font-mono tracking-[0.2em] uppercase text-violet-300">
                  The Future of Education Finance
                </span>
              </div>
            </Section>

            <Section delay={80}>
              <h1 className="font-display font-extrabold leading-[0.95] tracking-tighter mb-8 max-w-5xl mx-auto"
                style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)' }}>
                Education Loans<br />
                <span className="shimmer-text">Shouldn't Be</span><br />
                A Blind Bet.
              </h1>
            </Section>

            <Section delay={160}>
              <p className="text-white/45 font-body leading-relaxed max-w-2xl mx-auto mb-10"
                style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
                RepaySignal is the first AI platform built specifically to predict whether a student
                will repay their education loan, not based on credit scores, but on the
                <em className="text-white/70 not-italic font-medium"> actual likelihood they'll land a job</em> in their target field.
              </p>
            </Section>

            <Section delay={240}>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button onClick={() => navigate('/')}
                  className="glow-pulse bg-gradient-to-r from-violet-600 to-indigo-600
                             text-white font-bold font-display text-sm px-8 py-3.5 rounded-2xl
                             hover:from-violet-500 hover:to-indigo-500 transition-all active:scale-95
                             shadow-lg shadow-violet-500/30">
                  Get Started →
                </button>
                <a href="#problem"
                  className="glass border border-white/10 text-white/60 font-body text-sm
                             px-8 py-3.5 rounded-2xl hover:border-white/25 hover:text-white transition-all">
                  Read the story ↓
                </a>
              </div>
            </Section>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </section>

        <hr className="hr-gradient relative z-10" />

        {/* ══ THE PROBLEM ══════════════════════════════════════════════════ */}
        <section id="problem" className="relative z-10 py-28 px-6 max-w-7xl mx-auto">
          <Section>
            <div className="inline-flex items-center gap-2 glass border border-red-500/20
                            rounded-full px-3.5 py-1.5 mb-12">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              <span className="text-[10px] font-bold font-mono tracking-[0.18em] uppercase text-red-300">
                The Problem
              </span>
            </div>
          </Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: editorial numbers */}
            <div className="space-y-10">
              {[
                { num: '₹1.8L', label: 'Cr', sub: 'outstanding education loan debt in India', color: 'text-red-400', delay: 0 },
                { num: '34%', label: '', sub: 'of graduates remain unemployed 6 months post degree', color: 'text-amber-400', delay: 120 },
                { num: '0', label: '', sub: 'lenders currently use placement probability in risk models', color: 'text-violet-400', delay: 240 },
              ].map((s) => {
                const { ref, visible } = useInView(0.2);
                return (
                  <div key={s.sub} ref={ref}
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateX(0)' : 'translateX(-40px)',
                      transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${s.delay}ms`,
                    }}>
                    <div className="flex items-end gap-4">
                      <span className={`editorial-num ${s.color}`}>{s.num}</span>
                      {s.label && <span className="font-display text-3xl font-bold text-white/30 mb-2">{s.label}</span>}
                    </div>
                    <p className="text-white/40 font-body text-sm mt-2 max-w-xs">{s.sub}</p>
                  </div>
                );
              })}
            </div>

            {/* Right: narrative */}
            <div>
              <Section delay={100}>
                <div className="glass-strong gradient-border rounded-3xl p-8 space-y-5">
                  <h2 className="font-display text-2xl font-bold leading-tight">
                    Lenders are flying blind.
                  </h2>
                  <p className="text-white/50 font-body text-sm leading-relaxed">
                    Traditional credit models assess a student's parents' income, collateral, and credit history.
                    But none of that tells you whether a <em className="text-white/75 not-italic">Computer Science graduate from a Tier-2 college</em> targeting
                    a data science role will actually land a job within 6 months.
                  </p>
                  <p className="text-white/50 font-body text-sm leading-relaxed">
                    The result? Lenders default to conservative blanket rates, students are over-charged,
                    and defaulting borrowers only become visible <em className="text-white/75 not-italic">after it's too late</em> to intervene.
                  </p>
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-violet-300 font-body text-sm font-medium italic">
                      "We don't lack data. We lack the right model to read it."
                    </p>
                  </div>
                </div>
              </Section>
            </div>
          </div>
        </section>

        <hr className="hr-gradient relative z-10 mx-6" />

        {/* ══ STATS BAR ════════════════════════════════════════════════════ */}
        <section ref={statsSection.ref} className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { target: 94, suffix: '%', label: 'Prediction Accuracy', sub: 'validated on historical cohorts', color: 'text-violet-400', delay: 0 },
              { target: 12847, suffix: '', label: 'Active Borrowers', sub: 'monitored in real-time', color: 'text-sky-400', delay: 150 },
              { target: 740, suffix: '+', label: 'Sectors Tracked', sub: 'live macroscopic field maps', color: 'text-emerald-400', delay: 300 },
              { target: 80, suffix: '%', label: 'Conformal CI Width', sub: 'MAPIE calibration standard', color: 'text-amber-400', delay: 450 },
            ].map((s, i) => (
              <div key={i}
                className="glass-strong gradient-border rounded-2xl p-6 text-center card-hover"
                style={{
                  opacity: statsSection.visible ? 1 : 0,
                  transform: statsSection.visible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${s.delay}ms`,
                }}>
                <p className={`font-mono text-4xl font-bold tracking-tight ${s.color} mb-2`}>
                  <Counter target={s.target} suffix={s.suffix} start={statsSection.visible} duration={1800 + i * 200} />
                </p>
                <p className="text-xs font-bold font-display uppercase tracking-wider text-white/70 mb-1">{s.label}</p>
                <p className="text-[10px] text-white/30 font-body">{s.sub}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="hr-gradient relative z-10 mx-6" />

        {/* ══ THE SOLUTION — HOW IT WORKS ══════════════════════════════════ */}
        <section className="relative z-10 py-28 px-6 max-w-7xl mx-auto">
          <Section>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 glass border border-emerald-500/20
                              rounded-full px-3.5 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <span className="text-[10px] font-bold font-mono tracking-[0.18em] uppercase text-emerald-300">
                  The Solution
                </span>
              </div>
              <h2 className="font-display font-bold tracking-tighter text-white mb-4"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                A 360° Career Intelligence<br />
                <span className="shimmer-text">Risk Engine</span>
              </h2>
              <p className="text-white/40 font-body max-w-xl mx-auto text-sm leading-relaxed">
                RepaySignal doesn't replace credit scoring  it extends it with the dimension lenders were missing: career outcome probability.
              </p>
            </div>
          </Section>

          {/* How-it-works timeline */}
          <div className="max-w-2xl mx-auto">
            {[
              {
                step: '01',
                tag: 'Data Ingestion',
                title: 'Student profile is ingested at signup',
                body: 'Academic credentials, institution tier, internship history, certifications, CGPA, target field, graduation timeline, and loan EMI are all captured and normalized into feature vectors.',
              },
              {
                step: '02',
                tag: 'ML Risk Scoring',
                title: 'ML Risk Scoring',
                body: 'A trained XGBoost classifier evaluates the student across 20+ features, producing a continuous risk score between 0 and 1. MAPIE wraps this with an 80% conformal prediction interval so lenders see not just a score, but a calibrated range.',
              },
              {
                step: '03',
                tag: 'Survival Analysis',
                title: 'Cox PH model estimates placement timeline',
                body: 'Beyond the risk score, a Cox Proportional Hazard survival model predicts the probability of placement at 3, 6, and 12 months, giving lenders a time sensitive view of repayment risk that static models completely miss.',
              },
              {
                step: '04',
                tag: 'Explainability Layer',
                title: 'SHAP breaks down every prediction',
                body: 'For each student, SHAP values quantify how much each factor (CGPA, PPO, certification count, sector demand) contributed positively or negatively to their score. No black boxes. Full audit trail.',
              },
              {
                step: '05',
                tag: 'Alert & Intervention',
                title: 'Automated alerts trigger interventions',
                body: 'When a student\'s risk score crosses a threshold or their confidence interval widens dangerously, the system auto triggers a ranked list of interventions, sorted by predicted lift vs. implementation cost, for the lender to act on.',
              },
            ].map((e, i) => (
              <TimelineEntry key={e.step} {...e} delay={i * 80} />
            ))}
          </div>
        </section>

        <hr className="hr-gradient relative z-10 mx-6" />

        {/* ══ PILLARS — 3 CORE CAPABILITIES ════════════════════════════════ */}
        <section className="relative z-10 py-28 px-6 max-w-7xl mx-auto">
          <Section>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 glass border border-sky-500/20
                              rounded-full px-3.5 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                <span className="text-[10px] font-bold font-mono tracking-[0.18em] uppercase text-sky-300">
                  Core Capabilities
                </span>
              </div>
              <h2 className="font-display font-bold tracking-tighter text-white"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                Three pillars. One platform.
              </h2>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                accent: 'from-violet-500/15 to-violet-500/0',
                border: 'border-violet-500/15',
                iconBg: 'bg-violet-500/15 border-violet-500/25 text-violet-400',
                tag: 'Lender Intelligence',
                tagColor: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
                title: 'Portfolio Risk Dashboard',
                body: 'Admins see the entire loan book at a glance, showing geographic spread on an India map, sector by sector exposure, KPI ribbons for critical/medium/low counts, and a live stress test simulator that models what happens if hiring drops 30% in tech.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <rect x="3" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="14" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="3" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 17.5h7M17.5 14v7" />
                  </svg>
                ),
                delay: 0,
              },
              {
                accent: 'from-sky-500/15 to-sky-500/0',
                border: 'border-sky-500/15',
                iconBg: 'bg-sky-500/15 border-sky-500/25 text-sky-400',
                tag: 'Student Empowerment',
                tagColor: 'text-sky-300 bg-sky-500/10 border-sky-500/20',
                title: 'Personal Risk & What If Engine',
                body: 'Students see their own risk score with a plain English AI explanation, a survival curve showing their placement odds over time, and a what if simulator: "If I complete 2 more certifications, my risk drops from HIGH to MEDIUM." Transparent, actionable, fair.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                delay: 120,
              },
              {
                accent: 'from-emerald-500/15 to-emerald-500/0',
                border: 'border-emerald-500/15',
                iconBg: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
                tag: 'Trustworthy AI',
                tagColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
                title: 'Explainability & Bias Auditing',
                body: 'Every prediction carries a SHAP breakdown. Every model run is audited for demographic bias across institution tier, gender, and city tier. Every confidence interval is conformal certified. RepaySignal is built for regulators, not just lenders.',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                delay: 240,
              },
            ].map((c, i) => {
              const { ref, visible } = useInView(0.15);
              return (
                <div key={i} ref={ref}
                  className={`glass-strong rounded-3xl p-7 border ${c.border}
                              bg-gradient-to-br ${c.accent} card-hover relative overflow-hidden`}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(36px)',
                    transition: `all 0.75s cubic-bezier(0.22,1,0.36,1) ${c.delay}ms`,
                  }}>
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-5 ${c.iconBg}`}>
                    {c.icon}
                  </div>
                  <span className={`inline-block text-[9px] font-bold uppercase tracking-[0.16em] border px-2.5 py-1 rounded-full mb-3 font-mono ${c.tagColor}`}>
                    {c.tag}
                  </span>
                  <h3 className="font-display text-lg font-bold text-white mb-3 leading-tight">{c.title}</h3>
                  <p className="text-white/40 font-body text-sm leading-relaxed">{c.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <hr className="hr-gradient relative z-10 mx-6" />

        {/* ══ TECH STACK TRANSPARENCY ══════════════════════════════════════ */}
        <section className="relative z-10 py-28 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            <Section>
              <div>
                <div className="inline-flex items-center gap-2 glass border border-amber-500/20
                                rounded-full px-3.5 py-1.5 mb-8">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  <span className="text-[10px] font-bold font-mono tracking-[0.18em] uppercase text-amber-300">
                    Under the Hood
                  </span>
                </div>
                <h2 className="font-display font-bold tracking-tighter text-white mb-5"
                  style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
                  No hand wavy AI.<br />Real models. Real math.
                </h2>
                <p className="text-white/45 font-body text-sm leading-relaxed mb-6">
                  RepaySignal is not a GPT wrapper or a rules engine with a dashboard skin.
                  It's a full ML pipeline built on production-grade statistical methods
                  that are individually explainable, auditable, and regulation-ready.
                </p>
                <div className="glass rounded-2xl p-5 border border-white/5">
                  <p className="text-[10px] text-white/25 font-mono uppercase tracking-widest mb-3">Framework Version</p>
                  <p className="font-mono text-xl font-bold text-violet-400">v3.4 Conformal</p>
                  <p className="text-[10px] text-white/25 font-body mt-1">Trustworthy AI certified pipeline</p>
                </div>
              </div>
            </Section>

            {/* Tech grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'XGBoost', role: 'Risk Classifier', desc: 'Gradient boosted trees trained on 20+ placement features', color: 'violet', delay: 0 },
                { name: 'Cox PH', role: 'Survival Model', desc: 'Time to event prediction for placement probability curves', color: 'sky', delay: 80 },
                { name: 'SHAP', role: 'Explainability', desc: 'Shapley values decompose every individual risk score', color: 'emerald', delay: 160 },
                { name: 'MAPIE', role: 'Conformal CI', desc: 'Distribution free confidence intervals on every prediction', color: 'amber', delay: 240 },
                { name: 'FastAPI', role: 'Backend', desc: 'Async Python API with SQLAlchemy + SQLite storage layer', color: 'violet', delay: 320 },
                { name: 'React 19', role: 'Frontend', desc: 'TypeScript + React Query + Zustand + Tailwind CSS v4', color: 'sky', delay: 400 },
              ].map((t, i) => {
                const { ref, visible } = useInView(0.15);
                const c = {
                  violet: { bg: 'bg-violet-500/8', border: 'border-violet-500/15', tag: 'text-violet-400' },
                  sky: { bg: 'bg-sky-500/8', border: 'border-sky-500/15', tag: 'text-sky-400' },
                  emerald: { bg: 'bg-emerald-500/8', border: 'border-emerald-500/15', tag: 'text-emerald-400' },
                  amber: { bg: 'bg-amber-500/8', border: 'border-amber-500/15', tag: 'text-amber-400' },
                }[t.color]!;
                return (
                  <div key={i} ref={ref}
                    className={`${c.bg} border ${c.border} rounded-2xl p-4 card-hover`}
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateY(0)' : 'translateY(20px)',
                      transition: `all 0.65s cubic-bezier(0.22,1,0.36,1) ${t.delay}ms`,
                    }}>
                    <p className={`font-mono text-sm font-bold ${c.tag} mb-0.5`}>{t.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 font-display mb-2">{t.role}</p>
                    <p className="text-[11px] text-white/35 font-body leading-relaxed">{t.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <hr className="hr-gradient relative z-10 mx-6" />

        {/* ══ WHO IS IT FOR ════════════════════════════════════════════════ */}
        <section className="relative z-10 py-28 px-6 max-w-7xl mx-auto">
          <Section>
            <div className="text-center mb-16">
              <h2 className="font-display font-bold tracking-tighter text-white mb-4"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                Built for two people.<br />
                <span className="shimmer-text">Both matter equally.</span>
              </h2>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                role: 'The Lender',
                headline: 'Stop managing defaults. Start preventing them.',
                points: [
                  'See every borrower\'s placement probability, not just their credit score',
                  'Get auto triggered alerts before a student enters distress',
                  'Run sector level stress tests before you disburse',
                  'Build a portfolio with auditable, explainable risk ratings',
                ],
                cta: 'View Admin Dashboard',
                color: 'violet',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                delay: 0,
              },
              {
                role: 'The Student',
                headline: 'Understand your risk. Change the outcome.',
                points: [
                  'See your placement risk score and exactly what\'s driving it',
                  'Simulate: "What if I do one more internship?"',
                  'Get a survival curve showing your 3, 6, 12 month placement odds',
                  'Receive ranked interventions tailored to your exact profile',
                ],
                cta: 'View Student Dashboard',
                color: 'sky',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                ),
                delay: 150,
              },
            ].map((card, i) => {
              const { ref, visible } = useInView(0.15);
              const colors = {
                violet: {
                  grad: 'from-violet-500/10 to-violet-500/0',
                  border: 'border-violet-500/20',
                  icon: 'bg-violet-500/15 border-violet-500/25 text-violet-400',
                  tag: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
                  check: 'text-violet-400',
                  btn: 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/30',
                },
                sky: {
                  grad: 'from-sky-500/10 to-sky-500/0',
                  border: 'border-sky-500/20',
                  icon: 'bg-sky-500/15 border-sky-500/25 text-sky-400',
                  tag: 'text-sky-300 bg-sky-500/10 border-sky-500/20',
                  check: 'text-sky-400',
                  btn: 'bg-sky-600 hover:bg-sky-500 shadow-sky-500/30',
                },
              }[card.color]!;
              return (
                <div key={i} ref={ref}
                  className={`glass-strong rounded-3xl p-8 border ${colors.border}
                              bg-gradient-to-br ${colors.grad} card-hover`}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(36px)',
                    transition: `all 0.75s cubic-bezier(0.22,1,0.36,1) ${card.delay}ms`,
                  }}>
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-5 ${colors.icon}`}>
                    {card.icon}
                  </div>
                  <span className={`inline-block text-[9px] font-bold uppercase tracking-[0.16em] border px-2.5 py-1 rounded-full mb-4 font-mono ${colors.tag}`}>
                    {card.role}
                  </span>
                  <h3 className="font-display text-xl font-bold text-white mb-5 leading-tight">{card.headline}</h3>
                  <ul className="space-y-3 mb-7">
                    {card.points.map(p => (
                      <li key={p} className="flex items-start gap-3 text-sm text-white/45 font-body">
                        <svg className={`w-4 h-4 mt-0.5 shrink-0 ${colors.check}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigate('/')}
                    className={`w-full text-sm font-bold font-display text-white py-3 rounded-xl
                                transition-all active:scale-95 shadow-lg ${colors.btn}`}>
                    {card.cta} →
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <hr className="hr-gradient relative z-10 mx-6" />

        {/* ══ FINAL CTA ════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-32 px-6 text-center">
          <Section>
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display font-extrabold tracking-tighter text-white mb-6 leading-tight"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
                The information was always<br />
                <span className="shimmer-text">there. Now you can read it.</span>
              </h2>
              <p className="text-white/40 font-body text-sm leading-relaxed max-w-xl mx-auto mb-10">
                RepaySignal gives lenders the career intelligence layer that credit scores were
                never designed to provide. Start making risk decisions with the full picture.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button onClick={() => navigate('/')}
                  className="glow-pulse bg-gradient-to-r from-violet-600 to-indigo-600
                             text-white font-bold font-display text-sm px-10 py-4 rounded-2xl
                             hover:from-violet-500 hover:to-indigo-500 transition-all active:scale-95
                             shadow-xl shadow-violet-500/30">
                  Get Started Free →
                </button>
                <button onClick={() => navigate('/')}
                  className="glass border border-white/10 text-white/60 font-body text-sm
                             px-10 py-4 rounded-2xl hover:border-white/25 hover:text-white transition-all">
                  View Demo
                </button>
              </div>
            </div>
          </Section>
        </section>

        {/* ══ FOOTER ═══════════════════════════════════════════════════════ */}
        <footer className="relative z-10 border-t border-white/5 py-8 px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="font-display text-sm font-bold">Repay<span className="text-violet-400">Signal</span></span>
            </div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-white/15">
              © {new Date().getFullYear()} RepaySignal · All rights reserved
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400/60">
              <span className="dot-blink w-1 h-1 bg-emerald-400 rounded-full" />
              v3.4 Conformal
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
interface Props {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: Props) {
  return (
    <header className="bg-white/80 dark:bg-[#080812]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-white/10 px-8 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm dark:shadow-none transition-colors">

      {/* ── Title & Subtitle ── */}
      <div className="flex flex-col justify-center">
        <h1 className="text-lg font-display font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] text-slate-500 dark:text-white/50 mt-0.5 font-body font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {/* ── Actions & Badges ── */}
      <div className="flex items-center gap-4">

        {/* Premium Glowing Live Badge */}
        <span className="inline-flex items-center gap-2 text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 px-3 py-1.5 rounded-full font-body font-bold uppercase tracking-widest transition-colors">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          Live
        </span>

      </div>
    </header>
  );
}
import { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <header className="bg-white/80 dark:bg-[#080812]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-white/10 px-8 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm dark:shadow-none transition-colors shrink-0">

      {/* ── Title & Subtitle ── */}
      <div className="flex flex-col justify-center">
        <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] text-slate-500 dark:text-white/50 mt-1 font-body font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {/* ── Actions Container ── */}
      {actions && (
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
          {actions}
        </div>
      )}

    </header>
  );
}
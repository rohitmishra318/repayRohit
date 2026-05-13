interface Props {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: Props) {
  return (
    <header className="bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        {/* Swapped text-white for text-slate-900 */}
        <h1 className="text-base font-display font-bold text-slate-900">{title}</h1>
        {subtitle && (
          /* Swapped white/30 for slate-500 */
          <p className="text-xs text-slate-500 mt-0.5 font-body">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {/* Refined the badge for light mode contrast */}
        <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-body font-semibold">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Live
        </span>
      </div>
    </header>
  );
}
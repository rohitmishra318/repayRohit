export function Spinner({ size = 'md', label }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const sz = size === 'lg' ? 'w-10 h-10 border-3' : size === 'sm' ? 'w-4 h-4 border-2' : 'w-6 h-6 border-2';
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className={`${sz} border-slate-200 border-t-blue-600 rounded-full animate-spin`} />
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  );
}
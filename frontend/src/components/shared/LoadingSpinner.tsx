export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-purple-500 animate-spin" />
      <p className="text-sm text-white/40 font-body">{label}</p>
    </div>
  );
}
interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-lg">
        !
      </div>
      <p className="text-sm text-white/50">{message}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2">
          Try again
        </button>
      )}
    </div>
  );
}
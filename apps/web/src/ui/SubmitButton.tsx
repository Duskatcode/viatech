import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  children: ReactNode;
  loadingLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SubmitButton({
  children,
  loadingLabel = 'Guardando...',
  isLoading = false,
  disabled = false,
  className = '',
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {isLoading ? <Loader2 className="animate-spin" size={17} /> : null}
      {isLoading ? loadingLabel : children}
    </button>
  );
}

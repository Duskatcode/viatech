import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ActionButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  variant?: ActionButtonVariant;
}

const variantClassName: Record<ActionButtonVariant, string> = {
  primary:
    'border border-[var(--stitch-primary)] bg-[var(--stitch-primary)] text-white hover:bg-[var(--stitch-primary-container)]',
  secondary:
    'border border-[var(--stitch-primary)] bg-transparent text-[var(--stitch-primary)] hover:bg-[rgb(0_63_135_/_0.06)]',
  ghost:
    'border border-transparent bg-transparent text-[var(--stitch-on-surface-variant)] hover:bg-[var(--stitch-surface-container)] hover:text-[var(--stitch-primary)]',
  danger:
    'border border-[var(--stitch-error)] bg-[var(--stitch-error)] text-white hover:bg-[#93000a]',
};

export function ActionButton({
  children,
  icon,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60',
        variantClassName[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {icon ? <span className="inline-flex shrink-0">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}

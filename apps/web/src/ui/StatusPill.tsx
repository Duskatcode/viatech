import type { ReactNode } from 'react';

type StatusPillTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusPillProps {
  children: ReactNode;
  tone?: StatusPillTone;
  className?: string;
}

const toneClassName: Record<StatusPillTone, string> = {
  success: 'stitch-badge-success',
  warning: 'stitch-badge-warning',
  danger: 'stitch-badge-danger',
  info: 'stitch-badge-info',
  neutral: 'stitch-badge-neutral',
};

export function StatusPill({ children, tone = 'neutral', className = '' }: StatusPillProps) {
  return (
    <span className={['stitch-badge', toneClassName[tone], className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}

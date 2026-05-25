import type { ReactNode } from 'react';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
}

export function ResponsiveTable({
  children,
  className = '',
  wrapperClassName = '',
}: ResponsiveTableProps) {
  return (
    <div
      className={[
        'overflow-x-auto rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-lowest)]',
        wrapperClassName,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <table className={['stitch-table', className].filter(Boolean).join(' ')}>
        {children}
      </table>
    </div>
  );
}

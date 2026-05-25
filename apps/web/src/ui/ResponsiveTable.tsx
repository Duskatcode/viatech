import type { ReactNode } from 'react';

interface ResponsiveTableProps {
  children: ReactNode;
  minWidth?: string;
}

export function ResponsiveTable({
  children,
  minWidth = '900px',
}: ResponsiveTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <div className="overflow-x-auto">
        <div style={{ minWidth }}>{children}</div>
      </div>
    </div>
  );
}

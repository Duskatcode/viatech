import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  subtitle,
  eyebrow,
  actions,
  children,
  className = '',
}: PageHeaderProps) {
  const resolvedDescription = description ?? subtitle;

  return (
    <header
      className={[
        'mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="stitch-label mb-2">{eyebrow}</p>
        ) : null}

        <h1 className="stitch-page-title">{title}</h1>

        {resolvedDescription ? (
          <p className="stitch-page-description mt-1">{resolvedDescription}</p>
        ) : null}

        {children}
      </div>

      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}

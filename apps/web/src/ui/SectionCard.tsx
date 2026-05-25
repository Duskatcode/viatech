import type { ReactNode } from 'react';

interface SectionCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({
  children,
  title,
  description,
  icon,
  actions,
  className = '',
  bodyClassName = '',
}: SectionCardProps) {
  const hasHeader = title || description || icon || actions;

  return (
    <section className={['stitch-card overflow-hidden', className].filter(Boolean).join(' ')}>
      {hasHeader ? (
        <div className="stitch-card-header flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {icon ? (
              <div className="mt-0.5 text-[var(--stitch-primary)]">{icon}</div>
            ) : null}

            <div className="min-w-0">
              {title ? (
                <h2 className="text-lg font-semibold text-[var(--stitch-on-surface)]">{title}</h2>
              ) : null}

              {description ? (
                <p className="mt-1 text-sm text-[var(--stitch-on-surface-variant)]">
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}

      <div className={['p-5', bodyClassName].filter(Boolean).join(' ')}>{children}</div>
    </section>
  );
}

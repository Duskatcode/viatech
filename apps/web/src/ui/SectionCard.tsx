import type { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function SectionCard({
  title,
  description,
  children,
  actions,
}: SectionCardProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-sm sm:p-5">
      {(title || description || actions) ? (
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            {title ? (
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            ) : null}

            {description ? (
              <p className="mt-1 text-sm text-slate-400">{description}</p>
            ) : null}
          </div>

          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}

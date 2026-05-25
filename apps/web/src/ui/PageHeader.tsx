import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
      <div>
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

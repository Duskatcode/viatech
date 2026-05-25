import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';

interface StateMessageProps {
  title: string;
  description?: string;
}

export function LoadingState({ title, description }: StateMessageProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
      <div className="mx-auto mb-4 inline-flex rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
        <Loader2 className="animate-spin" size={24} />
      </div>

      <h2 className="text-lg font-semibold text-white">{title}</h2>

      {description ? (
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, description }: StateMessageProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
      <div className="mx-auto mb-4 inline-flex rounded-2xl bg-slate-800 p-3 text-slate-300">
        <Inbox size={24} />
      </div>

      <h2 className="text-lg font-semibold text-white">{title}</h2>

      {description ? (
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function ErrorState({ title, description }: StateMessageProps) {
  return (
    <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
      <div className="mx-auto mb-4 inline-flex rounded-2xl bg-red-500/10 p-3 text-red-300">
        <AlertTriangle size={24} />
      </div>

      <h2 className="text-lg font-semibold text-white">{title}</h2>

      {description ? (
        <p className="mx-auto mt-2 max-w-xl text-sm text-red-100/80">
          {description}
        </p>
      ) : null}
    </div>
  );
}

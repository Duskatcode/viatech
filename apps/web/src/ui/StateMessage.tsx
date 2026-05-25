import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';

interface StateMessageProps {
  title: string;
  description?: string;
}

export function LoadingState({
  title = 'Cargando...',
  description,
}: Partial<StateMessageProps>) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
      <Loader2 className="mx-auto animate-spin text-cyan-300" size={28} />
      <h2 className="mt-4 font-semibold text-white">{title}</h2>
      {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
    </div>
  );
}

export function EmptyState({ title, description }: StateMessageProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
      <Inbox className="mx-auto text-slate-500" size={30} />
      <h2 className="mt-4 font-semibold text-white">{title}</h2>
      {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
    </div>
  );
}

export function ErrorState({ title, description }: StateMessageProps) {
  return (
    <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center">
      <AlertTriangle className="mx-auto text-red-300" size={30} />
      <h2 className="mt-4 font-semibold text-red-100">{title}</h2>
      {description ? <p className="mt-2 text-sm text-red-100/80">{description}</p> : null}
    </div>
  );
}

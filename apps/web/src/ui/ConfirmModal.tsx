import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmModal({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  isSubmitting = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const confirmClassName =
    variant === 'danger'
      ? 'bg-red-400 text-slate-950 hover:bg-red-300'
      : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300';

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/80 px-4 backdrop-blur">
      <section className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="rounded-2xl bg-amber-400/10 p-3 text-amber-300">
              <AlertTriangle size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isSubmitting}
            className={[
              'rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:opacity-60',
              confirmClassName,
            ].join(' ')}
          >
            {isSubmitting ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

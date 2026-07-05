import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

import { ToastContext, type ToastType } from './toast-context';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

const toastStyles: Record<ToastType, string> = {
  success: 'border-emerald-700/40 bg-emerald-50 text-emerald-950 shadow-emerald-950/10',
  error: 'border-red-700/40 bg-red-50 text-red-950 shadow-red-950/10',
  info: 'border-cyan-700/40 bg-cyan-50 text-cyan-950 shadow-cyan-950/10',
  warning: 'border-amber-700/40 bg-amber-50 text-amber-950 shadow-amber-950/10',
};

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: { type: ToastType; title: string; description?: string }) => {
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : String(Date.now());

      const nextToast: Toast = {
        id,
        ...toast,
      };

      setToasts((current) => [nextToast, ...current].slice(0, 5));

      window.setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast],
  );

  const value = useMemo(
    () => ({
      addToast,
      removeToast,
    }),
    [addToast, removeToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed right-4 top-4 z-[80] w-full max-w-sm space-y-3">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];

          return (
            <div
              key={toast.id}
              className={[
                'rounded-2xl border p-4 shadow-2xl backdrop-blur-sm',
                toastStyles[toast.type],
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/10">
                  <Icon className="shrink-0" size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>

                  {toast.description ? (
                    <p className="mt-1 text-sm leading-6 opacity-90">{toast.description}</p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-lg p-1 text-current/70 transition hover:bg-black/10 hover:text-current"
                  aria-label="Cerrar notificación"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}


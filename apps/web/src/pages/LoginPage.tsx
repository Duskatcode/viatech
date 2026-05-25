import { useState } from 'react';
import type { FormEvent } from 'react';
import { Activity, Eye, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { getErrorMessage } from '../lib/error-message';
import { useToast } from '../ui/ToastProvider';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@biomed.local');
  const [password, setPassword] = useState('Admin12345!');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });

      addToast({
        type: 'success',
        title: 'Sesión iniciada',
        description: 'Bienvenido a BioMed Control.',
      });

      navigate('/', { replace: true });
    } catch (caughtError) {
      const message = getErrorMessage(
        caughtError,
        'Credenciales inválidas o API no disponible.',
      );

      setError(message);

      addToast({
        type: 'error',
        title: 'No se pudo iniciar sesión',
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--stitch-background)] px-4 py-8 text-[var(--stitch-on-surface)]">
      <div className="absolute right-[-12%] top-[-18%] h-[380px] w-[380px] rounded-full bg-[rgb(0_63_135_/_0.08)] blur-3xl" />
      <div className="absolute bottom-[-18%] left-[-12%] h-[420px] w-[420px] rounded-full bg-[rgb(0_110_37_/_0.08)] blur-3xl" />

      <section className="stitch-card relative z-10 grid w-full max-w-6xl overflow-hidden md:grid-cols-[1.05fr_0.95fr]">
        <aside className="hidden min-h-[680px] flex-col justify-between bg-[var(--stitch-sidebar-bg)] p-12 text-white md:flex">
          <div>
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--stitch-primary)] text-white">
                <Activity size={28} />
              </div>

              <div>
                <h1 className="text-xl font-bold leading-none">BioMed Control</h1>
                <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/55">
                  Institutional Precision
                </p>
              </div>
            </div>

            <h2 className="max-w-md text-4xl font-bold leading-tight tracking-[-0.03em]">
              Gestión avanzada de equipamiento biomédico
            </h2>

            <p className="mt-5 max-w-md text-base leading-7 text-white/68">
              Controle equipos, órdenes de mantenimiento, reportes, auditoría y documentación
              técnica desde una plataforma institucional centralizada.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[var(--stitch-primary-fixed-dim)]">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="text-sm font-bold">Acceso institucional seguro</p>
                <p className="mt-1 text-sm leading-6 text-white/58">
                  Use credenciales asignadas por el administrador de la clínica. Toda actividad
                  relevante queda registrada en auditoría.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-[680px] flex-col justify-center bg-[var(--stitch-surface-lowest)] p-8 md:p-14">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-10 md:hidden">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--stitch-primary)] text-white">
                <Activity size={30} />
              </div>

              <p className="text-xl font-bold">BioMed Control</p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--stitch-on-surface-variant)]">
                Institutional Precision
              </p>
            </div>

            <div className="mb-8">
              <p className="stitch-label mb-2">Acceso al sistema</p>
              <h2 className="text-2xl font-semibold tracking-[-0.01em] text-[var(--stitch-on-surface)]">
                Bienvenido de nuevo
              </h2>
              <p className="mt-2 text-sm text-[var(--stitch-on-surface-variant)]">
                Ingrese sus credenciales para acceder al centro de control biomédico.
              </p>
            </div>

            <div className="mb-7 rounded-lg border border-[rgb(250_189_0_/_0.35)] bg-[var(--stitch-tertiary-fixed)] p-4 text-[var(--stitch-on-surface)]">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 shrink-0 text-[var(--stitch-tertiary)]" size={19} />
                <p className="text-sm leading-6">
                  <strong>Nota de seguridad:</strong> si es su primer ingreso, cambie la contraseña
                  temporal después de iniciar sesión.
                </p>
              </div>
            </div>

            <form noValidate className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="stitch-label">Correo electrónico</span>
                <div className="relative mt-2">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--stitch-outline)]"
                    size={18}
                  />
                  <input
                    className="stitch-input py-3 pl-10 pr-4"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@clinica.com"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="stitch-label">Contraseña</span>
                <div className="relative mt-2">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--stitch-outline)]"
                    size={18}
                  />
                  <input
                    className="stitch-input py-3 pl-10 pr-11"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <Eye
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--stitch-outline)]"
                    size={18}
                  />
                </div>
              </label>

              {error ? (
                <div className="rounded-lg border border-[var(--stitch-danger-border)] bg-[var(--stitch-danger-bg)] px-4 py-3 text-sm text-[var(--stitch-danger-text)]">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--stitch-primary)] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[var(--stitch-primary-container)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Verificando...' : 'Iniciar sesión'}</span>
                <LogIn size={18} />
              </button>
            </form>

            <footer className="mt-10 text-center text-xs text-[var(--stitch-outline)]">
              <p>© 2026 BioMed Control. Plataforma de mantenimiento biomédico.</p>
              <div className="mt-3 flex justify-center gap-3">
                <span>Soporte</span>
                <span>•</span>
                <span>Privacidad</span>
                <span>•</span>
                <span>Términos</span>
              </div>
            </footer>
          </div>
        </section>
      </section>
    </main>
  );
}

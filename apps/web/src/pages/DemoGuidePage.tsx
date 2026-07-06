import { useState } from 'react';
import {
  Activity,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  KeyRound,
  Laptop,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DemoAccount {
  id: string;
  role: string;
  organization: string;
  email: string;
  password: string;
  description: string;
  icon: LucideIcon;
  tone: string;
}

const demoAccounts: DemoAccount[] = [
  {
    id: 'super-admin',
    role: 'SUPER_ADMIN',
    organization: 'Vista global',
    email: 'superadmin@vitatech.local',
    password: 'SuperAdmin123!',
    description: 'Panel global, usuarios y empresas.',
    icon: ShieldCheck,
    tone: 'bg-[#e9f0fb] text-[#123f91] border-[#cbd7ec]',
  },
  {
    id: 'metro-admin',
    role: 'ADMIN',
    organization: 'Clínica Metropolitana',
    email: 'admin@vitatech.local',
    password: 'Admin12345!',
    description: 'Equipos, órdenes, reportes y usuarios de empresa.',
    icon: UserCog,
    tone: 'bg-[#e9f5ee] text-[#16603c] border-[#cce6d7]',
  },
  {
    id: 'metro-technician',
    role: 'TECHNICIAN',
    organization: 'Clínica Metropolitana',
    email: 'tecnico@vitatech.local',
    password: 'Tecnico123!',
    description: 'Iniciar o completar órdenes y tareas asignadas.',
    icon: Wrench,
    tone: 'bg-[#fff4df] text-[#805100] border-[#ead7af]',
  },
  {
    id: 'metro-viewer',
    role: 'VIEWER / AUDITOR',
    organization: 'Clínica Metropolitana',
    email: 'auditor.metro@vitatech.local',
    password: 'AuditorMetro123!',
    description: 'Consulta de solo lectura, reportes y auditoría.',
    icon: ClipboardCheck,
    tone: 'bg-[#f2eef8] text-[#69418c] border-[#ddd1e9]',
  },
  {
    id: 'rafael-admin',
    role: 'ADMIN',
    organization: 'Hospital San Rafael',
    email: 'admin.rafael@vitatech.local',
    password: 'AdminRafael123!',
    description: 'Validar aislamiento entre las dos empresas demo.',
    icon: Building2,
    tone: 'bg-[#eef2f6] text-[#344054] border-[#d8dee6]',
  },
];

const checklistItems = [
  'Entrar como SUPER_ADMIN.',
  'Ver panel global.',
  'Entrar a Usuarios.',
  'Entrar como ADMIN.',
  'Ver equipos de Clínica Metropolitana.',
  'Abrir hoja de vida de EQ-MET-005.',
  'Ver órdenes de mantenimiento.',
  'Descargar PDF de una orden.',
  'Entrar como TECHNICIAN.',
  'Iniciar o revisar una orden asignada.',
  'Entrar como VIEWER.',
  'Confirmar modo solo lectura.',
  'Entrar como ADMIN Empresa B.',
  'Confirmar que ve EQ-RAF-* y no EQ-MET-*.',
];

const datasetMetrics = [
  ['2', 'empresas'],
  ['8', 'usuarios'],
  ['15', 'equipos'],
  ['12', 'órdenes'],
  ['66', 'tareas'],
  ['35', 'auditorías'],
];

const recommendedFlow = [
  {
    number: '01',
    role: 'SUPER_ADMIN',
    title: 'Visión global',
    description: 'Compare empresas, alertas, usuarios y actividad consolidada.',
    icon: ShieldCheck,
  },
  {
    number: '02',
    role: 'ADMIN',
    title: 'Gestión empresarial',
    description: 'Revise inventario, órdenes, usuarios y reportes de la clínica.',
    icon: UserCog,
  },
  {
    number: '03',
    role: 'TECHNICIAN',
    title: 'Ejecución técnica',
    description: 'Abra una orden asignada y revise tareas, hallazgos y cierre.',
    icon: Wrench,
  },
  {
    number: '04',
    role: 'VIEWER',
    title: 'Auditoría y lectura',
    description: 'Confirme que puede consultar sin crear ni modificar datos.',
    icon: ClipboardCheck,
  },
  {
    number: '05',
    role: 'EMPRESA B',
    title: 'Aislamiento multiempresa',
    description: 'Compruebe que Hospital San Rafael solo muestra equipos EQ-RAF.',
    icon: Building2,
  },
];

const presentationFlow = [
  ['01', 'SUPER_ADMIN', 'Panel global'],
  ['02', 'ADMIN', 'Equipos y usuarios'],
  ['03', 'ADMIN', 'Crear o revisar una orden'],
  ['04', 'TECHNICIAN', 'Ejecutar tareas'],
  ['05', 'VIEWER', 'Validar solo lectura'],
  ['06', 'ADMIN Empresa B', 'Validar aislamiento'],
  ['07', 'Reporte', 'Descargar un documento'],
  ['08', 'Feedback', 'Completar la evaluación'],
];

type CopyState = {
  key: string;
  status: 'copied' | 'error';
} | null;

export function DemoGuidePage() {
  const [copyState, setCopyState] = useState<CopyState>(null);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const currentDemoUrl =
    typeof window === 'undefined' ? 'http://localhost:8081' : window.location.origin;

  async function copyValue(key: string, value: string) {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }

      await navigator.clipboard.writeText(value);
      setCopyState({ key, status: 'copied' });
    } catch {
      setCopyState({ key, status: 'error' });
    }
  }

  function toggleChecklistItem(index: number) {
    setCheckedItems((current) => {
      const next = new Set(current);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  }

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fa] text-[#111827]">
      <a
        href="#demo-main"
        className="landing-skip-link fixed left-4 top-4 z-[100] rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-50 border-b border-[#dfe3e8] bg-[#f7f8fa]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:h-[72px] lg:px-10">
          <Link
            to="/"
            className="landing-focus inline-flex items-center gap-2.5 rounded-lg"
            aria-label="Vitatech, volver a la landing"
          >
            <BrandMark />
            <span className="text-[15px] font-bold tracking-[-0.02em]">
              Vitatech
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/feedback"
              className="landing-nav-link landing-focus hidden rounded-md px-2 py-2 text-sm font-semibold text-[#596273] md:inline-flex"
            >
              Feedback
            </Link>
            <Link
              to="/"
              className="landing-nav-link landing-focus hidden rounded-md px-2 py-2 text-sm font-semibold text-[#596273] sm:inline-flex"
            >
              Volver a la landing
            </Link>
            <Link
              to="/login"
              className="landing-button landing-focus inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#123f91] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgb(16_24_40_/_0.15)]"
            >
              Entrar al login
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main id="demo-main">
        <section className="border-b border-[#dfe3e8] bg-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.72fr] lg:items-center lg:px-10 lg:py-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#cbd4e1] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#344054]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1f7a4d]" />
                Guía pública para revisión del MVP
              </div>
              <h1 className="mt-6 text-[2.65rem] font-bold leading-[1.02] tracking-[-0.052em] text-[#101828] sm:text-[3.5rem] lg:text-[4rem]">
                Prueba la plataforma con datos demo
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[#596273] sm:text-lg sm:leading-8">
                Explora el flujo completo de mantenimiento biomédico con cuentas
                por rol, empresas demo, equipos pre-cargados, órdenes, reportes
                y auditoría.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="landing-button landing-focus inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#123f91] px-5 text-sm font-semibold text-white shadow-[0_1px_2px_rgb(16_24_40_/_0.16),0_8px_18px_rgb(18_63_145_/_0.14)]"
                >
                  Entrar al login
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <a
                  href="#checklist"
                  className="landing-secondary-button landing-focus inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#cfd5dd] bg-white px-5 text-sm font-semibold text-[#344054]"
                >
                  Ver checklist
                  <CheckCircle2 size={17} aria-hidden="true" />
                </a>
              </div>
            </div>

            <aside className="rounded-2xl border border-[#d8dde5] bg-[#f7f8fa] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e9f0fb] text-[#123f91]">
                  <Laptop size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#101828]">
                    URL de acceso
                  </p>
                  <p className="mt-0.5 text-xs text-[#667085]">
                    Usa la dirección disponible en tu entorno.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <UrlRow label="Entorno actual" value={currentDemoUrl} />
                <UrlRow label="Docker local" value="http://localhost:8081" />
              </div>

              <p className="mt-4 text-xs leading-5 text-[#667085]">
                Si accedes mediante Cloudflare Tunnel, conserva el dominio
                temporal que recibiste para toda la sesión.
              </p>
            </aside>
          </div>
        </section>

        <section className="border-b border-[#ead7af] bg-[#fff9ed]">
          <div className="mx-auto flex max-w-7xl items-start gap-4 px-5 py-6 sm:px-8 lg:px-10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#ead7af] bg-white text-[#805100]">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#5f3c00]">
                Credenciales exclusivas para demo o entorno local
              </h2>
              <ul className="mt-2 grid gap-x-8 gap-y-1.5 text-sm leading-6 text-[#765219] md:grid-cols-2">
                <li>No uses estas contraseñas en producción.</li>
                <li>No compartas access tokens ni refresh tokens.</li>
                <li>Estas cuentas contienen únicamente datos ficticios.</li>
                <li>La URL temporal deja de funcionar si el servidor se apaga.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="border-b border-[#dfe3e8] bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#123f91]">
                  Modo presentación
                </p>
                <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.045em] text-[#101828]">
                  Recorrido recomendado de 10 minutos
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#667085]">
                  Usa este resumen cuando necesites presentar el producto con
                  rapidez. El checklist detallado permanece disponible más
                  abajo.
                </p>
              </div>

              <ol className="grid gap-3 sm:grid-cols-2">
                {presentationFlow.map(([number, role, action]) => (
                  <li
                    key={number}
                    className="flex items-start gap-4 rounded-xl border border-[#d8dde5] bg-[#f8fafc] p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e9f0fb] font-mono text-xs font-bold text-[#123f91]">
                      {number}
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7a8494]">
                        {role}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#344054]">
                        {action}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-b border-[#dfe3e8] bg-[#f7f8fa] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <SectionHeading
              eyebrow="Cuentas recomendadas"
              title="Cambia de rol para revisar permisos y alcance."
              description="Copia únicamente el campo que necesites. La página no inicia sesión ni guarda credenciales."
            />

            <p
              aria-live="polite"
              className="mt-5 min-h-5 text-sm font-semibold text-[#475467]"
            >
              {copyState?.status === 'error'
                ? 'No se pudo copiar. Selecciona el texto manualmente.'
                : copyState?.status === 'copied'
                  ? 'Dato copiado al portapapeles.'
                  : ''}
            </p>

            <div className="mt-7 grid gap-4 lg:grid-cols-2">
              {demoAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  copyState={copyState}
                  onCopy={copyValue}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#dfe3e8] bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <SectionHeading
              eyebrow="Dataset reproducible"
              title="Un entorno pequeño, pero suficientemente completo."
              description="Los conteos corresponden al seed demo documentado. Si la base no fue reseteada, algunos valores pueden ser mayores."
            />

            <div className="mt-10 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#d8dde5] bg-[#d8dde5] sm:grid-cols-3 lg:grid-cols-6">
              {datasetMetrics.map(([value, label]) => (
                <div key={label} className="bg-white px-5 py-6 text-center">
                  <p className="text-3xl font-bold tracking-[-0.04em] text-[#101828]">
                    {value}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.11em] text-[#7a8494]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#27364d] bg-[#172235] py-20 text-white sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9fbce8]">
                  Flujo recomendado
                </p>
                <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.045em] sm:text-4xl">
                  Revisa el producto desde cinco perspectivas.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-[#bdc7d7] sm:text-base">
                  El orden propuesto muestra primero el alcance global y termina
                  validando las restricciones más importantes.
                </p>
              </div>

              <ol className="grid gap-px overflow-hidden rounded-2xl border border-white/12 bg-white/12 sm:grid-cols-2">
                {recommendedFlow.map((step) => {
                  const Icon = step.icon;

                  return (
                    <li key={step.number} className="bg-[#172235] p-6">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-[#8fb2e8]">
                          {step.number}
                        </span>
                        <Icon size={18} className="text-[#9fbce8]" />
                      </div>
                      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8fa0b7]">
                        {step.role}
                      </p>
                      <h3 className="mt-2 text-base font-bold">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#aeb9ca]">
                        {step.description}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        <section
          id="checklist"
          className="scroll-mt-24 border-b border-[#dfe3e8] bg-[#f7f8fa] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Checklist de revisión"
                title="Completa el recorrido funcional."
                description="El progreso vive solo en esta pestaña y se restablece al recargar."
              />
              <div className="flex shrink-0 items-center gap-3">
                <span className="rounded-full border border-[#cbd7ec] bg-[#e9f0fb] px-3 py-1.5 text-xs font-bold text-[#123f91]">
                  {checkedItems.size}/{checklistItems.length}
                </span>
                <button
                  type="button"
                  onClick={() => setCheckedItems(new Set())}
                  className="landing-secondary-button landing-focus inline-flex h-9 items-center gap-2 rounded-lg border border-[#cfd5dd] bg-white px-3 text-xs font-semibold text-[#475467]"
                >
                  <RotateCcw size={14} />
                  Reiniciar
                </button>
              </div>
            </div>

            <div className="mt-10 grid gap-3 md:grid-cols-2">
              {checklistItems.map((item, index) => {
                const isChecked = checkedItems.has(index);

                return (
                  <label
                    key={item}
                    className={[
                      'landing-check-item flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4',
                      isChecked
                        ? 'border-[#b9d8c6] bg-[#f4faf6]'
                        : 'border-[#d8dde5]',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleChecklistItem(index)}
                      className="sr-only"
                    />
                    <span
                      className={[
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
                        isChecked
                          ? 'border-[#1f7a4d] bg-[#1f7a4d] text-white'
                          : 'border-[#aeb7c4] bg-white text-transparent',
                      ].join(' ')}
                      aria-hidden="true"
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#98a2b3]">
                        Paso {String(index + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={[
                          'mt-1 block text-sm font-semibold',
                          isChecked
                            ? 'text-[#496454] line-through'
                            : 'text-[#344054]',
                        ].join(' ')}
                      >
                        {item}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="rounded-2xl border border-[#d8dde5] bg-[#f7f8fa] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e9f0fb] text-[#123f91]">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#101828]">
                    Links rápidos
                  </h2>
                  <p className="mt-1 text-sm text-[#667085]">
                    El dashboard requiere una sesión válida.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <QuickLink to="/login" label="Ir al login" />
                <QuickLink to="/" label="Ir a la landing" />
                <QuickLink
                  to="/dashboard"
                  label="Ver dashboard"
                  note="Requiere login"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#cbd7ec] bg-[#123f91] p-6 text-white sm:flex-row sm:items-center sm:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b9d0f1]">
                  Cierre de la revisión
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em]">
                  ¿Terminaste el recorrido?
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#d9e5f6]">
                  Comparte qué fue claro, qué falló y qué debería mejorar.
                </p>
              </div>
              <Link
                to="/feedback"
                className="landing-focus inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#123f91]"
              >
                Finalicé la prueba — Enviar feedback
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#dfe3e8] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-[#667085] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex items-center gap-2.5">
            <BrandMark compact />
            <span className="font-semibold text-[#344054]">Vitatech</span>
          </div>
          <p>Guía pública de revisión para el entorno demo.</p>
          <div className="flex items-center gap-4">
            <Link
              to="/feedback"
              className="landing-nav-link landing-focus rounded font-semibold text-[#475467]"
            >
              Enviar feedback
            </Link>
            <p>© 2026 Vitatech</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded-lg bg-[#123f91] text-white',
        compact ? 'h-7 w-7' : 'h-9 w-9',
      ].join(' ')}
      aria-hidden="true"
    >
      <Activity size={compact ? 16 : 19} strokeWidth={2.2} />
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#123f91]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.045em] text-[#101828] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 max-w-xl text-base leading-7 text-[#667085]">
        {description}
      </p>
    </div>
  );
}

function UrlRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d8dde5] bg-white px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7a8494]">
        {label}
      </p>
      <p className="mt-1 break-all font-mono text-xs font-semibold text-[#344054]">
        {value}
      </p>
    </div>
  );
}

function AccountCard({
  account,
  copyState,
  onCopy,
}: {
  account: DemoAccount;
  copyState: CopyState;
  onCopy: (key: string, value: string) => Promise<void>;
}) {
  const Icon = account.icon;
  const emailKey = `${account.id}-email`;
  const passwordKey = `${account.id}-password`;

  return (
    <article className="rounded-2xl border border-[#d8dde5] bg-white p-5 shadow-[0_1px_2px_rgb(16_24_40_/_0.03)] sm:p-6">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${account.tone}`}
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-[#101828]">{account.role}</h3>
            <span className="rounded-full bg-[#eef2f6] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#596273]">
              {account.organization}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            {account.description}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <CredentialRow
          label="Email"
          value={account.email}
          buttonLabel={
            copyState?.key === emailKey && copyState.status === 'copied'
              ? 'Copiado'
              : 'Copiar email'
          }
          onCopy={() => onCopy(emailKey, account.email)}
        />
        <CredentialRow
          label="Password"
          value={account.password}
          buttonLabel={
            copyState?.key === passwordKey && copyState.status === 'copied'
              ? 'Copiado'
              : 'Copiar password'
          }
          onCopy={() => onCopy(passwordKey, account.password)}
        />
      </div>
    </article>
  );
}

function CredentialRow({
  label,
  value,
  buttonLabel,
  onCopy,
}: {
  label: string;
  value: string;
  buttonLabel: string;
  onCopy: () => void;
}) {
  const isCopied = buttonLabel === 'Copiado';

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#e2e6eb] bg-[#f8fafc] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#7a8494]">
          {label}
        </p>
        <p className="mt-1 break-all font-mono text-xs font-semibold text-[#344054]">
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`${buttonLabel}: ${label}`}
        className={[
          'landing-secondary-button landing-focus inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold',
          isCopied
            ? 'border-[#b9d8c6] bg-[#e9f5ee] text-[#16603c]'
            : 'border-[#cfd5dd] bg-white text-[#475467]',
        ].join(' ')}
      >
        {isCopied ? <CheckCircle2 size={14} /> : <Clipboard size={14} />}
        {buttonLabel}
      </button>
    </div>
  );
}

function QuickLink({
  to,
  label,
  note,
}: {
  to: string;
  label: string;
  note?: string;
}) {
  return (
    <Link
      to={to}
      className="landing-secondary-button landing-focus flex items-center justify-between rounded-xl border border-[#d8dde5] bg-white p-4 text-sm font-bold text-[#344054]"
    >
      <span>
        {label}
        {note ? (
          <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.08em] text-[#7a8494]">
            {note}
          </span>
        ) : null}
      </span>
      <ArrowRight size={16} className="text-[#123f91]" />
    </Link>
  );
}

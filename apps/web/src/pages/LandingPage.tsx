import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowRight,
  BellRing,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileBarChart,
  FileWarning,
  History,
  LockKeyhole,
  MonitorCog,
  Paperclip,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const problems = [
  {
    icon: Archive,
    title: 'Hojas de vida dispersas',
    description:
      'Documentos técnicos repartidos entre carpetas, hojas de cálculo y correos.',
  },
  {
    icon: AlertTriangle,
    title: 'Mantenimientos vencidos',
    description:
      'Fechas críticas sin seguimiento centralizado ni responsables claramente visibles.',
  },
  {
    icon: FileWarning,
    title: 'Evidencias difíciles de auditar',
    description:
      'Actas, fotografías y soportes desconectados de la orden que los originó.',
  },
  {
    icon: ShieldAlert,
    title: 'Equipos sin trazabilidad',
    description:
      'Cambios de estado y decisiones técnicas sin un historial verificable.',
  },
];

const features = [
  {
    icon: Building2,
    title: 'Multiempresa',
    description: 'Empresas, sedes y áreas aisladas según la organización.',
  },
  {
    icon: UsersRound,
    title: 'Roles y permisos',
    description: 'Acceso para administradores, técnicos y consulta.',
  },
  {
    icon: Stethoscope,
    title: 'Equipos biomédicos',
    description: 'Hoja de vida, ubicación, estado y documentación técnica.',
  },
  {
    icon: ClipboardList,
    title: 'Órdenes de mantenimiento',
    description: 'Preventivos y correctivos con tareas, fechas y responsables.',
  },
  {
    icon: Paperclip,
    title: 'Adjuntos y evidencias',
    description: 'Soportes asociados directamente al equipo y la intervención.',
  },
  {
    icon: FileBarChart,
    title: 'Reportes operativos',
    description: 'Exportaciones PDF, CSV y XLSX listas para revisión.',
  },
];

const workflow = [
  ['01', 'Registrar equipo', 'Cree la hoja de vida y asigne sede, área y estado.'],
  ['02', 'Crear orden', 'Defina tipo, prioridad, fecha y técnico responsable.'],
  ['03', 'Ejecutar mantenimiento', 'Documente tareas, hallazgos y resultado técnico.'],
  ['04', 'Adjuntar evidencia', 'Asocie soportes a la intervención correspondiente.'],
  ['05', 'Exportar reporte', 'Genere documentos PDF, CSV o XLSX para revisión.'],
  ['06', 'Auditar', 'Consulte quién realizó cada acción relevante y cuándo.'],
];

const trustItems = [
  {
    icon: LockKeyhole,
    label: 'RBAC por rol, empresa y responsabilidad',
  },
  {
    icon: History,
    label: 'Trazabilidad de acciones críticas',
  },
  {
    icon: FileCheck2,
    label: 'Datos demo reproducibles para validación',
  },
  {
    icon: FileBarChart,
    label: 'Exportación PDF, CSV y XLSX',
  },
];

export function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-[#f7f8fa] text-[#111827]">
      <a
        href="#main-content"
        className="landing-skip-link fixed left-4 top-4 z-[100] rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-50 border-b border-[#dfe3e8] bg-[#f7f8fa]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:h-[72px] lg:px-10">
          <Link
            to="/"
            className="landing-focus inline-flex items-center gap-2.5 rounded-lg"
            aria-label="BioMed Control, inicio"
          >
            <BrandMark />
            <span className="text-[15px] font-bold tracking-[-0.02em]">
              BioMed Control
            </span>
          </Link>

          <nav
            className="hidden items-center gap-7 md:flex"
            aria-label="Navegación principal"
          >
            <a
              className="landing-nav-link landing-focus rounded-md text-sm font-medium text-[#596273]"
              href="#producto"
            >
              Producto
            </a>
            <a
              className="landing-nav-link landing-focus rounded-md text-sm font-medium text-[#596273]"
              href="#flujo"
            >
              Flujo
            </a>
            <a
              className="landing-nav-link landing-focus rounded-md text-sm font-medium text-[#596273]"
              href="#funciones"
            >
              Funciones
            </a>
            <Link
              className="landing-nav-link landing-focus rounded-md text-sm font-medium text-[#596273]"
              to="/demo"
            >
              Demo
            </Link>
          </nav>

          <Link
            to="/login"
            className="landing-button landing-focus inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#123f91] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgb(16_24_40_/_0.15)]"
          >
            Entrar
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main id="main-content">
        <section className="relative overflow-hidden border-b border-[#dfe3e8]">
          <div
            className="pointer-events-none absolute inset-y-0 left-10 hidden w-px bg-[#e4e7eb] lg:block"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-10 hidden w-px bg-[#e4e7eb] lg:block"
            aria-hidden="true"
          />

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12 lg:px-10 lg:py-24">
            <div className="max-w-xl">
              <div className="landing-enter landing-enter-1 inline-flex items-center gap-2 rounded-full border border-[#cbd4e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#344054] shadow-[0_1px_2px_rgb(16_24_40_/_0.04)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1f7a4d]" />
                Operación biomédica, en una sola vista
              </div>

              <h1 className="landing-enter landing-enter-2 mt-6 text-[2.75rem] font-bold leading-[0.98] tracking-[-0.055em] text-[#101828] sm:text-[3.65rem] lg:text-[4.15rem]">
                Control biomédico claro para equipos, mantenimientos y auditoría
                clínica.
              </h1>

              <p className="landing-enter landing-enter-3 mt-6 max-w-lg text-base leading-7 text-[#596273] sm:text-lg sm:leading-8">
                Centraliza hojas de vida, órdenes preventivas y correctivas,
                evidencias, reportes y trazabilidad multiempresa en una sola
                plataforma.
              </p>

              <div className="landing-enter landing-enter-4 mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="landing-button landing-focus inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#123f91] px-5 text-sm font-semibold text-white shadow-[0_1px_2px_rgb(16_24_40_/_0.16),0_8px_18px_rgb(18_63_145_/_0.14)]"
                >
                  Probar demo
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <a
                  href="#flujo"
                  className="landing-secondary-button landing-focus inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#cfd5dd] bg-white px-5 text-sm font-semibold text-[#344054] shadow-[0_1px_2px_rgb(16_24_40_/_0.04)]"
                >
                  Ver flujo de mantenimiento
                  <ChevronRight size={17} aria-hidden="true" />
                </a>
              </div>

              <div className="landing-enter landing-enter-5 mt-9 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[#dfe3e8] pt-6 sm:grid-cols-4">
                <DemoMetric value="15" label="equipos demo" />
                <DemoMetric value="12" label="órdenes" />
                <DemoMetric value="8" label="usuarios" />
                <DemoMetric value="2" label="empresas" />
              </div>
            </div>

            <ProductPreview />
          </div>
        </section>

        <section
          aria-label="Resumen del producto"
          className="border-b border-[#dfe3e8] bg-white"
        >
          <div className="mx-auto grid max-w-7xl divide-y divide-[#e4e7eb] px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-10">
            <ProofPoint
              icon={BellRing}
              label="Alertas"
              value="Vencimientos y próximos mantenimientos"
            />
            <ProofPoint
              icon={History}
              label="Trazabilidad"
              value="Historial técnico por equipo"
            />
            <ProofPoint
              icon={ShieldCheck}
              label="Gobierno"
              value="Roles, permisos y auditoría"
            />
          </div>
        </section>

        <section
          id="producto"
          className="scroll-mt-24 border-b border-[#dfe3e8] bg-[#f7f8fa] py-20 sm:py-28"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <SectionHeading
              eyebrow="El problema operativo"
              title="La información crítica no debería depender de archivos dispersos."
              description="Cuando el inventario, las órdenes y las evidencias viven en sistemas separados, aumenta el riesgo de perder contexto técnico."
            />

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {problems.map((problem) => {
                const Icon = problem.icon;

                return (
                  <article
                    key={problem.title}
                    className="landing-feature-card rounded-2xl border border-[#d8dde5] bg-white p-6 shadow-[0_1px_2px_rgb(16_24_40_/_0.03)] sm:p-7"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#ead9d5] bg-[#fbf1ef] text-[#9c3c2b]">
                      <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <h3 className="mt-6 text-lg font-bold tracking-[-0.025em] text-[#101828]">
                      {problem.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#667085]">
                      {problem.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-12 grid overflow-hidden rounded-2xl border border-[#cbd7ec] bg-[#123f91] text-white lg:grid-cols-[0.8fr_1.2fr]">
              <div className="border-b border-white/12 p-7 sm:p-9 lg:border-b-0 lg:border-r">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b9d0f1]">
                  La solución
                </p>
                <h3 className="mt-4 text-2xl font-bold tracking-[-0.035em]">
                  Un registro operativo conectado desde el equipo hasta la
                  auditoría.
                </h3>
              </div>
              <div className="grid gap-px bg-white/12 sm:grid-cols-2">
                {[
                  'Inventario biomédico centralizado',
                  'Órdenes preventivas y correctivas',
                  'Alertas operativas y vencimientos',
                  'Reportes y auditoría verificable',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 bg-[#123f91] p-5 text-sm font-semibold text-[#eef4fc]"
                  >
                    <Check size={16} className="shrink-0 text-[#9fc0ed]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="funciones"
          className="scroll-mt-24 border-b border-[#dfe3e8] bg-white py-20 sm:py-28"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <SectionHeading
              eyebrow="Funciones del producto"
              title="Lo necesario para operar, documentar y supervisar."
              description="Cada módulo responde a una parte concreta del ciclo de mantenimiento biomédico."
            />

            <div className="mt-12 grid gap-x-8 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="group flex gap-4 border-t border-[#e2e6eb] py-6"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f2f6fc] text-[#123f91]">
                      <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#101828]">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#667085]">
                        {feature.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="flujo"
          className="scroll-mt-24 border-b border-[#27364d] bg-[#172235] py-20 text-white sm:py-28"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9fbce8]">
                  Del activo al reporte
                </p>
                <h2 className="mt-4 max-w-md text-3xl font-bold leading-tight tracking-[-0.045em] sm:text-4xl">
                  Un flujo claro para todo el ciclo técnico.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-[#bdc7d7] sm:text-base">
                  La información avanza con el trabajo, sin duplicar registros
                  ni perder el contexto entre áreas.
                </p>
              </div>

              <ol className="grid gap-px overflow-hidden rounded-2xl border border-white/12 bg-white/12 sm:grid-cols-2">
                {workflow.map(([number, title, description]) => (
                  <li key={number} className="bg-[#172235] p-6 sm:p-7">
                    <span className="font-mono text-xs font-semibold text-[#8fb2e8]">
                      {number}
                    </span>
                    <h3 className="mt-5 text-base font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#aeb9ca]">
                      {description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section
          id="seguridad"
          className="scroll-mt-24 bg-white py-20 sm:py-28"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              <div className="rounded-2xl border border-[#d8dde5] bg-[#f7f8fa] p-5 sm:p-8">
                <div className="rounded-xl border border-[#d8dde5] bg-white p-5 shadow-[0_8px_24px_rgb(16_24_40_/_0.06)]">
                  <div className="flex items-start justify-between gap-4 border-b border-[#e7e9ed] pb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e9f5ee] text-[#1f7a4d]">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#101828]">
                          Confianza operativa
                        </p>
                        <p className="mt-0.5 text-xs text-[#667085]">
                          Controles integrados en el producto
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#e9f5ee] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#16603c]">
                      Activo
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {trustItems.map((item) => {
                      const ItemIcon = item.icon;

                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 text-sm text-[#475467]"
                        >
                          <ItemIcon
                            size={17}
                            className="shrink-0 text-[#1f7a4d]"
                          />
                          <span>{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#123f91]">
                  Confianza y control
                </p>
                <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight tracking-[-0.045em] text-[#101828] sm:text-4xl">
                  Trazabilidad preparada para supervisión técnica.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-[#667085]">
                  Cada usuario ve lo que le corresponde y las operaciones
                  relevantes conservan un registro verificable para supervisión
                  clínica, seguimiento interno y elaboración de reportes.
                </p>
                <Link
                  to="/login"
                  className="landing-inline-link landing-focus mt-7 inline-flex items-center gap-2 rounded-md text-sm font-bold text-[#123f91]"
                >
                  Probar controles en la demo
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          id="demo"
          className="scroll-mt-24 border-y border-[#dfe3e8] bg-[#f7f8fa] py-20 sm:py-24"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16 lg:px-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#123f91]">
                Guía de demo
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.045em] text-[#101828] sm:text-4xl">
                Recorra un flujo biomédico completo.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-[#667085]">
                La demo incluye datos reproducibles para explorar inventario,
                órdenes, usuarios, reportes y auditoría sin depender de
                información clínica real.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="landing-button landing-focus inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#123f91] px-5 text-sm font-semibold text-white shadow-[0_1px_2px_rgb(16_24_40_/_0.16)]"
                >
                  Entrar a la demo
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link
                  to="/demo"
                  className="landing-secondary-button landing-focus inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#cfd5dd] bg-white px-5 text-sm font-semibold text-[#344054]"
                >
                  Ver guía de prueba
                  <ChevronRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <ol className="grid gap-3 sm:grid-cols-2">
              {[
                ['1', 'Revise el panel', 'Identifique alertas y carga operativa.'],
                ['2', 'Abra un equipo', 'Consulte su hoja de vida e historial.'],
                ['3', 'Siga una orden', 'Revise tareas, técnico y evidencias.'],
                ['4', 'Exporte y audite', 'Genere un reporte y valide actividad.'],
              ].map(([number, title, description]) => (
                <li
                  key={number}
                  className="rounded-xl border border-[#d8dde5] bg-white p-5"
                >
                  <span className="font-mono text-xs font-bold text-[#123f91]">
                    {number.padStart(2, '0')}
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-[#101828]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#667085]">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-b border-[#dfe3e8] bg-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-5 py-14 sm:px-8 md:flex-row md:items-center lg:px-10 lg:py-16">
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.035em] text-[#101828] sm:text-3xl">
                Explore la plataforma con datos biomédicos demo.
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#667085] sm:text-base">
                Inventario, mantenimiento, evidencias, reportes y auditoría en
                un mismo recorrido.
              </p>
            </div>
            <Link
              to="/login"
              className="landing-button landing-focus inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#123f91] px-5 text-sm font-semibold text-white shadow-[0_1px_2px_rgb(16_24_40_/_0.16)]"
            >
              Entrar a la demo
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-xs text-[#667085] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex items-center gap-2.5">
            <BrandMark compact />
            <span className="font-semibold text-[#344054]">BioMed Control</span>
          </div>
          <p>Plataforma de gestión de mantenimiento biomédico.</p>
          <p>© 2026 BioMed Control</p>
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

function DemoMetric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-xl font-bold tracking-[-0.035em] text-[#101828]">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7a8494]">
        {label}
      </p>
    </div>
  );
}

function ProofPoint({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 py-6 md:px-7 lg:px-9">
      <Icon size={20} className="shrink-0 text-[#123f91]" strokeWidth={1.8} />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#7a8494]">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-[#344054]">{value}</p>
      </div>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="landing-enter landing-enter-preview relative mx-auto w-full max-w-[720px] lg:mx-0">
      <div
        className="absolute -inset-3 rounded-[22px] border border-[#dfe3e8] sm:-inset-5"
        aria-hidden="true"
      />
      <div className="relative overflow-hidden rounded-2xl border border-[#cbd1da] bg-white shadow-[0_24px_70px_rgb(16_24_40_/_0.16),0_2px_8px_rgb(16_24_40_/_0.08)]">
        <div className="flex h-11 items-center justify-between border-b border-[#e2e5e9] bg-[#fbfcfd] px-4">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#d4d8de]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#d4d8de]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#d4d8de]" />
          </div>
          <div className="rounded-md border border-[#e0e4e9] bg-white px-3 py-1 text-[9px] font-medium text-[#7a8494]">
            app.biomedcontrol.co/dashboard
          </div>
          <div className="w-[38px]" />
        </div>

        <div className="grid min-h-[390px] grid-cols-[64px_1fr] sm:min-h-[460px] sm:grid-cols-[150px_1fr]">
          <aside className="bg-[#172235] p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <BrandMark compact />
              <span className="hidden text-[10px] font-bold text-white sm:block">
                BioMed Control
              </span>
            </div>
            <div className="mt-7 space-y-2">
              {[
                [Activity, 'Panel'],
                [Stethoscope, 'Equipos'],
                [Wrench, 'Órdenes'],
                [FileBarChart, 'Reportes'],
              ].map(([Icon, label], index) => {
                const ItemIcon = Icon as typeof Activity;

                return (
                  <div
                    key={label as string}
                    className={[
                      'flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[10px]',
                      index === 0
                        ? 'bg-white/10 font-semibold text-white'
                        : 'text-[#9eaabd]',
                    ].join(' ')}
                  >
                    <ItemIcon size={14} />
                    <span className="hidden sm:inline">{label as string}</span>
                  </div>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0 bg-[#f5f6f8]">
            <div className="flex h-14 items-center justify-between border-b border-[#dfe3e8] bg-white px-4 sm:px-5">
              <div>
                <p className="text-[11px] font-bold text-[#1d2939] sm:text-xs">
                  Panel de control
                </p>
                <p className="mt-0.5 hidden text-[8px] text-[#7a8494] sm:block">
                  Resumen de operación biomédica
                </p>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e5ecf7] text-[9px] font-bold text-[#123f91]">
                AC
              </div>
            </div>

            <div className="p-3 sm:p-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                <PreviewMetric
                  icon={MonitorCog}
                  label="Equipos"
                  value="15"
                  detail="13 activos"
                />
                <PreviewMetric
                  icon={ClipboardCheck}
                  label="Órdenes"
                  value="12"
                  detail="4 pendientes"
                />
                <PreviewMetric
                  icon={ShieldCheck}
                  label="Cumplimiento"
                  value="92%"
                  detail="Este mes"
                  className="col-span-2 sm:col-span-1"
                />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-[1.35fr_0.65fr]">
                <div className="rounded-lg border border-[#dfe3e8] bg-white p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#344054]">
                        Próximos mantenimientos
                      </p>
                      <p className="mt-0.5 text-[8px] text-[#98a2b3]">
                        Agenda operativa
                      </p>
                    </div>
                    <span className="text-[8px] font-semibold text-[#123f91]">
                      Ver todos
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <PreviewOrder
                      code="OT-0241"
                      equipment="Ventilador V60"
                      date="14 Jun"
                      tone="warning"
                    />
                    <PreviewOrder
                      code="OT-0242"
                      equipment="Monitor Carescape"
                      date="16 Jun"
                      tone="info"
                    />
                    <PreviewOrder
                      code="OT-0243"
                      equipment="Bomba Infusomat"
                      date="18 Jun"
                      tone="success"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-[#dfe3e8] bg-white p-3 sm:p-4">
                  <p className="text-[10px] font-bold text-[#344054]">
                    Estado de equipos
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-[10px] border-[#dce6f5] border-r-[#123f91] border-t-[#123f91]">
                      <div className="text-center">
                        <p className="text-sm font-bold text-[#1d2939]">87%</p>
                        <p className="text-[7px] text-[#98a2b3]">Operativos</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-[8px] text-[#667085]">
                    <div className="flex items-center justify-between">
                      <span>Activos</span>
                      <strong className="text-[#344054]">13</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>En mantenimiento</span>
                      <strong className="text-[#344054]">1</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Inactivos</span>
                      <strong className="text-[#344054]">1</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-float-card absolute -bottom-5 right-2 hidden items-center gap-3 rounded-xl border border-[#d5dbe3] bg-white px-4 py-3 shadow-[0_12px_32px_rgb(16_24_40_/_0.14)] sm:flex lg:-right-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e9f5ee] text-[#1f7a4d]">
          <CheckCircle2 size={17} />
        </span>
        <div>
          <p className="text-[10px] font-bold text-[#344054]">Orden completada</p>
          <p className="mt-0.5 text-[8px] text-[#7a8494]">
            Evidencia registrada correctamente
          </p>
        </div>
      </div>
    </div>
  );
}

function PreviewMetric({
  icon: Icon,
  label,
  value,
  detail,
  className = '',
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
  className?: string;
}) {
  return (
    <div
      className={[
        'rounded-lg border border-[#dfe3e8] bg-white p-3 sm:p-4',
        className,
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-[#7a8494]">
          {label}
        </p>
        <Icon size={13} className="text-[#123f91]" />
      </div>
      <p className="mt-2 text-lg font-bold tracking-[-0.04em] text-[#1d2939] sm:text-xl">
        {value}
      </p>
      <p className="mt-1 text-[8px] text-[#7a8494]">{detail}</p>
    </div>
  );
}

function PreviewOrder({
  code,
  equipment,
  date,
  tone,
}: {
  code: string;
  equipment: string;
  date: string;
  tone: 'warning' | 'info' | 'success';
}) {
  const toneClassName = {
    warning: 'bg-[#fff4df] text-[#8a5200]',
    info: 'bg-[#e9f0fb] text-[#123f91]',
    success: 'bg-[#e9f5ee] text-[#16603c]',
  }[tone];

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-md border border-[#edf0f2] px-2.5 py-2">
      <div className="min-w-0">
        <p className="text-[8px] font-bold text-[#344054]">{code}</p>
        <p className="mt-0.5 truncate text-[8px] text-[#7a8494]">{equipment}</p>
      </div>
      <span
        className={`rounded-full px-2 py-1 text-[7px] font-bold ${toneClassName}`}
      >
        {date}
      </span>
    </div>
  );
}

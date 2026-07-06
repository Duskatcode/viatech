import { useEffect, useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  Clipboard,
  Download,
  Eraser,
  ExternalLink,
  FileText,
  Mail,
  MessageSquareText,
  Save,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DRAFT_KEY = 'biomed-demo-feedback-draft';

const profileOptions = [
  'Profesional biomédico',
  'Técnico',
  'Administrador',
  'Auditor',
  'Desarrollador',
  'Estudiante',
  'Otro',
];

const deviceOptions = ['Escritorio', 'Tablet', 'Móvil'];

const roleOptions = [
  'SUPER_ADMIN',
  'ADMIN',
  'TECHNICIAN',
  'VIEWER',
  'Varios roles',
];

const ratingItems = [
  ['landingClarity', 'Claridad de la landing'],
  ['demoStart', 'Facilidad para iniciar la demo'],
  ['navigationClarity', 'Claridad de la navegación'],
  ['rolesClarity', 'Facilidad para entender los roles'],
  ['equipmentFinding', 'Facilidad para encontrar equipos'],
  ['ordersUnderstanding', 'Facilidad para entender las órdenes'],
  ['visualQuality', 'Calidad visual'],
  ['perceivedSpeed', 'Velocidad percibida'],
  ['generalTrust', 'Confianza general en la plataforma'],
] as const;

const featureOptions = [
  'Landing',
  'Guía demo',
  'Login',
  'Dashboard global',
  'Dashboard empresarial',
  'Usuarios',
  'Empresas / sedes / áreas',
  'Equipos',
  'Hoja de vida',
  'Órdenes',
  'Checklist técnico',
  'Adjuntos',
  'Reportes',
  'Auditoría',
  'Alertas',
  'Aislamiento multiempresa',
];

type RatingKey = (typeof ratingItems)[number][0];
type Ratings = Record<RatingKey, number | null>;

interface FeedbackForm {
  testerName: string;
  profile: string;
  date: string;
  device: string;
  browser: string;
  testedRole: string;
  ratings: Ratings;
  testedFeatures: string[];
  workingFeatures: string[];
  mostUseful: string;
  confusingPart: string;
  missingFeature: string;
  visualImprovement: string;
  wouldUse: string;
  additionalComments: string;
  foundError: '' | 'yes' | 'no';
  errorRoute: string;
  errorRole: string;
  reproductionSteps: string;
  expectedResult: string;
  observedResult: string;
  severity: string;
}

type ActionStatus =
  | 'draft-restored'
  | 'draft-saved'
  | 'draft-error'
  | 'copied'
  | 'copy-error'
  | 'downloaded'
  | 'cleared'
  | null;

function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function createEmptyRatings(): Ratings {
  return Object.fromEntries(
    ratingItems.map(([key]) => [key, null]),
  ) as Ratings;
}

function createEmptyForm(): FeedbackForm {
  return {
    testerName: '',
    profile: '',
    date: getToday(),
    device: '',
    browser: '',
    testedRole: '',
    ratings: createEmptyRatings(),
    testedFeatures: [],
    workingFeatures: [],
    mostUseful: '',
    confusingPart: '',
    missingFeature: '',
    visualImprovement: '',
    wouldUse: '',
    additionalComments: '',
    foundError: '',
    errorRoute: '',
    errorRole: '',
    reproductionSteps: '',
    expectedResult: '',
    observedResult: '',
    severity: '',
  };
}

function loadDraft(): { form: FeedbackForm; restored: boolean } {
  const emptyForm = createEmptyForm();

  try {
    const storedDraft = window.localStorage.getItem(DRAFT_KEY);

    if (!storedDraft) {
      return { form: emptyForm, restored: false };
    }

    const parsed = JSON.parse(storedDraft) as Partial<FeedbackForm>;

    return {
      form: {
        ...emptyForm,
        ...parsed,
        ratings: {
          ...emptyForm.ratings,
          ...(parsed.ratings ?? {}),
        },
        testedFeatures: Array.isArray(parsed.testedFeatures)
          ? parsed.testedFeatures
          : [],
        workingFeatures: Array.isArray(parsed.workingFeatures)
          ? parsed.workingFeatures
          : [],
      },
      restored: true,
    };
  } catch {
    return { form: emptyForm, restored: false };
  }
}

function markdownList(items: string[]) {
  return items.length > 0
    ? items.map((item) => `- ${item}`).join('\n')
    : '- Sin selección';
}

function markdownValue(value: string) {
  return value.trim() || 'Sin respuesta';
}

function generateFeedbackMarkdown(form: FeedbackForm) {
  const ratings = ratingItems
    .map(
      ([key, label]) =>
        `- ${label}: ${form.ratings[key] ? `${form.ratings[key]}/5` : 'Sin valoración'}`,
    )
    .join('\n');

  const errorSection =
    form.foundError === 'yes'
      ? `## Reporte de error

- Página o ruta: ${markdownValue(form.errorRoute)}
- Cuenta o rol utilizado: ${markdownValue(form.errorRole)}
- Severidad: ${markdownValue(form.severity)}

### Pasos para reproducir

${markdownValue(form.reproductionSteps)}

### Resultado esperado

${markdownValue(form.expectedResult)}

### Resultado observado

${markdownValue(form.observedResult)}`
      : `## Reporte de error

- ¿Encontró un error?: ${form.foundError === 'no' ? 'No' : 'Sin respuesta'}`;

  return `# Feedback demo plataforma biomédica

## Información general

- Fecha: ${markdownValue(form.date)}
- Tester: ${markdownValue(form.testerName)}
- Perfil: ${markdownValue(form.profile)}
- Dispositivo: ${markdownValue(form.device)}
- Navegador: ${markdownValue(form.browser)}
- Rol probado: ${markdownValue(form.testedRole)}

## Evaluación cuantitativa

${ratings}

## Funciones probadas

${markdownList(form.testedFeatures)}

## Funciones que funcionaron correctamente

${markdownList(form.workingFeatures)}

## Comentarios

### ¿Qué fue lo más claro o útil?

${markdownValue(form.mostUseful)}

### ¿Qué parte resultó confusa?

${markdownValue(form.confusingPart)}

### ¿Qué función faltó?

${markdownValue(form.missingFeature)}

### ¿Qué mejoraría visualmente?

${markdownValue(form.visualImprovement)}

### ¿Usaría esta plataforma en una clínica o empresa?

${markdownValue(form.wouldUse)}

### Comentarios adicionales

${markdownValue(form.additionalComments)}

${errorSection}
`;
}

export function FeedbackPage() {
  const [initialDraft] = useState(loadDraft);
  const [form, setForm] = useState<FeedbackForm>(initialDraft.form);
  const [status, setStatus] = useState<ActionStatus>(
    initialDraft.restored ? 'draft-restored' : null,
  );
  const feedbackEmail = import.meta.env.VITE_FEEDBACK_EMAIL?.trim();

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      // Export remains available when local storage is blocked.
    }
  }, [form]);

  function updateField<K extends keyof FeedbackForm>(
    field: K,
    value: FeedbackForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus(null);
  }

  function updateRating(key: RatingKey, value: number) {
    setForm((current) => ({
      ...current,
      ratings: { ...current.ratings, [key]: value },
    }));
    setStatus(null);
  }

  function toggleFeature(
    field: 'testedFeatures' | 'workingFeatures',
    feature: string,
  ) {
    setForm((current) => {
      const values = current[field];
      const nextValues = values.includes(feature)
        ? values.filter((item) => item !== feature)
        : [...values, feature];

      return { ...current, [field]: nextValues };
    });
    setStatus(null);
  }

  async function copyFeedback() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }

      await navigator.clipboard.writeText(generateFeedbackMarkdown(form));
      setStatus('copied');
    } catch {
      setStatus('copy-error');
    }
  }

  function downloadFeedback() {
    const markdown = generateFeedbackMarkdown(form);
    const blob = new Blob([markdown], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `feedback-biomed-${form.date || getToday()}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setStatus('downloaded');
  }

  function clearForm() {
    if (
      !window.confirm(
        '¿Quieres borrar el formulario y el borrador guardado en este navegador?',
      )
    ) {
      return;
    }

    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Reset the in-memory form even if storage is unavailable.
    }

    setForm(createEmptyForm());
    setStatus('cleared');
  }

  function clearDraft() {
    if (!window.confirm('¿Quieres borrar únicamente el borrador local?')) {
      return;
    }

    try {
      window.localStorage.removeItem(DRAFT_KEY);
      setStatus('cleared');
    } catch {
      setStatus('draft-error');
    }
  }

  function markDraftSaved() {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      setStatus('draft-saved');
    } catch {
      setStatus('draft-error');
    }
  }

  const mailtoHref = feedbackEmail
    ? `mailto:${encodeURIComponent(feedbackEmail)}?subject=${encodeURIComponent(
        'Feedback demo plataforma biomédica',
      )}&body=${encodeURIComponent(generateFeedbackMarkdown(form).slice(0, 6000))}`
    : null;

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fa] text-[#111827]">
      <a
        href="#feedback-main"
        className="landing-skip-link fixed left-4 top-4 z-[100] rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white"
      >
        Saltar al formulario
      </a>

      <header className="sticky top-0 z-50 border-b border-[#dfe3e8] bg-[#f7f8fa]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:min-h-[72px] lg:px-10">
          <Link
            to="/"
            className="landing-focus inline-flex items-center gap-2.5 rounded-lg"
            aria-label="Vitatech, volver a la landing"
          >
            <BrandMark />
            <span className="hidden text-[15px] font-bold tracking-[-0.02em] sm:inline">
              Vitatech
            </span>
          </Link>

          <nav className="flex items-center gap-2" aria-label="Navegación de feedback">
            <Link
              to="/demo"
              className="landing-secondary-button landing-focus inline-flex h-10 items-center gap-2 rounded-lg border border-[#cfd5dd] bg-white px-3 text-xs font-semibold text-[#475467] sm:px-4 sm:text-sm"
            >
              <ArrowLeft size={15} />
              Guía demo
            </Link>
            <Link
              to="/login"
              className="landing-button landing-focus inline-flex h-10 items-center gap-2 rounded-lg bg-[#123f91] px-3 text-xs font-semibold text-white sm:px-4 sm:text-sm"
            >
              Ir al login
              <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
      </header>

      <main id="feedback-main">
        <section className="border-b border-[#dfe3e8] bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.55fr] lg:items-end lg:px-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#cbd4e1] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#344054]">
                <MessageSquareText size={14} className="text-[#123f91]" />
                Evaluación pública del MVP
              </div>
              <h1 className="mt-6 text-[2.65rem] font-bold leading-[1.02] tracking-[-0.052em] text-[#101828] sm:text-[3.5rem] lg:text-[4rem]">
                Cuéntanos cómo fue tu experiencia
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[#596273] sm:text-lg sm:leading-8">
                Completa esta evaluación después de probar la plataforma. Tus
                comentarios ayudarán a mejorar claridad, usabilidad y
                funcionamiento.
              </p>
            </div>

            <aside className="rounded-2xl border border-[#d8dde5] bg-[#f7f8fa] p-5">
              <div className="flex items-start gap-3">
                <ShieldAlert
                  size={20}
                  className="mt-0.5 shrink-0 text-[#805100]"
                />
                <div>
                  <p className="text-sm font-bold text-[#344054]">
                    No incluyas información sensible
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#667085]">
                    No pegues contraseñas, tokens, datos reales de pacientes ni
                    información clínica identificable.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <form
          className="mx-auto max-w-5xl space-y-6 px-5 py-12 sm:px-8 sm:py-16 lg:px-10"
          onSubmit={(event) => event.preventDefault()}
        >
          <FormSection
            eyebrow="01"
            title="Información general"
            description="Todos los campos personales son opcionales."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="tester-name"
                label="Nombre del tester"
                value={form.testerName}
                onChange={(value) => updateField('testerName', value)}
                placeholder="Opcional"
                maxLength={120}
              />
              <SelectField
                id="tester-profile"
                label="Perfil"
                value={form.profile}
                onChange={(value) => updateField('profile', value)}
                options={profileOptions}
              />
              <TextField
                id="feedback-date"
                label="Fecha"
                value={form.date}
                onChange={(value) => updateField('date', value)}
                type="date"
              />
              <SelectField
                id="feedback-device"
                label="Dispositivo"
                value={form.device}
                onChange={(value) => updateField('device', value)}
                options={deviceOptions}
              />
              <TextField
                id="feedback-browser"
                label="Navegador"
                value={form.browser}
                onChange={(value) => updateField('browser', value)}
                placeholder="Ej. Chrome, Safari, Firefox"
                maxLength={120}
              />
              <SelectField
                id="tested-role"
                label="Rol probado"
                value={form.testedRole}
                onChange={(value) => updateField('testedRole', value)}
                options={roleOptions}
              />
            </div>
          </FormSection>

          <FormSection
            eyebrow="02"
            title="Evaluación cuantitativa"
            description="Valora cada aspecto de 1 (muy difícil o deficiente) a 5 (muy claro o excelente)."
          >
            <div className="divide-y divide-[#e2e6eb]">
              {ratingItems.map(([key, label]) => (
                <RatingField
                  key={key}
                  ratingKey={key}
                  label={label}
                  value={form.ratings[key]}
                  onChange={(value) => updateRating(key, value)}
                />
              ))}
            </div>
          </FormSection>

          <FormSection
            eyebrow="03"
            title="Evaluación funcional"
            description="Marca lo que alcanzaste a revisar y lo que respondió correctamente."
          >
            <CheckboxGroup
              legend="Funciones probadas"
              values={form.testedFeatures}
              onToggle={(feature) => toggleFeature('testedFeatures', feature)}
            />
            <div className="mt-8 border-t border-[#e2e6eb] pt-8">
              <CheckboxGroup
                legend="Funciones que funcionaron correctamente"
                values={form.workingFeatures}
                onToggle={(feature) => toggleFeature('workingFeatures', feature)}
              />
            </div>
          </FormSection>

          <FormSection
            eyebrow="04"
            title="Comentarios abiertos"
            description="Describe observaciones concretas. No incluyas datos clínicos reales."
          >
            <div className="grid gap-5">
              <TextareaField
                id="most-useful"
                label="¿Qué fue lo más claro o útil?"
                value={form.mostUseful}
                onChange={(value) => updateField('mostUseful', value)}
              />
              <TextareaField
                id="confusing-part"
                label="¿Qué parte resultó confusa?"
                value={form.confusingPart}
                onChange={(value) => updateField('confusingPart', value)}
              />
              <TextareaField
                id="missing-feature"
                label="¿Qué función faltó?"
                value={form.missingFeature}
                onChange={(value) => updateField('missingFeature', value)}
              />
              <TextareaField
                id="visual-improvement"
                label="¿Qué mejorarías visualmente?"
                value={form.visualImprovement}
                onChange={(value) => updateField('visualImprovement', value)}
              />
              <TextareaField
                id="would-use"
                label="¿Usarías esta plataforma en una clínica o empresa?"
                value={form.wouldUse}
                onChange={(value) => updateField('wouldUse', value)}
              />
              <TextareaField
                id="additional-comments"
                label="Comentarios adicionales"
                value={form.additionalComments}
                onChange={(value) => updateField('additionalComments', value)}
              />
            </div>
          </FormSection>

          <FormSection
            eyebrow="05"
            title="Reporte de errores"
            description="Esta sección es opcional y solo debe contener datos ficticios o técnicos."
          >
            <fieldset>
              <legend className="text-sm font-bold text-[#344054]">
                ¿Encontraste un error?
              </legend>
              <div className="mt-3 flex flex-wrap gap-3">
                <RadioChoice
                  name="found-error"
                  label="Sí"
                  checked={form.foundError === 'yes'}
                  onChange={() => updateField('foundError', 'yes')}
                />
                <RadioChoice
                  name="found-error"
                  label="No"
                  checked={form.foundError === 'no'}
                  onChange={() => updateField('foundError', 'no')}
                />
              </div>
            </fieldset>

            {form.foundError === 'yes' ? (
              <div className="mt-7 grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    id="error-route"
                    label="Página o ruta donde ocurrió"
                    value={form.errorRoute}
                    onChange={(value) => updateField('errorRoute', value)}
                    placeholder="Ej. /maintenance-orders"
                    maxLength={180}
                  />
                  <TextField
                    id="error-role"
                    label="Cuenta o rol utilizado"
                    value={form.errorRole}
                    onChange={(value) => updateField('errorRole', value)}
                    placeholder="No incluyas la contraseña"
                    maxLength={180}
                  />
                  <SelectField
                    id="error-severity"
                    label="Severidad"
                    value={form.severity}
                    onChange={(value) => updateField('severity', value)}
                    options={['Baja', 'Media', 'Alta', 'Bloqueante']}
                  />
                </div>
                <TextareaField
                  id="reproduction-steps"
                  label="Pasos para reproducir"
                  value={form.reproductionSteps}
                  onChange={(value) => updateField('reproductionSteps', value)}
                  maxLength={1600}
                />
                <TextareaField
                  id="expected-result"
                  label="Resultado esperado"
                  value={form.expectedResult}
                  onChange={(value) => updateField('expectedResult', value)}
                />
                <TextareaField
                  id="observed-result"
                  label="Resultado observado"
                  value={form.observedResult}
                  onChange={(value) => updateField('observedResult', value)}
                />
              </div>
            ) : null}
          </FormSection>

          <section className="rounded-2xl border border-[#cbd7ec] bg-[#eef4fc] p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <FileText size={21} className="mt-0.5 shrink-0 text-[#123f91]" />
              <div>
                <h2 className="text-lg font-bold text-[#101828]">
                  Exportar feedback
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#596273]">
                  Nada se envía automáticamente. Tú decides si copiar, descargar
                  o abrir el borrador en tu aplicación de correo.
                </p>
              </div>
            </div>

            <p
              aria-live="polite"
              className="mt-5 min-h-5 text-sm font-semibold text-[#344054]"
            >
              {statusMessage(status)}
            </p>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={copyFeedback}
                className="landing-button landing-focus inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#123f91] px-4 text-sm font-semibold text-white"
              >
                <Clipboard size={16} />
                Copiar feedback
              </button>
              <button
                type="button"
                onClick={downloadFeedback}
                className="landing-secondary-button landing-focus inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#c3ccda] bg-white px-4 text-sm font-semibold text-[#344054]"
              >
                <Download size={16} />
                Descargar Markdown
              </button>
              {mailtoHref ? (
                <a
                  href={mailtoHref}
                  className="landing-secondary-button landing-focus inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#c3ccda] bg-white px-4 text-sm font-semibold text-[#344054]"
                >
                  <Mail size={16} />
                  Preparar correo
                  <ExternalLink size={14} />
                </a>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-[#cbd7ec] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={markDraftSaved}
                  className="landing-secondary-button landing-focus inline-flex h-9 items-center gap-2 rounded-lg border border-[#c3ccda] bg-white px-3 text-xs font-semibold text-[#475467]"
                >
                  <Save size={14} />
                  Guardar borrador ahora
                </button>
                <button
                  type="button"
                  onClick={clearDraft}
                  className="landing-secondary-button landing-focus inline-flex h-9 items-center gap-2 rounded-lg border border-[#c3ccda] bg-white px-3 text-xs font-semibold text-[#475467]"
                >
                  <Eraser size={14} />
                  Borrar borrador
                </button>
              </div>
              <button
                type="button"
                onClick={clearForm}
                className="landing-focus inline-flex h-9 items-center gap-2 rounded-lg border border-[#e0b9b2] bg-white px-3 text-xs font-semibold text-[#9c3c2b]"
              >
                <Eraser size={14} />
                Limpiar formulario
              </button>
            </div>
          </section>
        </form>
      </main>

      <footer className="border-t border-[#dfe3e8] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-[#667085] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <Link
            to="/"
            className="landing-focus inline-flex items-center gap-2.5 rounded-lg font-semibold text-[#344054]"
          >
            <BrandMark compact />
            Vitatech
          </Link>
          <div className="flex flex-wrap gap-4">
            <Link className="landing-nav-link landing-focus rounded" to="/demo">
              Guía demo
            </Link>
            <Link className="landing-nav-link landing-focus rounded" to="/login">
              Login
            </Link>
            <Link className="landing-nav-link landing-focus rounded" to="/">
              Landing
            </Link>
          </div>
          <p>El feedback permanece bajo tu control.</p>
        </div>
      </footer>
    </div>
  );
}

function FormSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#d8dde5] bg-white p-5 shadow-[0_1px_2px_rgb(16_24_40_/_0.03)] sm:p-7">
      <div className="border-b border-[#e2e6eb] pb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#123f91]">
          Sección {eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-bold tracking-[-0.025em] text-[#101828]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#667085]">{description}</p>
      </div>
      <div className="pt-6">{children}</div>
    </section>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-semibold text-[#344054]">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="feedback-input mt-2"
      />
    </label>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-semibold text-[#344054]">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="feedback-input mt-2"
      >
        <option value="">Seleccionar</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextareaField({
  id,
  label,
  value,
  onChange,
  maxLength = 1200,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-[#344054]">
        {label}
        <span className="text-xs font-normal text-[#98a2b3]">
          {value.length}/{maxLength}
        </span>
      </span>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        rows={4}
        className="feedback-input mt-2 min-h-28 resize-y"
      />
    </label>
  );
}

function RatingField({
  ratingKey,
  label,
  value,
  onChange,
}: {
  ratingKey: RatingKey;
  label: string;
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <fieldset className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
      <legend className="text-sm font-semibold text-[#344054]">{label}</legend>
      <div className="flex gap-2" aria-label={`${label}, valoración de 1 a 5`}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <label
            key={rating}
            className="feedback-rating-option flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#cfd5dd] bg-white text-sm font-bold text-[#596273]"
          >
            <input
              type="radio"
              name={`rating-${ratingKey}`}
              value={rating}
              checked={value === rating}
              onChange={() => onChange(rating)}
              className="sr-only"
            />
            <span>{rating}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CheckboxGroup({
  legend,
  values,
  onToggle,
}: {
  legend: string;
  values: string[];
  onToggle: (feature: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-bold text-[#344054]">{legend}</legend>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featureOptions.map((feature) => {
          const checked = values.includes(feature);

          return (
            <label
              key={feature}
              className={[
                'landing-check-item flex cursor-pointer items-center gap-3 rounded-xl border p-3.5',
                checked
                  ? 'border-[#b9d8c6] bg-[#f4faf6]'
                  : 'border-[#d8dde5] bg-white',
              ].join(' ')}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(feature)}
                className="sr-only"
              />
              <span
                className={[
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
                  checked
                    ? 'border-[#1f7a4d] bg-[#1f7a4d] text-white'
                    : 'border-[#aeb7c4] text-transparent',
                ].join(' ')}
                aria-hidden="true"
              >
                <Check size={13} strokeWidth={3} />
              </span>
              <span className="text-sm font-semibold text-[#475467]">
                {feature}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function RadioChoice({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="feedback-radio-choice flex cursor-pointer items-center gap-2 rounded-lg border border-[#cfd5dd] bg-white px-4 py-2.5 text-sm font-semibold text-[#475467]">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={[
          'flex h-4 w-4 items-center justify-center rounded-full border',
          checked ? 'border-[#123f91]' : 'border-[#aeb7c4]',
        ].join(' ')}
        aria-hidden="true"
      >
        <span
          className={[
            'h-2 w-2 rounded-full',
            checked ? 'bg-[#123f91]' : 'bg-transparent',
          ].join(' ')}
        />
      </span>
      {label}
    </label>
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

function statusMessage(status: ActionStatus) {
  const messages: Record<Exclude<ActionStatus, null>, string> = {
    'draft-restored': 'Borrador local restaurado.',
    'draft-saved': 'Borrador guardado en este navegador.',
    'draft-error': 'No se pudo acceder al almacenamiento local.',
    copied: 'Feedback copiado.',
    'copy-error': 'No se pudo copiar. Descarga el archivo Markdown.',
    downloaded: 'Archivo Markdown preparado.',
    cleared: 'Borrador eliminado.',
  };

  return status ? messages[status] : '';
}

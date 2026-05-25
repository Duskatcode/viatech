import { X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import type {
  Company,
  CreateSitePayload,
  Site,
  UpdateSitePayload,
} from '../types/domain';

interface SiteFormModalProps {
  site?: Site | null;
  companies: Company[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSitePayload | UpdateSitePayload) => Promise<void>;
}

export function SiteFormModal({
  site,
  companies,
  isSubmitting,
  onClose,
  onSubmit,
}: SiteFormModalProps) {
  const [companyId, setCompanyId] = useState(
    site?.companyId ?? companies[0]?.id ?? '',
  );
  const [name, setName] = useState(site?.name ?? '');
  const [city, setCity] = useState(site?.city ?? '');
  const [address, setAddress] = useState(site?.address ?? '');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      companyId: companyId || undefined,
      name,
      city: city || undefined,
      address: address || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 px-4 backdrop-blur">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {site ? 'Editar sede' : 'Crear sede'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Las sedes agrupan áreas y equipos biomédicos.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block md:col-span-2">
            <span className="text-sm text-slate-300">Empresa</span>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              value={companyId}
              onChange={(event) => setCompanyId(event.target.value)}
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>

          <Input label="Nombre" value={name} onChange={setName} required />
          <Input label="Ciudad" value={city} onChange={setCity} />
          <Input
            label="Dirección"
            value={address}
            onChange={setAddress}
            className="md:col-span-2"
          />

          <div className="flex justify-end gap-3 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

interface InputProps {
  label: string;
  value: string;
  required?: boolean;
  className?: string;
  onChange: (value: string) => void;
}

function Input({
  label,
  value,
  required,
  className = '',
  onChange,
}: InputProps) {
  return (
    <label className={['block', className].join(' ')}>
      <span className="text-sm text-slate-300">{label}</span>
      <input
        className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

import { X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import type {
  Area,
  CreateAreaPayload,
  Site,
  UpdateAreaPayload,
} from '../types/domain';

interface AreaFormModalProps {
  area?: Area | null;
  sites: Site[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAreaPayload | UpdateAreaPayload) => Promise<void>;
}

export function AreaFormModal({
  area,
  sites,
  isSubmitting,
  onClose,
  onSubmit,
}: AreaFormModalProps) {
  const [siteId, setSiteId] = useState(area?.siteId ?? sites[0]?.id ?? '');
  const [name, setName] = useState(area?.name ?? '');
  const [floor, setFloor] = useState(area?.floor ?? '');
  const [description, setDescription] = useState(area?.description ?? '');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      siteId,
      name,
      floor: floor || undefined,
      description: description || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 px-4 backdrop-blur">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {area ? 'Editar área' : 'Crear área'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Las áreas permiten ubicar equipos dentro de una sede.
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
            <span className="text-sm text-slate-300">Sede</span>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              value={siteId}
              onChange={(event) => setSiteId(event.target.value)}
              required
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </label>

          <Input label="Nombre" value={name} onChange={setName} required />
          <Input label="Piso" value={floor} onChange={setFloor} />

          <label className="block md:col-span-2">
            <span className="text-sm text-slate-300">Descripción</span>
            <textarea
              className="mt-2 min-h-24 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

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
  onChange: (value: string) => void;
}

function Input({ label, value, required, onChange }: InputProps) {
  return (
    <label className="block">
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

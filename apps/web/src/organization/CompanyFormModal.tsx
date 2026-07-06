import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import type { Company, CreateCompanyPayload, UpdateCompanyPayload } from '../types/domain';

interface CompanyFormModalProps {
  company?: Company | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCompanyPayload | UpdateCompanyPayload) => Promise<void>;
}

export function CompanyFormModal({
  company,
  isSubmitting,
  onClose,
  onSubmit,
}: CompanyFormModalProps) {
  const isEdit = !!company;
  const [name, setName] = useState('');
  const [nit, setNit] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (company) {
      setName(company.name ?? '');
      setNit(company.nit ?? '');
      setPhone(company.phone ?? '');
      setEmail(company.email ?? '');
      setAddress(company.address ?? '');
    } else {
      setName('');
      setNit('');
      setPhone('');
      setEmail('');
      setAddress('');
    }
  }, [company]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      name,
      nit: nit || undefined,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
    };

    await onSubmit(payload);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 px-4 backdrop-blur">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {isEdit ? 'Editar empresa' : 'Crear empresa'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {isEdit
                ? 'Actualiza la información base de la institución.'
                : 'Registra una nueva empresa en el sistema.'}
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
          <Input label="Nombre" value={name} onChange={setName} required />
          <Input label="NIT" value={nit} onChange={setNit} />
          <Input label="Teléfono" value={phone} onChange={setPhone} />
          <Input label="Email" type="email" value={email} onChange={setEmail} />
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
              {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear empresa'}
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
  type?: string;
  required?: boolean;
  className?: string;
  onChange: (value: string) => void;
}

function Input({
  label,
  value,
  type = 'text',
  required,
  className = '',
  onChange,
}: InputProps) {
  return (
    <label className={['block', className].join(' ')}>
      <span className="text-sm text-slate-300">{label}</span>
      <input
        className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
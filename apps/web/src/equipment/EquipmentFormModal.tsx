import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import type {
  Area,
  CreateEquipmentPayload,
  Equipment,
  EquipmentStatus,
  Site,
  UpdateEquipmentPayload,
} from '../types/domain';

interface EquipmentFormModalProps {
  equipment?: Equipment | null;
  sites: Site[];
  areas: Area[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateEquipmentPayload | UpdateEquipmentPayload,
  ) => Promise<void>;
}

const statusOptions: EquipmentStatus[] = [
  'ACTIVE',
  'IN_MAINTENANCE',
  'OUT_OF_SERVICE',
];

export function EquipmentFormModal({
  equipment,
  sites,
  areas,
  isSubmitting,
  onClose,
  onSubmit,
}: EquipmentFormModalProps) {
  const [siteId, setSiteId] = useState(equipment?.siteId ?? sites[0]?.id ?? '');
  const [areaId, setAreaId] = useState(equipment?.areaId ?? areas[0]?.id ?? '');
  const [internalCode, setInternalCode] = useState(equipment?.internalCode ?? '');
  const [name, setName] = useState(equipment?.name ?? '');
  const [brand, setBrand] = useState(equipment?.brand ?? '');
  const [model, setModel] = useState(equipment?.model ?? '');
  const [serialNumber, setSerialNumber] = useState(equipment?.serialNumber ?? '');
  const [equipmentType, setEquipmentType] = useState(equipment?.equipmentType ?? '');
  const [riskLevel, setRiskLevel] = useState(equipment?.riskLevel ?? '');
  const [status, setStatus] = useState<EquipmentStatus>(
    equipment?.status ?? 'ACTIVE',
  );
  const [purchaseDate, setPurchaseDate] = useState(
    equipment?.purchaseDate?.slice(0, 10) ?? '',
  );
  const [installationDate, setInstallationDate] = useState(
    equipment?.installationDate?.slice(0, 10) ?? '',
  );
  const [warrantyUntil, setWarrantyUntil] = useState(
    equipment?.warrantyUntil?.slice(0, 10) ?? '',
  );
  const [notes, setNotes] = useState(equipment?.notes ?? '');

  const filteredAreas = useMemo(() => {
    const relatedAreas = areas.filter((area) => area.siteId === siteId);
    return relatedAreas.length > 0 ? relatedAreas : areas;
  }, [areas, siteId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      siteId,
      areaId,
      internalCode,
      name,
      brand: brand || undefined,
      model: model || undefined,
      serialNumber: serialNumber || undefined,
      equipmentType: equipmentType || undefined,
      riskLevel: riskLevel || undefined,
      status,
      purchaseDate: purchaseDate || undefined,
      installationDate: installationDate || undefined,
      warrantyUntil: warrantyUntil || undefined,
      notes: notes || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 px-4 backdrop-blur">
      <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {equipment ? 'Editar equipo' : 'Crear equipo'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Registra la información base para la hoja de vida biomédica.
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
          <label className="block">
            <span className="text-sm text-slate-300">Sede</span>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              value={siteId}
              onChange={(event) => {
                const nextSiteId = event.target.value;
                setSiteId(nextSiteId);

                const nextArea = areas.find((area) => area.siteId === nextSiteId);
                if (nextArea) {
                  setAreaId(nextArea.id);
                }
              }}
              required
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Área</span>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              value={areaId}
              onChange={(event) => setAreaId(event.target.value)}
              required
            >
              {filteredAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </label>

          <Input label="Código interno" value={internalCode} onChange={setInternalCode} required />
          <Input label="Nombre" value={name} onChange={setName} required />
          <Input label="Marca" value={brand} onChange={setBrand} />
          <Input label="Modelo" value={model} onChange={setModel} />
          <Input label="Serial" value={serialNumber} onChange={setSerialNumber} />
          <Input label="Tipo de equipo" value={equipmentType} onChange={setEquipmentType} />
          <Input label="Nivel de riesgo" value={riskLevel} onChange={setRiskLevel} />

          <label className="block">
            <span className="text-sm text-slate-300">Estado</span>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              value={status}
              onChange={(event) => setStatus(event.target.value as EquipmentStatus)}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <Input label="Fecha de compra" type="date" value={purchaseDate} onChange={setPurchaseDate} />
          <Input label="Fecha de instalación" type="date" value={installationDate} onChange={setInstallationDate} />
          <Input label="Garantía hasta" type="date" value={warrantyUntil} onChange={setWarrantyUntil} />

          <label className="block md:col-span-2">
            <span className="text-sm text-slate-300">Notas</span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
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
  type?: string;
  required?: boolean;
  onChange: (value: string) => void;
}

function Input({ label, value, type = 'text', required, onChange }: InputProps) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">{label}</span>
      <input
        className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
        value={value}
        type={type}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

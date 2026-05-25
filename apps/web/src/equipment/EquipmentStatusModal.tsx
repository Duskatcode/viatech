import { useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';

import type { Equipment, EquipmentStatus } from '../types/domain';

interface EquipmentStatusModalProps {
  equipment: Equipment;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: { status: EquipmentStatus; notes?: string }) => Promise<void>;
}

const statusOptions: EquipmentStatus[] = [
  'ACTIVE',
  'IN_MAINTENANCE',
  'OUT_OF_SERVICE',
  'RETIRED',
];

export function EquipmentStatusModal({
  equipment,
  isSubmitting,
  onClose,
  onSubmit,
}: EquipmentStatusModalProps) {
  const [status, setStatus] = useState<EquipmentStatus>(equipment.status);
  const [notes, setNotes] = useState(equipment.notes ?? '');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      status,
      notes: notes || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 px-4 backdrop-blur">
      <section className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Cambiar estado</h2>
            <p className="mt-1 text-sm text-slate-400">
              {equipment.internalCode} — {equipment.name}
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

        <form className="space-y-4" onSubmit={handleSubmit}>
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

          <label className="block">
            <span className="text-sm text-slate-300">Notas</span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>

          <div className="flex justify-end gap-3">
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
              {isSubmitting ? 'Guardando...' : 'Actualizar estado'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

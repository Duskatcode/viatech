import { X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import type {
  CompleteMaintenanceOrderPayload,
  EquipmentStatus,
  MaintenanceOrder,
} from '../types/domain';

interface CompleteMaintenanceOrderModalProps {
  order: MaintenanceOrder;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CompleteMaintenanceOrderPayload) => Promise<void>;
}

export function CompleteMaintenanceOrderModal({
  order,
  isSubmitting,
  onClose,
  onSubmit,
}: CompleteMaintenanceOrderModalProps) {
  const [diagnosis, setDiagnosis] = useState('');
  const [actionsPerformed, setActionsPerformed] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [finalEquipmentStatus, setFinalEquipmentStatus] =
    useState<EquipmentStatus>('ACTIVE');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      diagnosis: diagnosis || undefined,
      actionsPerformed: actionsPerformed || undefined,
      recommendations: recommendations || undefined,
      finalEquipmentStatus,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 px-4 backdrop-blur">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Completar orden</h2>
            <p className="mt-1 text-sm text-slate-400">
              {order.code} — {order.equipment?.name ?? 'Equipo'}
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
          <Textarea label="Diagnóstico" value={diagnosis} onChange={setDiagnosis} />
          <Textarea
            label="Acciones realizadas"
            value={actionsPerformed}
            onChange={setActionsPerformed}
          />
          <Textarea
            label="Recomendaciones"
            value={recommendations}
            onChange={setRecommendations}
          />

          <label className="block">
            <span className="text-sm text-slate-300">Estado final del equipo</span>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              value={finalEquipmentStatus}
              onChange={(event) =>
                setFinalEquipmentStatus(event.target.value as EquipmentStatus)
              }
            >
              <option value="ACTIVE">Activo</option>
              <option value="OUT_OF_SERVICE">Fuera de servicio</option>
              <option value="IN_MAINTENANCE">En mantenimiento</option>
            </select>
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
              {isSubmitting ? 'Completando...' : 'Completar orden'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">{label}</span>
      <textarea
        className="mt-2 min-h-24 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

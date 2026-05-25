import { X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import type {
  CreateMaintenanceOrderPayload,
  Equipment,
  MaintenanceType,
  UserSummary,
} from '../types/domain';

interface MaintenanceOrderFormModalProps {
  equipment: Equipment[];
  users: UserSummary[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateMaintenanceOrderPayload) => Promise<void>;
}

export function MaintenanceOrderFormModal({
  equipment,
  users,
  isSubmitting,
  onClose,
  onSubmit,
}: MaintenanceOrderFormModalProps) {
  const [equipmentId, setEquipmentId] = useState(equipment[0]?.id ?? '');
  const [type, setType] = useState<MaintenanceType>('PREVENTIVE');
  const [assignedToId, setAssignedToId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [description, setDescription] = useState('');
  const [taskText, setTaskText] = useState(
    'Verificar estado físico\nProbar funcionamiento',
  );

  const assignableUsers = users.filter(
    (user) => user.role === 'ADMIN' || user.role === 'TECHNICIAN',
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const tasks = taskText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((title) => ({ title }));

    await onSubmit({
      equipmentId,
      type,
      assignedToId: assignedToId || undefined,
      scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
      description: description || undefined,
      tasks,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 px-4 backdrop-blur">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Crear orden</h2>
            <p className="mt-1 text-sm text-slate-400">
              Genera una orden preventiva o correctiva para un equipo.
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
            <span className="text-sm text-slate-300">Equipo</span>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              value={equipmentId}
              onChange={(event) => setEquipmentId(event.target.value)}
              required
            >
              {equipment.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.internalCode} — {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Tipo</span>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              value={type}
              onChange={(event) => setType(event.target.value as MaintenanceType)}
            >
              <option value="PREVENTIVE">Preventivo</option>
              <option value="CORRECTIVE">Correctivo</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Técnico asignado</span>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              value={assignedToId}
              onChange={(event) => setAssignedToId(event.target.value)}
            >
              <option value="">Sin asignar</option>
              {assignableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} — {user.role}
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-slate-300">Fecha programada</span>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              type="datetime-local"
              value={scheduledDate}
              onChange={(event) => setScheduledDate(event.target.value)}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-slate-300">Descripción</span>
            <textarea
              className="mt-2 min-h-24 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-slate-300">
              Checklist inicial, una tarea por línea
            </span>
            <textarea
              className="mt-2 min-h-32 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              value={taskText}
              onChange={(event) => setTaskText(event.target.value)}
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
              disabled={isSubmitting || equipment.length === 0}
              className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {isSubmitting ? 'Creando...' : 'Crear orden'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

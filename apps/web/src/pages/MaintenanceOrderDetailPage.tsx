import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckSquare, ClipboardList, Plus } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { AttachmentsPanel } from '../attachments/AttachmentsPanel';
import { MaintenanceOrderPdfButton } from '../maintenance-orders/MaintenanceOrderPdfButton';
import { MaintenanceStatusBadge } from '../maintenance-orders/MaintenanceStatusBadge';
import { maintenanceOrdersService } from '../services/maintenance-orders.service';

export function MaintenanceOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [taskTitle, setTaskTitle] = useState('');

  const query = useQuery({
    queryKey: ['maintenance-order', id],
    queryFn: () => maintenanceOrdersService.findOne(id ?? ''),
    enabled: Boolean(id),
  });

  const addTaskMutation = useMutation({
    mutationFn: (title: string) =>
      maintenanceOrdersService.addTask(id ?? '', { title }),
    onSuccess: async () => {
      setTaskTitle('');
      await queryClient.invalidateQueries({ queryKey: ['maintenance-order', id] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      isCompleted,
    }: {
      taskId: string;
      isCompleted: boolean;
    }) =>
      maintenanceOrdersService.updateTask(id ?? '', taskId, {
        isCompleted,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['maintenance-order', id] });
    },
  });

  const order = query.data;

  if (query.isLoading) {
    return <p className="text-slate-400">Cargando orden...</p>;
  }

  if (!order) {
    return <p className="text-slate-400">Orden no encontrada.</p>;
  }

  const tasks = order.tasks ?? [];
  const canEditTasks = order.status !== 'CANCELLED';

  return (
    <section className="space-y-6">
      <Link
        to="/maintenance-orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
      >
        <ArrowLeft size={16} />
        Volver a mantenimientos
      </Link>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="mb-4 inline-flex rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
              <ClipboardList size={28} />
            </div>

            <p className="text-sm text-slate-400">{order.type}</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">{order.code}</h1>

            <div className="mt-4">
              <MaintenanceStatusBadge status={order.status} />
            </div>
          </div>

          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2 lg:min-w-[420px]">
            <Info label="Equipo" value={order.equipment?.name ?? '-'} />
            <Info label="Código equipo" value={order.equipment?.internalCode ?? '-'} />
            <Info label="Técnico" value={order.assignedTo?.name ?? 'Sin asignar'} />
            <Info label="Creada por" value={order.createdBy?.name ?? '-'} />
            <Info
              label="Inicio"
              value={order.startedAt ? new Date(order.startedAt).toLocaleString() : '-'}
            />
            <Info
              label="Finalización"
              value={
                order.completedAt
                  ? new Date(order.completedAt).toLocaleString()
                  : '-'
              }
            />
          </div>
        </div>

        {order.description ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-medium text-slate-300">Descripción</p>
            <p className="mt-2 text-sm text-slate-400">{order.description}</p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoCard label="Diagnóstico" value={order.diagnosis ?? 'Pendiente'} />
        <InfoCard
          label="Acciones realizadas"
          value={order.actionsPerformed ?? 'Pendiente'}
        />
        <InfoCard
          label="Recomendaciones"
          value={order.recommendations ?? 'Pendiente'}
        />
      </div>

      <div className="flex justify-end">
        <MaintenanceOrderPdfButton orderId={order.id} />
      </div>

      <AttachmentsPanel
        ownerType="maintenance-order"
        ownerId={order.id}
        title="Adjuntos de la orden"
        description="Sube evidencias, fotos, certificados o documentos del mantenimiento."
      />

      <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-lg font-semibold text-white">Checklist</h2>
            <p className="mt-1 text-sm text-slate-400">
              Tareas técnicas asociadas a esta orden.
            </p>
          </div>

          {canEditTasks ? (
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();

                if (!taskTitle.trim()) return;

                void addTaskMutation.mutateAsync(taskTitle.trim());
              }}
            >
              <input
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                placeholder="Nueva tarea"
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
              />

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                <Plus size={16} />
                Agregar
              </button>
            </form>
          ) : null}
        </div>

        <div className="mt-5 space-y-3">
          {tasks.map((task) => (
            <label
              key={task.id}
              className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4"
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={task.isCompleted}
                disabled={!canEditTasks || updateTaskMutation.isPending}
                onChange={(event) =>
                  void updateTaskMutation.mutateAsync({
                    taskId: task.id,
                    isCompleted: event.target.checked,
                  })
                }
              />

              <div>
                <p className="font-medium text-white">{task.title}</p>
                {task.description ? (
                  <p className="mt-1 text-sm text-slate-400">{task.description}</p>
                ) : null}
                {task.completedAt ? (
                  <p className="mt-2 text-xs text-emerald-300">
                    Completada: {new Date(task.completedAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
            </label>
          ))}

          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center text-slate-500">
              <CheckSquare className="mx-auto mb-2" size={24} />
              Esta orden no tiene tareas.
            </div>
          ) : null}
        </div>
      </article>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-white">{value}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-sm leading-6 text-white">{value}</p>
    </div>
  );
}

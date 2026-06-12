import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckSquare, ClipboardList, Plus } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { AttachmentsPanel } from '../attachments/AttachmentsPanel';
import { useAuth } from '../auth/useAuth';
import { MaintenanceOrderPdfButton } from '../maintenance-orders/MaintenanceOrderPdfButton';
import { MaintenanceStatusBadge } from '../maintenance-orders/MaintenanceStatusBadge';
import { maintenanceOrdersService } from '../services/maintenance-orders.service';
import { ActionButton } from '../ui/ActionButton';
import { SectionCard } from '../ui/SectionCard';

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString();
}

export function MaintenanceOrderDetailPage() {
  const { user } = useAuth();
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
      await queryClient.invalidateQueries({
        queryKey: ['maintenance-order', id],
      });
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
      await queryClient.invalidateQueries({
        queryKey: ['maintenance-order', id],
      });
    },
  });

  const order = query.data;

  if (query.isLoading) {
    return (
      <p className="text-sm text-[var(--stitch-on-surface-variant)]">
        Cargando orden...
      </p>
    );
  }

  if (!order) {
    return (
      <p className="text-sm text-[var(--stitch-on-surface-variant)]">
        Orden no encontrada.
      </p>
    );
  }

  const tasks = order.tasks ?? [];
  const canEditTasks =
    order.status !== 'CANCELLED' &&
    (user?.role === 'SUPER_ADMIN' ||
      user?.role === 'ADMIN' ||
      user?.role === 'TECHNICIAN');

  return (
    <section className="space-y-6">
      <Link
        to="/maintenance-orders"
        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--stitch-primary)] transition hover:text-[var(--stitch-primary-container)]"
      >
        <ArrowLeft size={16} />
        Volver a mantenimientos
      </Link>

      <section className="stitch-card overflow-hidden">
        <div className="stitch-card-header px-6 py-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <div className="mb-4 inline-flex rounded-lg bg-[rgb(0_63_135_/_0.08)] p-3 text-[var(--stitch-primary)]">
                <ClipboardList size={28} />
              </div>

              <p className="stitch-label">{order.type}</p>

              <h1 className="mt-1 text-3xl font-bold tracking-[-0.03em] text-[var(--stitch-on-surface)]">
                {order.code}
              </h1>

              <div className="mt-4">
                <MaintenanceStatusBadge status={order.status} />
              </div>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:min-w-[440px]">
              <Info label="Equipo" value={order.equipment?.name ?? '-'} />
              <Info
                label="Código equipo"
                value={order.equipment?.internalCode ?? '-'}
              />
              <Info
                label="Técnico"
                value={order.assignedTo?.name ?? 'Sin asignar'}
              />
              <Info label="Creada por" value={order.createdBy?.name ?? '-'} />
              <Info label="Inicio" value={formatDateTime(order.startedAt)} />
              <Info
                label="Finalización"
                value={formatDateTime(order.completedAt)}
              />
            </div>
          </div>
        </div>

        {order.description ? (
          <div className="p-6">
            <div className="rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] p-4">
              <p className="stitch-label">Descripción</p>
              <p className="mt-2 text-sm leading-6 text-[var(--stitch-on-surface-variant)]">
                {order.description}
              </p>
            </div>
          </div>
        ) : null}
      </section>

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

      <SectionCard
        title="Checklist"
        description="Tareas técnicas asociadas a esta orden."
        icon={<CheckSquare size={21} />}
        actions={
          canEditTasks ? (
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();

                if (!taskTitle.trim()) return;

                void addTaskMutation.mutateAsync(taskTitle.trim());
              }}
            >
              <input
                className="stitch-input min-w-[240px] px-4 py-2.5"
                placeholder="Nueva tarea"
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
              />

              <ActionButton
                type="submit"
                icon={<Plus size={16} />}
                disabled={addTaskMutation.isPending}
              >
                Agregar
              </ActionButton>
            </form>
          ) : null
        }
      >
        <div className="space-y-3">
          {tasks.map((task) => (
            <label
              key={task.id}
              className="flex items-start gap-3 rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] p-4 transition-colors hover:bg-[var(--stitch-surface-container)]"
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--stitch-primary)]"
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
                <p className="font-semibold text-[var(--stitch-on-surface)]">
                  {task.title}
                </p>

                {task.description ? (
                  <p className="mt-1 text-sm text-[var(--stitch-on-surface-variant)]">
                    {task.description}
                  </p>
                ) : null}

                {task.completedAt ? (
                  <p className="mt-2 text-xs font-medium text-[var(--stitch-success-text)]">
                    Completada: {formatDateTime(task.completedAt)}
                  </p>
                ) : null}
              </div>
            </label>
          ))}

          {tasks.length === 0 ? (
            <div className="rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] p-6 text-center text-[var(--stitch-on-surface-variant)]">
              <CheckSquare
                className="mx-auto mb-2 text-[var(--stitch-outline)]"
                size={24}
              />
              Esta orden no tiene tareas.
            </div>
          ) : null}
        </div>
      </SectionCard>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-lowest)] p-4">
      <p className="stitch-label">{label}</p>
      <p className="mt-1 font-semibold text-[var(--stitch-on-surface)]">
        {value}
      </p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="stitch-card p-5">
      <p className="stitch-label">{label}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--stitch-on-surface)]">
        {value}
      </p>
    </article>
  );
}

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Eye, Play, Plus, X, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { getErrorMessage } from '../lib/error-message';
import { CompleteMaintenanceOrderModal } from '../maintenance-orders/CompleteMaintenanceOrderModal';
import { MaintenanceOrderFormModal } from '../maintenance-orders/MaintenanceOrderFormModal';
import { MaintenanceStatusBadge } from '../maintenance-orders/MaintenanceStatusBadge';
import { equipmentService } from '../services/equipment.service';
import { maintenanceOrdersService } from '../services/maintenance-orders.service';
import { usersService } from '../services/users.service';
import type {
  CompleteMaintenanceOrderPayload,
  CreateMaintenanceOrderPayload,
  MaintenanceOrder,
  MaintenanceStatus,
  MaintenanceType,
  QueryMaintenanceOrdersParams,
} from '../types/domain';
import { ActionButton } from '../ui/ActionButton';
import { FilterBar } from '../ui/FilterBar';
import { PageHeader } from '../ui/PageHeader';
import { ResponsiveTable } from '../ui/ResponsiveTable';
import { StatusPill } from '../ui/StatusPill';
import { useToast } from '../ui/useToast';

const statusOptions: Array<MaintenanceStatus | ''> = [
  '',
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

const typeOptions: Array<MaintenanceType | ''> = [
  '',
  'PREVENTIVE',
  'CORRECTIVE',
];

export function MaintenanceOrdersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const canCreateOrders =
    user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const canWorkOrders = canCreateOrders || user?.role === 'TECHNICIAN';
  const canCancelOrders = canCreateOrders;

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MaintenanceStatus | ''>('');
  const [type, setType] = useState<MaintenanceType | ''>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [completeOrder, setCompleteOrder] = useState<MaintenanceOrder | null>(
    null,
  );
  const [cancelOrder, setCancelOrder] = useState<MaintenanceOrder | null>(null);

  const filters = useMemo<QueryMaintenanceOrdersParams>(
    () => ({
      search: search || undefined,
      status: status || undefined,
      type: type || undefined,
    }),
    [search, status, type],
  );

  const ordersQuery = useQuery({
    queryKey: ['maintenance-orders', filters],
    queryFn: () => maintenanceOrdersService.findAll(filters),
  });

  const equipmentQuery = useQuery({
    queryKey: ['equipment'],
    queryFn: () => equipmentService.findAll(),
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: usersService.findAll,
    enabled: canCreateOrders,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateMaintenanceOrderPayload) =>
      maintenanceOrdersService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['maintenance-orders'] });
      setIsCreateOpen(false);
      addToast({
        type: 'success',
        title: 'Orden creada',
        description:
          'La orden de mantenimiento quedó disponible en el cronograma.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo crear la orden',
        description: getErrorMessage(error),
      });
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => maintenanceOrdersService.start(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['maintenance-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['equipment'] });
      addToast({
        type: 'success',
        title: 'Orden iniciada',
        description: 'La orden ahora está en progreso.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo iniciar la orden',
        description: getErrorMessage(error),
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CompleteMaintenanceOrderPayload;
    }) => maintenanceOrdersService.complete(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['maintenance-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setCompleteOrder(null);
      addToast({
        type: 'success',
        title: 'Orden completada',
        description:
          'El mantenimiento y el estado final del equipo fueron actualizados.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo completar la orden',
        description: getErrorMessage(error),
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      maintenanceOrdersService.cancel(id, { reason }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['maintenance-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setCancelOrder(null);
      addToast({
        type: 'success',
        title: 'Orden cancelada',
        description: 'El motivo de cancelación quedó registrado.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo cancelar la orden',
        description: getErrorMessage(error),
      });
    },
  });

  const orders = ordersQuery.data ?? [];
  const equipment = equipmentQuery.data ?? [];
  const users = usersQuery.data ?? [];

  async function handleCancel(reason: string) {
    if (!cancelOrder) return;

    await cancelMutation.mutateAsync({
      id: cancelOrder.id,
      reason,
    });
  }

  async function handleComplete(payload: CompleteMaintenanceOrderPayload) {
    if (!completeOrder) return;

    await completeMutation.mutateAsync({
      id: completeOrder.id,
      payload,
    });
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Cronograma técnico"
        title="Mantenimientos"
        description="Flujo técnico de órdenes, estados, responsables y checklist operativo."
        actions={
          canCreateOrders ? (
            <ActionButton
              type="button"
              icon={<Plus size={18} />}
              onClick={() => setIsCreateOpen(true)}
            >
              Nueva orden
            </ActionButton>
          ) : undefined
        }
      />

      <FilterBar className="grid md:grid-cols-3">
        <label className="block">
          <span className="stitch-label">Búsqueda</span>
          <input
            className="stitch-input mt-2 px-4 py-3"
            placeholder="Buscar por código o equipo..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="stitch-label">Estado</span>
          <select
            className="stitch-input mt-2 px-4 py-3"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as MaintenanceStatus | '')
            }
          >
            {statusOptions.map((option) => (
              <option key={option || 'all'} value={option}>
                {option || 'Todos los estados'}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="stitch-label">Tipo</span>
          <select
            className="stitch-input mt-2 px-4 py-3"
            value={type}
            onChange={(event) =>
              setType(event.target.value as MaintenanceType | '')
            }
          >
            {typeOptions.map((option) => (
              <option key={option || 'all'} value={option}>
                {option || 'Todos los tipos'}
              </option>
            ))}
          </select>
        </label>
      </FilterBar>

      <ResponsiveTable wrapperClassName="shadow-xl">
        <thead>
          <tr>
            <th>Código</th>
            <th>Equipo</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Técnico</th>
            <th>Fecha</th>
            <th className="text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <span className="stitch-code font-semibold text-[var(--stitch-primary)]">
                  {order.code}
                </span>
              </td>

              <td>
                <div>
                  <p className="font-medium text-[var(--stitch-on-surface)]">
                    {order.equipment?.name ?? '-'}
                  </p>
                  <p className="stitch-code mt-1 text-xs text-[var(--stitch-outline)]">
                    {order.equipment?.internalCode ?? '-'}
                  </p>
                </div>
              </td>

              <td>
                <StatusPill tone="info">{order.type}</StatusPill>
              </td>

              <td>
                <MaintenanceStatusBadge status={order.status} />
              </td>

              <td className="text-[var(--stitch-on-surface-variant)]">
                {order.assignedTo?.name ?? '-'}
              </td>

              <td className="text-[var(--stitch-on-surface-variant)]">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>

              <td>
                <div className="flex justify-end gap-2">
                  <Link
                    to={`/maintenance-orders/${order.id}`}
                    className="rounded-lg border border-[var(--stitch-outline-variant)] p-2 text-[var(--stitch-on-surface-variant)] transition hover:border-[var(--stitch-primary)] hover:bg-[rgb(0_63_135_/_0.06)] hover:text-[var(--stitch-primary)]"
                    title="Ver detalle"
                  >
                    <Eye size={16} />
                  </Link>

                  {canWorkOrders ? (
                    <>
                      <button
                        type="button"
                        disabled={order.status !== 'PENDING'}
                        onClick={() => void startMutation.mutateAsync(order.id)}
                        className="rounded-lg border border-[var(--stitch-outline-variant)] p-2 text-[var(--stitch-on-surface-variant)] transition hover:border-[var(--stitch-primary)] hover:bg-[rgb(0_63_135_/_0.06)] hover:text-[var(--stitch-primary)] disabled:cursor-not-allowed disabled:opacity-30"
                        title="Iniciar"
                      >
                        <Play size={16} />
                      </button>

                      <button
                        type="button"
                        disabled={order.status !== 'IN_PROGRESS'}
                        onClick={() => setCompleteOrder(order)}
                        className="rounded-lg border border-[rgb(21_87_36_/_0.25)] p-2 text-[var(--stitch-success-text)] transition hover:bg-[var(--stitch-success-bg)] disabled:cursor-not-allowed disabled:opacity-30"
                        title="Completar"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    </>
                  ) : null}

                  {canCancelOrders ? (
                    <button
                      type="button"
                      disabled={
                        order.status === 'COMPLETED' ||
                        order.status === 'CANCELLED'
                      }
                      onClick={() => setCancelOrder(order)}
                      className="rounded-lg border border-[var(--stitch-danger-border)] p-2 text-[var(--stitch-danger-text)] transition hover:bg-[var(--stitch-danger-bg)] disabled:cursor-not-allowed disabled:opacity-30"
                      title="Cancelar"
                    >
                      <XCircle size={16} />
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}

          {orders.length === 0 ? (
            <tr>
              <td
                className="px-4 py-8 text-center text-[var(--stitch-outline)]"
                colSpan={7}
              >
                No hay órdenes con los filtros actuales.
              </td>
            </tr>
          ) : null}
        </tbody>
      </ResponsiveTable>

      {canCreateOrders && isCreateOpen ? (
        <MaintenanceOrderFormModal
          equipment={equipment}
          users={users}
          isSubmitting={createMutation.isPending}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={async (payload) => {
            await createMutation.mutateAsync(payload);
          }}
        />
      ) : null}

      {canWorkOrders && completeOrder ? (
        <CompleteMaintenanceOrderModal
          order={completeOrder}
          isSubmitting={completeMutation.isPending}
          onClose={() => setCompleteOrder(null)}
          onSubmit={handleComplete}
        />
      ) : null}

      {canCancelOrders && cancelOrder ? (
        <CancelMaintenanceOrderModal
          order={cancelOrder}
          isSubmitting={cancelMutation.isPending}
          onClose={() => setCancelOrder(null)}
          onSubmit={handleCancel}
        />
      ) : null}
    </section>
  );
}

function CancelMaintenanceOrderModal({
  order,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  order: MaintenanceOrder;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const canSubmit = reason.trim().length > 0 && !isSubmitting;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/80 px-4 backdrop-blur">
      <section className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Cancelar orden</h2>
            <p className="mt-1 text-sm text-slate-400">
              Indica el motivo de cancelación.
            </p>
            <p className="mt-2 text-xs font-medium text-slate-500">
              {order.code} · {order.equipment?.name ?? 'Equipo'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 disabled:opacity-60"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();

            if (!canSubmit) return;

            void onSubmit(reason.trim());
          }}
        >
          <label className="block">
            <span className="text-sm text-slate-300">Motivo</span>
            <textarea
              autoFocus
              className="mt-2 min-h-28 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              placeholder="Describe por qué se cancela la orden..."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-2xl bg-red-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Cancelando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

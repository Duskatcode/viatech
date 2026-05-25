import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Eye, Play, Plus, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const statusOptions: Array<MaintenanceStatus | ''> = [
  '',
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

const typeOptions: Array<MaintenanceType | ''> = ['', 'PREVENTIVE', 'CORRECTIVE'];

export function MaintenanceOrdersPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MaintenanceStatus | ''>('');
  const [type, setType] = useState<MaintenanceType | ''>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [completeOrder, setCompleteOrder] = useState<MaintenanceOrder | null>(null);

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
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateMaintenanceOrderPayload) =>
      maintenanceOrdersService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['maintenance-orders'] });
      setIsCreateOpen(false);
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => maintenanceOrdersService.start(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['maintenance-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['equipment'] });
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
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      maintenanceOrdersService.cancel(id, { reason }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['maintenance-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });

  const orders = ordersQuery.data ?? [];
  const equipment = equipmentQuery.data ?? [];
  const users = usersQuery.data ?? [];

  async function handleCancel(order: MaintenanceOrder) {
    const reason = window.prompt('Motivo de cancelación');

    if (reason === null) return;

    await cancelMutation.mutateAsync({
      id: order.id,
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
          <ActionButton
            type="button"
            icon={<Plus size={18} />}
            onClick={() => setIsCreateOpen(true)}
          >
            Nueva orden
          </ActionButton>
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
            onChange={(event) => setStatus(event.target.value as MaintenanceStatus | '')}
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
            onChange={(event) => setType(event.target.value as MaintenanceType | '')}
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

                  <button
                    type="button"
                    disabled={order.status === 'COMPLETED' || order.status === 'CANCELLED'}
                    onClick={() => void handleCancel(order)}
                    className="rounded-lg border border-[var(--stitch-danger-border)] p-2 text-[var(--stitch-danger-text)] transition hover:bg-[var(--stitch-danger-bg)] disabled:cursor-not-allowed disabled:opacity-30"
                    title="Cancelar"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {orders.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-[var(--stitch-outline)]" colSpan={7}>
                No hay órdenes para los filtros seleccionados.
              </td>
            </tr>
          ) : null}
        </tbody>
      </ResponsiveTable>

      {isCreateOpen ? (
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

      {completeOrder ? (
        <CompleteMaintenanceOrderModal
          order={completeOrder}
          isSubmitting={completeMutation.isPending}
          onClose={() => setCompleteOrder(null)}
          onSubmit={handleComplete}
        />
      ) : null}
    </section>
  );
}

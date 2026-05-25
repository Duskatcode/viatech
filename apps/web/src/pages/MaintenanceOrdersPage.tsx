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
  const [completeOrder, setCompleteOrder] = useState<MaintenanceOrder | null>(
    null,
  );

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
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-white">Mantenimientos</h1>
          <p className="mt-1 text-sm text-slate-400">
            Flujo técnico de órdenes, estados y checklist.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          <Plus size={18} />
          Nueva orden
        </button>
      </div>

      <div className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-3">
        <input
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          placeholder="Buscar por código o equipo..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          value={status}
          onChange={(event) => setStatus(event.target.value as MaintenanceStatus | '')}
        >
          {statusOptions.map((option) => (
            <option key={option || 'all'} value={option}>
              {option || 'Todos los estados'}
            </option>
          ))}
        </select>

        <select
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          value={type}
          onChange={(event) => setType(event.target.value as MaintenanceType | '')}
        >
          {typeOptions.map((option) => (
            <option key={option || 'all'} value={option}>
              {option || 'Todos los tipos'}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-950 text-slate-400">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Técnico</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {orders.map((order) => (
              <tr key={order.id} className="text-slate-300">
                <td className="px-4 py-3 font-medium text-white">{order.code}</td>
                <td className="px-4 py-3">
                  <div>
                    <p>{order.equipment?.name ?? '-'}</p>
                    <p className="text-xs text-slate-500">
                      {order.equipment?.internalCode ?? '-'}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">{order.type}</td>
                <td className="px-4 py-3">
                  <MaintenanceStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3">{order.assignedTo?.name ?? '-'}</td>
                <td className="px-4 py-3">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/maintenance-orders/${order.id}`}
                      className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                      title="Ver detalle"
                    >
                      <Eye size={16} />
                    </Link>

                    <button
                      type="button"
                      disabled={order.status !== 'PENDING'}
                      onClick={() => void startMutation.mutateAsync(order.id)}
                      className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      title="Iniciar"
                    >
                      <Play size={16} />
                    </button>

                    <button
                      type="button"
                      disabled={order.status !== 'IN_PROGRESS'}
                      onClick={() => setCompleteOrder(order)}
                      className="rounded-xl border border-emerald-500/30 p-2 text-emerald-300 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-30"
                      title="Completar"
                    >
                      <CheckCircle2 size={16} />
                    </button>

                    <button
                      type="button"
                      disabled={
                        order.status === 'COMPLETED' ||
                        order.status === 'CANCELLED'
                      }
                      onClick={() => void handleCancel(order)}
                      className="rounded-xl border border-red-500/30 p-2 text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
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
                <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>
                  No hay órdenes para los filtros seleccionados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

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

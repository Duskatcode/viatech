import { useQuery } from '@tanstack/react-query';
import { ClipboardList, MonitorCog, Wrench } from 'lucide-react';

import { api } from '../lib/api';
import type { Equipment, MaintenanceOrder } from '../types/domain';

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: typeof MonitorCog;
}) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        </div>

        <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300">
          <Icon size={24} />
        </div>
      </div>
    </article>
  );
}

export function DashboardPage() {
  const equipmentQuery = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const response = await api.get<Equipment[]>('/equipment');
      return response.data;
    },
  });

  const ordersQuery = useQuery({
    queryKey: ['maintenance-orders'],
    queryFn: async () => {
      const response = await api.get<MaintenanceOrder[]>('/maintenance-orders');
      return response.data;
    },
  });

  const equipment = equipmentQuery.data ?? [];
  const orders = ordersQuery.data ?? [];

  const inMaintenance = equipment.filter(
    (item) => item.status === 'IN_MAINTENANCE',
  ).length;

  const activeOrders = orders.filter(
    (order) => order.status === 'PENDING' || order.status === 'IN_PROGRESS',
  ).length;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Resumen operativo de equipos y mantenimientos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Equipos registrados" value={equipment.length} icon={MonitorCog} />
        <StatCard title="Equipos en mantenimiento" value={inMaintenance} icon={Wrench} />
        <StatCard title="Órdenes activas" value={activeOrders} icon={ClipboardList} />
      </div>

      <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">Órdenes recientes</h2>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Equipo</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.slice(0, 6).map((order) => (
                <tr key={order.id} className="text-slate-300">
                  <td className="px-4 py-3 font-medium text-white">{order.code}</td>
                  <td className="px-4 py-3">{order.equipment?.name ?? '-'}</td>
                  <td className="px-4 py-3">{order.type}</td>
                  <td className="px-4 py-3">{order.status}</td>
                </tr>
              ))}

              {orders.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={4}>
                    No hay órdenes registradas.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

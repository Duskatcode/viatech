import { useQuery } from '@tanstack/react-query';

import { api } from '../lib/api';
import type { MaintenanceOrder } from '../types/domain';

export function MaintenanceOrdersPage() {
  const query = useQuery({
    queryKey: ['maintenance-orders'],
    queryFn: async () => {
      const response = await api.get<MaintenanceOrder[]>('/maintenance-orders');
      return response.data;
    },
  });

  const orders = query.data ?? [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Mantenimientos</h1>
        <p className="mt-1 text-sm text-slate-400">
          Órdenes técnicas registradas en el sistema.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950 text-slate-400">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Creación</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {orders.map((order) => (
              <tr key={order.id} className="text-slate-300">
                <td className="px-4 py-3 font-medium text-white">{order.code}</td>
                <td className="px-4 py-3">{order.equipment?.name ?? '-'}</td>
                <td className="px-4 py-3">{order.type}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}

            {orders.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                  No hay órdenes registradas.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';

import { MaintenanceStatusBadge } from '../maintenance-orders/MaintenanceStatusBadge';
import type { MaintenanceOrder } from '../types/domain';

interface RecentMaintenanceOrdersProps {
  orders: MaintenanceOrder[];
}

export function RecentMaintenanceOrders({ orders }: RecentMaintenanceOrdersProps) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Órdenes recientes</h2>
          <p className="mt-1 text-sm text-slate-400">
            Últimos mantenimientos registrados.
          </p>
        </div>

        <Link
          to="/maintenance-orders"
          className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
        >
          Ver todas
        </Link>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-950 text-slate-400">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {orders.map((order) => (
              <tr key={order.id} className="text-slate-300">
                <td className="px-4 py-3">
                  <Link
                    to={`/maintenance-orders/${order.id}`}
                    className="font-medium text-white transition hover:text-cyan-300"
                  >
                    {order.code}
                  </Link>
                </td>
                <td className="px-4 py-3">{order.equipment?.name ?? '-'}</td>
                <td className="px-4 py-3">{order.type}</td>
                <td className="px-4 py-3">
                  <MaintenanceStatusBadge status={order.status} />
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
    </article>
  );
}

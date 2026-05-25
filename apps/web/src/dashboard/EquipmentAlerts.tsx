import { Link } from 'react-router-dom';

import { EquipmentStatusBadge } from '../equipment/EquipmentStatusBadge';
import type { Equipment } from '../types/domain';

interface EquipmentAlertsProps {
  equipment: Equipment[];
}

export function EquipmentAlerts({ equipment }: EquipmentAlertsProps) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Alertas de equipos</h2>
          <p className="mt-1 text-sm text-slate-400">
            Equipos que requieren atención operativa.
          </p>
        </div>

        <Link
          to="/equipment"
          className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
        >
          Ver todos
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {equipment.slice(0, 6).map((item) => (
          <Link
            key={item.id}
            to={`/equipment/${item.id}`}
            className="block rounded-2xl border border-slate-800 bg-slate-950 p-4 transition hover:border-cyan-400/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{item.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.internalCode} · {item.site?.name ?? 'Sin sede'} ·{' '}
                  {item.area?.name ?? 'Sin área'}
                </p>
              </div>

              <EquipmentStatusBadge status={item.status} />
            </div>
          </Link>
        ))}

        {equipment.length === 0 ? (
          <p className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-center text-sm text-slate-500">
            No hay equipos en alerta.
          </p>
        ) : null}
      </div>
    </article>
  );
}

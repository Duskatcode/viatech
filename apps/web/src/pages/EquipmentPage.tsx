import { useQuery } from '@tanstack/react-query';

import { api } from '../lib/api';
import type { Equipment } from '../types/domain';

export function EquipmentPage() {
  const query = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const response = await api.get<Equipment[]>('/equipment');
      return response.data;
    },
  });

  const equipment = query.data ?? [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Equipos</h1>
        <p className="mt-1 text-sm text-slate-400">
          Inventario biomédico conectado al backend.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950 text-slate-400">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Marca</th>
              <th className="px-4 py-3">Sede</th>
              <th className="px-4 py-3">Área</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {equipment.map((item) => (
              <tr key={item.id} className="text-slate-300">
                <td className="px-4 py-3 font-medium text-white">{item.internalCode}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.brand ?? '-'}</td>
                <td className="px-4 py-3">{item.site?.name ?? '-'}</td>
                <td className="px-4 py-3">{item.area?.name ?? '-'}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}

            {equipment.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                  No hay equipos registrados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

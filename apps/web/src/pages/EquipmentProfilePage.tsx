import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarClock, ClipboardList, MonitorCog } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { AttachmentsPanel } from '../attachments/AttachmentsPanel';
import { EquipmentStatusBadge } from '../equipment/EquipmentStatusBadge';
import { equipmentService } from '../services/equipment.service';

export function EquipmentProfilePage() {
  const { id } = useParams<{ id: string }>();

  const query = useQuery({
    queryKey: ['equipment-profile', id],
    queryFn: () => equipmentService.profile(id ?? ''),
    enabled: Boolean(id),
  });

  const equipment = query.data;

  if (query.isLoading) {
    return <p className="text-slate-400">Cargando hoja de vida...</p>;
  }

  if (!equipment) {
    return <p className="text-slate-400">Equipo no encontrado.</p>;
  }

  return (
    <section className="space-y-6">
      <Link
        to="/equipment"
        className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
      >
        <ArrowLeft size={16} />
        Volver a equipos
      </Link>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="mb-4 inline-flex rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
              <MonitorCog size={28} />
            </div>

            <p className="text-sm text-slate-400">{equipment.internalCode}</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">{equipment.name}</h1>

            <div className="mt-4">
              <EquipmentStatusBadge status={equipment.status} />
            </div>
          </div>

          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2 lg:min-w-[420px]">
            <Info label="Empresa" value={equipment.company.name} />
            <Info label="Sede" value={equipment.site.name} />
            <Info label="Área" value={equipment.area.name} />
            <Info label="Marca" value={equipment.brand ?? '-'} />
            <Info label="Modelo" value={equipment.model ?? '-'} />
            <Info label="Serial" value={equipment.serialNumber ?? '-'} />
            <Info label="Tipo" value={equipment.equipmentType ?? '-'} />
            <Info label="Riesgo" value={equipment.riskLevel ?? '-'} />
          </div>
        </div>

        {equipment.notes ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-medium text-slate-300">Notas</p>
            <p className="mt-2 text-sm text-slate-400">{equipment.notes}</p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Metric
          label="Mantenimientos"
          value={equipment.maintenanceOrders.length}
          icon={ClipboardList}
        />
        <Metric
          label="Adjuntos"
          value={equipment.attachments.length}
          icon={CalendarClock}
        />
        <Metric
          label="Estado actual"
          value={equipment.status}
          icon={MonitorCog}
        />
      </div>

      <AttachmentsPanel
        ownerType="equipment"
        ownerId={equipment.id}
        title="Adjuntos del equipo"
        description="Sube hojas de vida, certificados, fotos o documentos asociados al equipo."
      />

      <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">
          Historial de mantenimiento
        </h2>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Diagnóstico</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {equipment.maintenanceOrders.map((order) => (
                <tr key={order.id} className="text-slate-300">
                  <td className="px-4 py-3 font-medium text-white">{order.code}</td>
                  <td className="px-4 py-3">{order.type}</td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3">{order.diagnosis ?? '-'}</td>
                  <td className="px-4 py-3">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {equipment.maintenanceOrders.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                    Este equipo aún no tiene mantenimientos registrados.
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-white">{value}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof MonitorCog;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>

        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

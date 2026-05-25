import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarClock, ClipboardList, MonitorCog } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { AttachmentsPanel } from '../attachments/AttachmentsPanel';
import { EquipmentStatusBadge } from '../equipment/EquipmentStatusBadge';
import { MaintenanceStatusBadge } from '../maintenance-orders/MaintenanceStatusBadge';
import { equipmentService } from '../services/equipment.service';
import { ResponsiveTable } from '../ui/ResponsiveTable';
import { SectionCard } from '../ui/SectionCard';

function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString();
}

export function EquipmentProfilePage() {
  const { id } = useParams<{ id: string }>();

  const query = useQuery({
    queryKey: ['equipment-profile', id],
    queryFn: () => equipmentService.profile(id ?? ''),
    enabled: Boolean(id),
  });

  const equipment = query.data;

  if (query.isLoading) {
    return (
      <p className="text-sm text-[var(--stitch-on-surface-variant)]">
        Cargando hoja de vida...
      </p>
    );
  }

  if (!equipment) {
    return (
      <p className="text-sm text-[var(--stitch-on-surface-variant)]">
        Equipo no encontrado.
      </p>
    );
  }

  return (
    <section className="space-y-6">
      <Link
        to="/equipment"
        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--stitch-primary)] transition hover:text-[var(--stitch-primary-container)]"
      >
        <ArrowLeft size={16} />
        Volver a equipos
      </Link>

      <section className="stitch-card overflow-hidden">
        <div className="stitch-card-header px-6 py-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <div className="mb-4 inline-flex rounded-lg bg-[rgb(0_63_135_/_0.08)] p-3 text-[var(--stitch-primary)]">
                <MonitorCog size={28} />
              </div>

              <p className="stitch-code text-sm font-bold text-[var(--stitch-primary)]">
                {equipment.internalCode}
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-[-0.03em] text-[var(--stitch-on-surface)]">
                {equipment.name}
              </h1>

              <div className="mt-4">
                <EquipmentStatusBadge status={equipment.status} />
              </div>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:min-w-[460px]">
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
        </div>

        {equipment.notes ? (
          <div className="p-6">
            <div className="rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] p-4">
              <p className="stitch-label">Notas</p>
              <p className="mt-2 text-sm leading-6 text-[var(--stitch-on-surface-variant)]">
                {equipment.notes}
              </p>
            </div>
          </div>
        ) : null}
      </section>

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

      <SectionCard
        title="Historial de mantenimiento"
        description="Registro preventivo y correctivo asociado a la hoja de vida del equipo."
        icon={<ClipboardList size={21} />}
      >
        <ResponsiveTable wrapperClassName="rounded-lg">
          <thead>
            <tr>
              <th>Código</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Diagnóstico</th>
              <th>Fecha</th>
            </tr>
          </thead>

          <tbody>
            {equipment.maintenanceOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <span className="stitch-code font-semibold text-[var(--stitch-primary)]">
                    {order.code}
                  </span>
                </td>
                <td className="text-[var(--stitch-on-surface-variant)]">
                  {order.type}
                </td>
                <td>
                  <MaintenanceStatusBadge status={order.status} />
                </td>
                <td className="text-[var(--stitch-on-surface-variant)]">
                  {order.diagnosis ?? '-'}
                </td>
                <td className="text-[var(--stitch-on-surface-variant)]">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))}

            {equipment.maintenanceOrders.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-[var(--stitch-outline)]" colSpan={5}>
                  Este equipo aún no tiene mantenimientos registrados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </ResponsiveTable>
      </SectionCard>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-lowest)] p-4">
      <p className="stitch-label">{label}</p>
      <p className="mt-1 font-semibold text-[var(--stitch-on-surface)]">{value}</p>
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
    <article className="stitch-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="stitch-label">{label}</p>
          <p className="mt-2 text-2xl font-bold text-[var(--stitch-on-surface)]">
            {value}
          </p>
        </div>

        <div className="rounded-lg bg-[rgb(0_63_135_/_0.08)] p-3 text-[var(--stitch-primary)]">
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

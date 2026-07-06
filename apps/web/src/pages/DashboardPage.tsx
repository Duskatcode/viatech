import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  FileDown,
  MonitorCog,
  Paperclip,
  ShieldAlert,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { GlobalDashboard } from '../dashboard/GlobalDashboard';
import { alertsService } from '../services/alerts.service';
import type {
  AlertEquipment,
  AlertMaintenanceOrder,
} from '../services/alerts.service';
import { auditLogsService } from '../services/audit-logs.service';
import { reportsService } from '../services/reports.service';
import { PageHeader } from '../ui/PageHeader';
import { ResponsiveTable } from '../ui/ResponsiveTable';
import { ErrorState, LoadingState } from '../ui/StateMessage';
import { StatusPill } from '../ui/StatusPill';

function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString();
}

function getAuditTone(
  action: string,
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (
    action.includes('DELETED') ||
    action.includes('CANCELLED') ||
    action.includes('RETIRED')
  ) {
    return 'danger';
  }

  if (action.includes('EXPORTED')) {
    return 'info';
  }

  if (action.includes('COMPLETED') || action.includes('CREATED')) {
    return 'success';
  }

  if (action.includes('STATUS')) {
    return 'warning';
  }

  return 'neutral';
}

function getActionLabel(action: string) {
  const labels: Record<string, string> = {
    ATTACHMENT_UPLOADED: 'Adjunto subido',
    ATTACHMENT_DELETED: 'Adjunto eliminado',
    REPORT_CSV_EXPORTED: 'CSV exportado',
    REPORT_XLSX_EXPORTED: 'Excel exportado',
    REPORT_PDF_EXPORTED: 'PDF exportado',
    EQUIPMENT_CREATED: 'Equipo creado',
    EQUIPMENT_UPDATED: 'Equipo actualizado',
    EQUIPMENT_STATUS_CHANGED: 'Estado de equipo',
    EQUIPMENT_RETIRED: 'Equipo retirado',
    MAINTENANCE_ORDER_CREATED: 'Orden creada',
    MAINTENANCE_ORDER_STARTED: 'Orden iniciada',
    MAINTENANCE_ORDER_COMPLETED: 'Orden completada',
    MAINTENANCE_ORDER_CANCELLED: 'Orden cancelada',
  };

  return labels[action] ?? action;
}

interface DashboardCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: typeof Activity;
  tone?: 'default' | 'warning' | 'danger' | 'success';
  href?: string;
}

const cardToneClassName: Record<
  NonNullable<DashboardCardProps['tone']>,
  string
> = {
  default: 'bg-[rgb(0_63_135_/_0.08)] text-[var(--stitch-primary)]',
  warning: 'bg-[var(--stitch-warning-bg)] text-[var(--stitch-warning-text)]',
  danger: 'bg-[var(--stitch-danger-bg)] text-[var(--stitch-danger-text)]',
  success: 'bg-[var(--stitch-success-bg)] text-[var(--stitch-success-text)]',
};

function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  tone = 'default',
  href,
}: DashboardCardProps) {
  const content = (
    <article className="stitch-card group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--stitch-primary)] hover:shadow-lg focus-within:border-[var(--stitch-primary)] focus-within:outline-none">
      <div className="absolute -bottom-8 -right-8 opacity-[0.04] transition-opacity group-hover:opacity-[0.08]">
        <Icon size={112} />
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="stitch-label">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[var(--stitch-on-surface)]">
            {value}
          </p>
          <p className="mt-2 text-sm text-[var(--stitch-on-surface-variant)]">
            {description}
          </p>
        </div>

        <div className={`rounded-lg p-3 ${cardToneClassName[tone]}`}>
          <Icon size={23} />
        </div>
      </div>
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link to={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stitch-primary)] focus-visible:ring-offset-2">
      {content}
    </Link>
  );
}

function EmptyPanel({ children }: { children: string }) {
  return (
    <div className="rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] p-5 text-sm text-[var(--stitch-on-surface-variant)]">
      {children}
    </div>
  );
}

function MaintenanceAlertItem({
  order,
  tone,
}: {
  order: AlertMaintenanceOrder;
  tone: 'danger' | 'warning';
}) {
  return (
    <div className="rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-lowest)] p-4 transition-colors hover:bg-[var(--stitch-surface-low)]">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <StatusPill tone={tone}>
            {tone === 'danger' ? 'Vencida' : 'Próxima'}
          </StatusPill>

          <p className="mt-3 text-sm font-bold text-[var(--stitch-on-surface)]">
            {order.code}
          </p>

          <p className="mt-1 text-sm text-[var(--stitch-on-surface-variant)]">
            <span className="stitch-code text-xs">
              {order.equipment?.internalCode ?? '-'}
            </span>{' '}
            · {order.equipment?.name ?? '-'}
          </p>

          <p className="mt-1 text-xs text-[var(--stitch-outline)]">
            Técnico: {order.assignedTo?.name ?? 'Sin asignar'}
          </p>
        </div>

        <p className="text-xs text-[var(--stitch-outline)]">
          Programada: {formatDate(order.scheduledDate)}
        </p>
      </div>
    </div>
  );
}

function EquipmentAlertItem({
  equipment,
  type,
}: {
  equipment: AlertEquipment;
  type: 'maintenance' | 'out-of-service' | 'warranty';
}) {
  const label =
    type === 'out-of-service'
      ? 'Fuera de servicio'
      : type === 'maintenance'
        ? 'En mantenimiento'
        : 'Garantía próxima';

  const tone =
    type === 'out-of-service'
      ? 'danger'
      : type === 'maintenance'
        ? 'warning'
        : 'info';

  return (
    <div className="rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-lowest)] p-4 transition-colors hover:bg-[var(--stitch-surface-low)]">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <StatusPill tone={tone}>{label}</StatusPill>

          <p className="mt-3 text-sm font-bold text-[var(--stitch-on-surface)]">
            <span className="stitch-code text-xs text-[var(--stitch-primary)]">
              {equipment.internalCode}
            </span>{' '}
            · {equipment.name}
          </p>

          <p className="mt-1 text-sm text-[var(--stitch-on-surface-variant)]">
            {equipment.site?.name ?? '-'} · {equipment.area?.name ?? '-'}
          </p>
        </div>

        <p className="text-xs text-[var(--stitch-outline)]">
          {type === 'warranty'
            ? `Garantía: ${formatDate(equipment.warrantyUntil)}`
            : `Actualizado: ${formatDate(equipment.updatedAt)}`}
        </p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();

  // Redirige a técnicos a sus órdenes asignadas
  if (user?.role === 'TECHNICIAN') {
    return <Navigate to="/maintenance-orders?assignedToMe=true" replace />;
  }

  if (user?.role === 'SUPER_ADMIN') {
    return <GlobalDashboard />;
  }

  return <CompanyDashboard />;
}

function CompanyDashboard() {
  const { user } = useAuth();
  const canViewAudit = user?.role === 'ADMIN' || user?.role === 'VIEWER';

  const summaryQuery = useQuery({
    queryKey: ['dashboard-reports-summary'],
    queryFn: reportsService.summary,
  });

  const auditLogsQuery = useQuery({
    queryKey: ['dashboard-audit-logs'],
    queryFn: () => auditLogsService.findAll({}),
    enabled: canViewAudit,
  });

  const alertsQuery = useQuery({
    queryKey: ['dashboard-alerts-summary', 30],
    queryFn: () => alertsService.summary(30),
  });

  const summary = summaryQuery.data;
  const auditLogs = useMemo(
    () => auditLogsQuery.data ?? [],
    [auditLogsQuery.data],
  );
  const alerts = alertsQuery.data;

  const latestAuditLogs = auditLogs.slice(0, 8);

  const auditMetrics = useMemo(() => {
    const exportsCount = auditLogs.filter((log) =>
      log.action.includes('EXPORTED'),
    ).length;
    const attachmentEvents = auditLogs.filter((log) =>
      log.action.includes('ATTACHMENT'),
    ).length;
    const equipmentEvents = auditLogs.filter((log) =>
      log.action.includes('EQUIPMENT'),
    ).length;
    const maintenanceEvents = auditLogs.filter((log) =>
      log.action.includes('MAINTENANCE_ORDER'),
    ).length;

    return {
      exportsCount,
      attachmentEvents,
      equipmentEvents,
      maintenanceEvents,
    };
  }, [auditLogs]);

  const equipmentInMaintenance = summary?.equipment.inMaintenance ?? 0;
  const outOfService = summary?.equipment.outOfService ?? 0;
  const pendingOrders = summary?.maintenanceOrders.pending ?? 0;
  const inProgressOrders = summary?.maintenanceOrders.inProgress ?? 0;
  const completedOrders = summary?.maintenanceOrders.completed ?? 0;

  const openOrders = pendingOrders + inProgressOrders;

  const alertCounts = alerts?.counts ?? {
    overdueOrders: 0,
    upcomingOrders: 0,
    inMaintenanceEquipment: 0,
    outOfServiceEquipment: 0,
    warrantyExpiringEquipment: 0,
    total: 0,
  };

  const criticalAlerts =
    alertCounts.overdueOrders + alertCounts.outOfServiceEquipment;

  const totalEquipment = summary?.equipment.total ?? 0;
  const activeEquipment = summary?.equipment.active ?? 0;

  const availabilityPercent = totalEquipment
    ? Math.round((activeEquipment / totalEquipment) * 100)
    : 0;

  const overdueOrders = alerts?.overdueOrders ?? [];
  const upcomingOrders = alerts?.upcomingOrders ?? [];
  const outOfServiceEquipment = alerts?.outOfServiceEquipment ?? [];
  const inMaintenanceEquipment = alerts?.inMaintenanceEquipment ?? [];
  const warrantyExpiringEquipment = alerts?.warrantyExpiringEquipment ?? [];

  const isLoading =
    summaryQuery.isLoading ||
    alertsQuery.isLoading ||
    (canViewAudit && auditLogsQuery.isLoading);

  const isError =
    summaryQuery.isError ||
    alertsQuery.isError ||
    (canViewAudit && auditLogsQuery.isError);

  if (isLoading) {
    return (
      <LoadingState
        title="Cargando dashboard..."
        description="Consultando KPIs operativos, alertas y eventos de auditoría."
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="No se pudo cargar el dashboard"
        description="Verifica que la API esté activa y que tu sesión tenga permisos."
      />
    );
  }

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Panel operativo"
        title="Panel de empresa"
        description="Resumen operativo de equipos, órdenes, alertas y disponibilidad de tu empresa."
        actions={
          <div className="stitch-card px-4 py-3 text-sm text-[var(--stitch-on-surface-variant)]">
            Alertas actualizadas:{' '}
            <span className="font-bold text-[var(--stitch-on-surface)]">
              {alerts?.generatedAt ? formatDate(alerts.generatedAt) : '-'}
            </span>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Alertas totales"
          value={alertCounts.total}
          description={`Ventana: ${alerts?.windowDays ?? 30} días`}
          icon={ShieldAlert}
          tone={alertCounts.total > 0 ? 'warning' : 'success'}
          href="/reports"
        />

        <DashboardCard
          title="Alertas críticas"
          value={criticalAlerts}
          description="Vencidas + fuera de servicio"
          icon={AlertTriangle}
          tone={criticalAlerts > 0 ? 'danger' : 'success'}
          href="/reports"
        />

        <DashboardCard
          title="Órdenes vencidas"
          value={alertCounts.overdueOrders}
          description={`${alertCounts.upcomingOrders} próximas`}
          icon={CalendarClock}
          tone={alertCounts.overdueOrders > 0 ? 'danger' : 'success'}
          href="/maintenance-orders"
        />

        <DashboardCard
          title="Garantías próximas"
          value={alertCounts.warrantyExpiringEquipment}
          description="Equipos con garantía por vencer"
          icon={MonitorCog}
          tone={
            alertCounts.warrantyExpiringEquipment > 0 ? 'warning' : 'success'
          }
          href="/equipment"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Equipos totales"
          value={totalEquipment}
          description={`${activeEquipment} activos`}
          icon={MonitorCog}
          href="/equipment"
        />

        <DashboardCard
          title="Equipos en mantenimiento"
          value={equipmentInMaintenance}
          description={`${outOfService} fuera de servicio`}
          icon={Wrench}
          tone={
            outOfService > 0
              ? 'danger'
              : equipmentInMaintenance > 0
                ? 'warning'
                : 'default'
          }
          href="/equipment"
        />

        <DashboardCard
          title="Órdenes abiertas"
          value={openOrders}
          description={`${pendingOrders} pendientes · ${inProgressOrders} en progreso`}
          icon={ClipboardList}
          tone={openOrders > 0 ? 'warning' : 'success'}
          href="/maintenance-orders"
        />

        <DashboardCard
          title="Órdenes completadas"
          value={completedOrders}
          description="Total histórico registrado"
          icon={ClipboardCheck}
          tone="success"
          href="/maintenance-orders"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Eventos auditados"
          value={auditLogs.length}
          description="Últimos 100 eventos consultados"
          icon={ShieldCheck}
          href="/audit-logs"
        />

        <DashboardCard
          title="Exportaciones"
          value={auditMetrics.exportsCount}
          description="CSV, Excel y PDF"
          icon={FileDown}
          href="/reports"
        />

        <DashboardCard
          title="Adjuntos auditados"
          value={auditMetrics.attachmentEvents}
          description="Subidas y eliminaciones"
          icon={Paperclip}
          href="/maintenance-orders"
        />

        <DashboardCard
          title="Actividad dominio"
          value={auditMetrics.equipmentEvents + auditMetrics.maintenanceEvents}
          description="Equipos + órdenes auditadas"
          icon={Activity}
          href="/audit-logs"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="stitch-card overflow-hidden">
          <div className="stitch-card-header flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--stitch-on-surface)]">
                Alertas operativas
              </h2>
              <p className="mt-1 text-sm text-[var(--stitch-on-surface-variant)]">
                Órdenes vencidas, próximas y equipos críticos desde
                /alerts/summary.
              </p>
            </div>

            <StatusPill tone={alertCounts.total > 0 ? 'warning' : 'success'}>
              {alertCounts.total} alertas
            </StatusPill>
          </div>

          <div className="space-y-3 p-5">
            {overdueOrders.slice(0, 4).map((order) => (
              <MaintenanceAlertItem
                key={order.id}
                order={order}
                tone="danger"
              />
            ))}

            {upcomingOrders.slice(0, 4).map((order) => (
              <MaintenanceAlertItem
                key={order.id}
                order={order}
                tone="warning"
              />
            ))}

            {outOfServiceEquipment.slice(0, 4).map((equipment) => (
              <EquipmentAlertItem
                key={equipment.id}
                equipment={equipment}
                type="out-of-service"
              />
            ))}

            {inMaintenanceEquipment.slice(0, 4).map((equipment) => (
              <EquipmentAlertItem
                key={equipment.id}
                equipment={equipment}
                type="maintenance"
              />
            ))}

            {alertCounts.total === 0 ? (
              <EmptyPanel>
                Sin alertas operativas para la ventana actual.
              </EmptyPanel>
            ) : null}
          </div>
        </article>

        <article className="stitch-card overflow-hidden">
          <div className="stitch-card-header px-5 py-4">
            <h2 className="text-lg font-semibold text-[var(--stitch-on-surface)]">
              Garantías próximas
            </h2>
            <p className="mt-1 text-sm text-[var(--stitch-on-surface-variant)]">
              Equipos cuya garantía vence en la ventana configurada.
            </p>
          </div>

          <div className="space-y-3 p-5">
            {warrantyExpiringEquipment.slice(0, 6).map((equipment) => (
              <EquipmentAlertItem
                key={equipment.id}
                equipment={equipment}
                type="warranty"
              />
            ))}

            {warrantyExpiringEquipment.length === 0 ? (
              <EmptyPanel>No hay garantías próximas a vencer.</EmptyPanel>
            ) : null}
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="stitch-card overflow-hidden">
          <div className="stitch-card-header flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--stitch-on-surface)]">
                Últimos eventos críticos
              </h2>
              <p className="mt-1 text-sm text-[var(--stitch-on-surface-variant)]">
                Datos desde /audit-logs, ordenados por fecha descendente.
              </p>
            </div>

            <Link
              to="/audit-logs"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--stitch-primary)] px-4 py-2 text-sm font-bold text-[var(--stitch-primary)] transition-colors hover:bg-[rgb(0_63_135_/_0.06)]"
            >
              Ver auditoría
            </Link>
          </div>

          <div className="p-5">
            {latestAuditLogs.length === 0 ? (
              <EmptyPanel>Todavía no hay eventos auditados.</EmptyPanel>
            ) : (
              <ResponsiveTable wrapperClassName="rounded-lg">
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Entidad</th>
                    <th>Usuario</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {latestAuditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <StatusPill tone={getAuditTone(log.action)}>
                          {getActionLabel(log.action)}
                        </StatusPill>
                      </td>
                      <td>
                        <div className="font-medium text-[var(--stitch-on-surface)]">
                          {log.entity}
                        </div>
                        <div className="stitch-code mt-1 text-xs text-[var(--stitch-outline)]">
                          {log.entityId}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-[var(--stitch-on-surface)]">
                          {log.user?.name ?? '-'}
                        </div>
                        <div className="text-xs text-[var(--stitch-outline)]">
                          {log.user?.email ?? '-'}
                        </div>
                      </td>
                      <td className="text-xs text-[var(--stitch-on-surface-variant)]">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </ResponsiveTable>
            )}
          </div>
        </article>

        <article className="stitch-card overflow-hidden">
          <div className="stitch-card-header px-5 py-4">
            <h2 className="text-lg font-semibold text-[var(--stitch-on-surface)]">
              Resumen operativo
            </h2>
            <p className="mt-1 text-sm text-[var(--stitch-on-surface-variant)]">
              Indicadores de disponibilidad y carga operativa.
            </p>
          </div>

          <div className="space-y-4 p-5">
            <div className="rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-[var(--stitch-on-surface)]">
                  Disponibilidad de equipos
                </p>
                <span className="stitch-code text-sm font-bold text-[var(--stitch-primary)]">
                  {availabilityPercent}%
                </span>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--stitch-surface-highest)]">
                <div
                  className="h-full rounded-full bg-[var(--stitch-primary)]"
                  style={{ width: `${availabilityPercent}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-[var(--stitch-on-surface-variant)]">
                {activeEquipment} activos de {totalEquipment} equipos.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] p-4">
                <p className="stitch-label">Carga de mantenimiento</p>
                <p className="mt-3 text-2xl font-bold text-[var(--stitch-on-surface)]">
                  {openOrders}
                </p>
                <p className="mt-1 text-xs text-[var(--stitch-on-surface-variant)]">
                  Órdenes pendientes o en progreso.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] p-4">
                <p className="stitch-label">Alertas críticas</p>
                <p className="mt-3 text-2xl font-bold text-[var(--stitch-error)]">
                  {criticalAlerts}
                </p>
                <p className="mt-1 text-xs text-[var(--stitch-on-surface-variant)]">
                  Órdenes vencidas + equipos fuera de servicio.
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

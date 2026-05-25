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
  ShieldCheck,
  ShieldAlert,
  Wrench,
} from 'lucide-react';

import { alertsService } from '../services/alerts.service';
import type {
  AlertEquipment,
  AlertMaintenanceOrder,
} from '../services/alerts.service';
import { auditLogsService } from '../services/audit-logs.service';
import { reportsService } from '../services/reports.service';
import { ErrorState, LoadingState } from '../ui/StateMessage';

function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString();
}

function getAuditTone(action: string) {
  if (action.includes('DELETED') || action.includes('CANCELLED') || action.includes('RETIRED')) {
    return 'border-red-500/30 bg-red-500/10 text-red-300';
  }

  if (action.includes('EXPORTED')) {
    return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300';
  }

  if (action.includes('COMPLETED') || action.includes('CREATED')) {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  }

  return 'border-slate-700 bg-slate-800 text-slate-300';
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
}

function getCardTone(tone: DashboardCardProps['tone']) {
  if (tone === 'danger') {
    return 'bg-red-500/10 text-red-300';
  }

  if (tone === 'warning') {
    return 'bg-amber-500/10 text-amber-300';
  }

  if (tone === 'success') {
    return 'bg-emerald-500/10 text-emerald-300';
  }

  return 'bg-cyan-400/10 text-cyan-300';
}

function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  tone = 'default',
}: DashboardCardProps) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>

        <div className={`rounded-2xl p-3 ${getCardTone(tone)}`}>
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

function MaintenanceAlertItem({
  order,
  tone,
}: {
  order: AlertMaintenanceOrder;
  tone: 'danger' | 'warning';
}) {
  const toneClass =
    tone === 'danger'
      ? 'border-red-500/30 bg-red-500/10 text-red-300'
      : 'border-amber-500/30 bg-amber-500/10 text-amber-300';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>
            {tone === 'danger' ? 'Vencida' : 'Próxima'}
          </span>

          <p className="mt-3 text-sm font-semibold text-white">{order.code}</p>

          <p className="mt-1 text-sm text-slate-400">
            {order.equipment?.internalCode ?? '-'} · {order.equipment?.name ?? '-'}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Técnico: {order.assignedTo?.name ?? 'Sin asignar'}
          </p>
        </div>

        <p className="text-xs text-slate-500">
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

  const toneClass =
    type === 'out-of-service'
      ? 'border-red-500/30 bg-red-500/10 text-red-300'
      : type === 'maintenance'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
        : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>
            {label}
          </span>

          <p className="mt-3 text-sm font-semibold text-white">
            {equipment.internalCode} · {equipment.name}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {equipment.site?.name ?? '-'} · {equipment.area?.name ?? '-'}
          </p>
        </div>

        <p className="text-xs text-slate-500">
          {type === 'warranty'
            ? `Garantía: ${formatDate(equipment.warrantyUntil)}`
            : `Actualizado: ${formatDate(equipment.updatedAt)}`}
        </p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const summaryQuery = useQuery({
    queryKey: ['dashboard-reports-summary'],
    queryFn: reportsService.summary,
  });

  const auditLogsQuery = useQuery({
    queryKey: ['dashboard-audit-logs'],
    queryFn: () => auditLogsService.findAll({}),
  });

  const alertsQuery = useQuery({
    queryKey: ['dashboard-alerts-summary', 30],
    queryFn: () => alertsService.summary(30),
  });

  const summary = summaryQuery.data;
  const auditLogs = auditLogsQuery.data ?? [];
  const alerts = alertsQuery.data;

  const latestAuditLogs = auditLogs.slice(0, 8);

  const auditMetrics = useMemo(() => {
    const exportsCount = auditLogs.filter((log) => log.action.includes('EXPORTED')).length;
    const attachmentEvents = auditLogs.filter((log) => log.action.includes('ATTACHMENT')).length;
    const equipmentEvents = auditLogs.filter((log) => log.action.includes('EQUIPMENT')).length;
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

  const isLoading =
    summaryQuery.isLoading || auditLogsQuery.isLoading || alertsQuery.isLoading;

  const isError =
    summaryQuery.isError || auditLogsQuery.isError || alertsQuery.isError;

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
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Panel operativo
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">
            Resumen de equipos, órdenes, alertas, exportaciones y eventos auditados.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400">
          Alertas actualizadas:{' '}
          <span className="font-medium text-white">
            {alerts?.generatedAt ? formatDate(alerts.generatedAt) : '-'}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Alertas totales"
          value={alertCounts.total}
          description={`Ventana: ${alerts?.windowDays ?? 30} días`}
          icon={ShieldAlert}
          tone={alertCounts.total > 0 ? 'warning' : 'success'}
        />

        <DashboardCard
          title="Alertas críticas"
          value={criticalAlerts}
          description="Vencidas + fuera de servicio"
          icon={AlertTriangle}
          tone={criticalAlerts > 0 ? 'danger' : 'success'}
        />

        <DashboardCard
          title="Órdenes vencidas"
          value={alertCounts.overdueOrders}
          description={`${alertCounts.upcomingOrders} próximas`}
          icon={CalendarClock}
          tone={alertCounts.overdueOrders > 0 ? 'danger' : 'success'}
        />

        <DashboardCard
          title="Garantías próximas"
          value={alertCounts.warrantyExpiringEquipment}
          description="Equipos con garantía por vencer"
          icon={MonitorCog}
          tone={alertCounts.warrantyExpiringEquipment > 0 ? 'warning' : 'success'}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Equipos totales"
          value={summary?.equipment.total ?? 0}
          description={`${summary?.equipment.active ?? 0} activos`}
          icon={MonitorCog}
        />

        <DashboardCard
          title="Equipos en mantenimiento"
          value={equipmentInMaintenance}
          description={`${outOfService} fuera de servicio`}
          icon={Wrench}
          tone={outOfService > 0 ? 'danger' : equipmentInMaintenance > 0 ? 'warning' : 'default'}
        />

        <DashboardCard
          title="Órdenes abiertas"
          value={openOrders}
          description={`${pendingOrders} pendientes · ${inProgressOrders} en progreso`}
          icon={ClipboardList}
          tone={openOrders > 0 ? 'warning' : 'success'}
        />

        <DashboardCard
          title="Órdenes completadas"
          value={completedOrders}
          description="Total histórico registrado"
          icon={ClipboardCheck}
          tone="success"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Eventos auditados"
          value={auditLogs.length}
          description="Últimos 100 eventos consultados"
          icon={ShieldCheck}
        />

        <DashboardCard
          title="Exportaciones"
          value={auditMetrics.exportsCount}
          description="CSV, Excel y PDF"
          icon={FileDown}
        />

        <DashboardCard
          title="Adjuntos auditados"
          value={auditMetrics.attachmentEvents}
          description="Subidas y eliminaciones"
          icon={Paperclip}
        />

        <DashboardCard
          title="Actividad dominio"
          value={auditMetrics.equipmentEvents + auditMetrics.maintenanceEvents}
          description="Equipos + órdenes auditadas"
          icon={Activity}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">Alertas operativas</h2>
          <p className="mt-1 text-sm text-slate-400">
            Órdenes vencidas, próximas y equipos críticos desde `/alerts/summary`.
          </p>

          <div className="mt-5 space-y-3">
            {alerts?.overdueOrders.slice(0, 4).map((order) => (
              <MaintenanceAlertItem key={order.id} order={order} tone="danger" />
            ))}

            {alerts?.upcomingOrders.slice(0, 4).map((order) => (
              <MaintenanceAlertItem key={order.id} order={order} tone="warning" />
            ))}

            {alerts?.outOfServiceEquipment.slice(0, 4).map((equipment) => (
              <EquipmentAlertItem
                key={equipment.id}
                equipment={equipment}
                type="out-of-service"
              />
            ))}

            {alerts?.inMaintenanceEquipment.slice(0, 4).map((equipment) => (
              <EquipmentAlertItem
                key={equipment.id}
                equipment={equipment}
                type="maintenance"
              />
            ))}

            {alertCounts.total === 0 ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm text-emerald-300">
                Sin alertas operativas para la ventana actual.
              </div>
            ) : null}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">Garantías próximas</h2>
          <p className="mt-1 text-sm text-slate-400">
            Equipos cuya garantía vence en la ventana configurada.
          </p>

          <div className="mt-5 space-y-3">
            {alerts?.warrantyExpiringEquipment.slice(0, 6).map((equipment) => (
              <EquipmentAlertItem
                key={equipment.id}
                equipment={equipment}
                type="warranty"
              />
            ))}

            {(alerts?.warrantyExpiringEquipment.length ?? 0) === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-sm text-slate-400">
                No hay garantías próximas a vencer.
              </div>
            ) : null}
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Últimos eventos críticos
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Datos desde `/audit-logs`, ordenados por fecha descendente.
              </p>
            </div>

            <a
              href="/audit-logs"
              className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Ver auditoría
            </a>
          </div>

          <div className="space-y-3">
            {latestAuditLogs.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-sm text-slate-400">
                Todavía no hay eventos auditados.
              </div>
            ) : (
              latestAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getAuditTone(
                          log.action,
                        )}`}
                      >
                        {getActionLabel(log.action)}
                      </span>

                      <p className="mt-3 text-sm text-white">
                        {log.entity} ·{' '}
                        <span className="font-mono text-xs text-slate-400">
                          {log.entityId}
                        </span>
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Usuario: {log.user?.name ?? '-'} · {log.user?.email ?? '-'}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500">
                      {formatDate(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">
            Resumen operativo
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Indicadores de disponibilidad y carga operativa.
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Disponibilidad de equipos</p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{
                    width: `${
                      summary?.equipment.total
                        ? Math.round(
                            ((summary.equipment.active ?? 0) /
                              summary.equipment.total) *
                              100,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {summary?.equipment.active ?? 0} activos de{' '}
                {summary?.equipment.total ?? 0} equipos.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Carga de mantenimiento</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {openOrders}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Órdenes pendientes o en progreso.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Alertas críticas</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {criticalAlerts}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Órdenes vencidas + equipos fuera de servicio.
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  ClipboardCheck,
  ClipboardList,
  FileDown,
  MonitorCog,
  Paperclip,
  ShieldCheck,
  Wrench,
} from 'lucide-react';

import { auditLogsService } from '../services/audit-logs.service';
import { reportsService } from '../services/reports.service';
import { ErrorState, LoadingState } from '../ui/StateMessage';

function formatDate(value: string) {
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
}

function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
}: DashboardCardProps) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>

        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
          <Icon size={22} />
        </div>
      </div>
    </article>
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

  const summary = summaryQuery.data;
  const auditLogs = auditLogsQuery.data ?? [];

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
  const operationalAlerts = equipmentInMaintenance + outOfService + openOrders;

  const isLoading = summaryQuery.isLoading || auditLogsQuery.isLoading;
  const isError = summaryQuery.isError || auditLogsQuery.isError;

  if (isLoading) {
    return (
      <LoadingState
        title="Cargando dashboard..."
        description="Consultando KPIs operativos y eventos de auditoría."
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
            Resumen de equipos, órdenes, exportaciones y eventos críticos auditados.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400">
          Última actualización:{' '}
          <span className="font-medium text-white">
            {summary?.generatedAt ? formatDate(summary.generatedAt) : '-'}
          </span>
        </div>
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
        />

        <DashboardCard
          title="Órdenes abiertas"
          value={openOrders}
          description={`${pendingOrders} pendientes · ${inProgressOrders} en progreso`}
          icon={ClipboardList}
        />

        <DashboardCard
          title="Órdenes completadas"
          value={completedOrders}
          description="Total histórico registrado"
          icon={ClipboardCheck}
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
          title="Alertas operativas"
          value={operationalAlerts}
          description="Equipos no disponibles + órdenes abiertas"
          icon={AlertTriangle}
        />
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
              <p className="text-sm text-slate-400">Actividad auditada</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xl font-semibold text-white">
                    {auditMetrics.equipmentEvents}
                  </p>
                  <p className="text-xs text-slate-500">Equipos</p>
                </div>

                <div>
                  <p className="text-xl font-semibold text-white">
                    {auditMetrics.maintenanceEvents}
                  </p>
                  <p className="text-xs text-slate-500">Órdenes</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

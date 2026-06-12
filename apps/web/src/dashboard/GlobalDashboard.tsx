import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  ClipboardList,
  MonitorCog,
  ShieldAlert,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import type { AuditLog } from '../services/audit-logs.service';
import { auditLogsService } from '../services/audit-logs.service';
import { organizationService } from '../services/organization.service';
import { reportsService } from '../services/reports.service';
import type { Company, Equipment, MaintenanceOrder } from '../types/domain';
import { PageHeader } from '../ui/PageHeader';
import { ResponsiveTable } from '../ui/ResponsiveTable';
import { EmptyState, ErrorState, LoadingState } from '../ui/StateMessage';
import { StatusPill } from '../ui/StatusPill';

const ALERT_WINDOW_DAYS = 30;

interface CompanySummary {
  company: Company;
  equipment: number;
  orders: number;
  alerts: number;
  outOfServiceEquipment: number;
}

interface GlobalAlertCounts {
  overdueOrders: number;
  upcomingOrders: number;
  inMaintenanceEquipment: number;
  outOfServiceEquipment: number;
  warrantyExpiringEquipment: number;
  total: number;
}

export function GlobalDashboard() {
  const companiesQuery = useQuery({
    queryKey: ['global-dashboard-companies'],
    queryFn: organizationService.companies,
  });

  const summaryQuery = useQuery({
    queryKey: ['global-dashboard-summary'],
    queryFn: reportsService.summary,
  });

  const equipmentQuery = useQuery({
    queryKey: ['global-dashboard-equipment'],
    queryFn: () => reportsService.equipment(),
  });

  const ordersQuery = useQuery({
    queryKey: ['global-dashboard-orders'],
    queryFn: () => reportsService.maintenanceOrders(),
  });

  const auditLogsQuery = useQuery({
    queryKey: ['global-dashboard-audit-logs'],
    queryFn: () => auditLogsService.findAll({}),
  });

  const companies = useMemo(
    () => companiesQuery.data ?? [],
    [companiesQuery.data],
  );
  const equipment = useMemo(
    () => equipmentQuery.data ?? [],
    [equipmentQuery.data],
  );
  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const auditLogs = auditLogsQuery.data ?? [];
  const summary = summaryQuery.data;

  const alertCounts = useMemo(
    () => calculateAlertCounts(equipment, orders),
    [equipment, orders],
  );

  const companiesSummary = useMemo(
    () => buildCompaniesSummary(companies, equipment, orders),
    [companies, equipment, orders],
  );

  const latestAuditLogs = auditLogs.slice(0, 8);
  const isLoading =
    companiesQuery.isLoading ||
    summaryQuery.isLoading ||
    equipmentQuery.isLoading ||
    ordersQuery.isLoading ||
    auditLogsQuery.isLoading;
  const isError =
    companiesQuery.isError ||
    summaryQuery.isError ||
    equipmentQuery.isError ||
    ordersQuery.isError ||
    auditLogsQuery.isError;

  if (isLoading) {
    return (
      <LoadingState
        title="Cargando panel global..."
        description="Consolidando empresas, equipos, órdenes, alertas y actividad."
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="No se pudo cargar el panel global"
        description="Verifica que la API esté activa y que la sesión corresponda a un SUPER_ADMIN."
      />
    );
  }

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Administración SaaS"
        title="Panel global"
        description="Resumen general de todas las empresas"
        actions={
          <div className="stitch-card px-4 py-3 text-sm text-[var(--stitch-on-surface-variant)]">
            Ventana de alertas:{' '}
            <span className="font-bold text-[var(--stitch-on-surface)]">
              {ALERT_WINDOW_DAYS} días
            </span>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlobalMetric
          title="Empresas"
          value={companies.length}
          description="Empresas activas"
          icon={Building2}
        />
        <GlobalMetric
          title="Equipos totales"
          value={summary?.equipment.total ?? equipment.length}
          description={`${summary?.equipment.active ?? 0} activos`}
          icon={MonitorCog}
        />
        <GlobalMetric
          title="Órdenes totales"
          value={summary?.maintenanceOrders.total ?? orders.length}
          description={`${summary?.maintenanceOrders.pending ?? 0} pendientes`}
          icon={ClipboardList}
        />
        <GlobalMetric
          title="Alertas globales"
          value={alertCounts.total}
          description="Alertas operativas consolidadas"
          icon={ShieldAlert}
          tone={alertCounts.total > 0 ? 'warning' : 'success'}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlobalMetric
          title="Órdenes vencidas"
          value={alertCounts.overdueOrders}
          description={`${alertCounts.upcomingOrders} próximas`}
          icon={CalendarClock}
          tone={alertCounts.overdueOrders > 0 ? 'danger' : 'success'}
        />
        <GlobalMetric
          title="En mantenimiento"
          value={alertCounts.inMaintenanceEquipment}
          description="Equipos en intervención"
          icon={Wrench}
          tone={alertCounts.inMaintenanceEquipment > 0 ? 'warning' : 'success'}
        />
        <GlobalMetric
          title="Fuera de servicio"
          value={alertCounts.outOfServiceEquipment}
          description="Equipos no disponibles"
          icon={AlertTriangle}
          tone={alertCounts.outOfServiceEquipment > 0 ? 'danger' : 'success'}
        />
        <GlobalMetric
          title="Garantías próximas"
          value={alertCounts.warrantyExpiringEquipment}
          description={`Vencen en ${ALERT_WINDOW_DAYS} días`}
          icon={MonitorCog}
          tone={
            alertCounts.warrantyExpiringEquipment > 0 ? 'warning' : 'success'
          }
        />
      </div>

      <article className="stitch-card overflow-hidden">
        <div className="stitch-card-header flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--stitch-on-surface)]">
              Resumen por empresa
            </h2>
            <p className="mt-1 text-sm text-[var(--stitch-on-surface-variant)]">
              Comparativo operativo de las empresas activas.
            </p>
          </div>

          <Link
            to="/organization"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--stitch-primary)] px-4 py-2 text-sm font-bold text-[var(--stitch-primary)] transition-colors hover:bg-[rgb(0_63_135_/_0.06)]"
          >
            Ver organización
          </Link>
        </div>

        <div className="p-5">
          {companiesSummary.length === 0 ? (
            <EmptyState
              title="No hay empresas activas."
              description="Crea una empresa para comenzar a consolidar información global."
            />
          ) : (
            <ResponsiveTable wrapperClassName="rounded-lg">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Equipos</th>
                  <th>Órdenes</th>
                  <th>Alertas</th>
                  <th>Fuera de servicio</th>
                </tr>
              </thead>
              <tbody>
                {companiesSummary.map((item) => (
                  <tr key={item.company.id}>
                    <td>
                      <p className="font-semibold text-[var(--stitch-on-surface)]">
                        {item.company.name}
                      </p>
                      <p className="mt-1 text-xs text-[var(--stitch-outline)]">
                        {item.company.nit ?? 'Sin NIT'}
                      </p>
                    </td>
                    <td>{item.equipment}</td>
                    <td>{item.orders}</td>
                    <td>
                      <StatusPill
                        tone={item.alerts > 0 ? 'warning' : 'success'}
                      >
                        {item.alerts}
                      </StatusPill>
                    </td>
                    <td>
                      <StatusPill
                        tone={
                          item.outOfServiceEquipment > 0 ? 'danger' : 'success'
                        }
                      >
                        {item.outOfServiceEquipment}
                      </StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </ResponsiveTable>
          )}
        </div>
      </article>

      <article className="stitch-card overflow-hidden">
        <div className="stitch-card-header flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--stitch-on-surface)]">
              Actividad global reciente
            </h2>
            <p className="mt-1 text-sm text-[var(--stitch-on-surface-variant)]">
              Últimos eventos registrados en todas las empresas.
            </p>
          </div>

          <Link
            to="/audit-logs"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--stitch-primary)] px-4 py-2 text-sm font-bold text-[var(--stitch-primary)] transition-colors hover:bg-[rgb(0_63_135_/_0.06)]"
          >
            <ShieldCheck size={16} />
            Ver auditoría
          </Link>
        </div>

        <div className="p-5">
          {latestAuditLogs.length === 0 ? (
            <EmptyState title="No hay actividad reciente para mostrar." />
          ) : (
            <ResponsiveTable wrapperClassName="rounded-lg">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Entidad</th>
                  <th>Usuario</th>
                  <th>Empresa</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {latestAuditLogs.map((log) => (
                  <GlobalAuditRow
                    key={log.id}
                    log={log}
                    companies={companies}
                  />
                ))}
              </tbody>
            </ResponsiveTable>
          )}
        </div>
      </article>
    </section>
  );
}

function GlobalMetric({
  title,
  value,
  description,
  icon: Icon,
  tone = 'default',
}: {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone?: 'default' | 'warning' | 'danger' | 'success';
}) {
  const toneClassName = {
    default: 'bg-[rgb(0_63_135_/_0.08)] text-[var(--stitch-primary)]',
    warning: 'bg-[var(--stitch-warning-bg)] text-[var(--stitch-warning-text)]',
    danger: 'bg-[var(--stitch-danger-bg)] text-[var(--stitch-danger-text)]',
    success: 'bg-[var(--stitch-success-bg)] text-[var(--stitch-success-text)]',
  }[tone];

  return (
    <article className="stitch-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="stitch-label">{title}</p>
          <p className="mt-3 text-3xl font-bold text-[var(--stitch-on-surface)]">
            {value}
          </p>
          <p className="mt-2 text-sm text-[var(--stitch-on-surface-variant)]">
            {description}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${toneClassName}`}>
          <Icon size={23} />
        </div>
      </div>
    </article>
  );
}

function GlobalAuditRow({
  log,
  companies,
}: {
  log: AuditLog;
  companies: Company[];
}) {
  const companyName =
    companies.find((company) => company.id === log.user?.companyId)?.name ??
    (log.user?.companyId ? 'Empresa no disponible' : 'Global');

  return (
    <tr>
      <td>
        <StatusPill tone={getAuditTone(log.action)}>{log.action}</StatusPill>
      </td>
      <td>
        <p className="font-medium text-[var(--stitch-on-surface)]">
          {log.entity}
        </p>
        <p className="stitch-code mt-1 text-xs text-[var(--stitch-outline)]">
          {log.entityId}
        </p>
      </td>
      <td>
        <p className="text-sm text-[var(--stitch-on-surface)]">
          {log.user?.name ?? '-'}
        </p>
        <p className="text-xs text-[var(--stitch-outline)]">
          {log.user?.email ?? '-'}
        </p>
      </td>
      <td className="text-[var(--stitch-on-surface-variant)]">{companyName}</td>
      <td className="text-xs text-[var(--stitch-on-surface-variant)]">
        {formatDate(log.createdAt)}
      </td>
    </tr>
  );
}

function buildCompaniesSummary(
  companies: Company[],
  equipment: Equipment[],
  orders: MaintenanceOrder[],
) {
  return companies
    .map<CompanySummary>((company) => {
      const companyEquipment = equipment.filter(
        (item) => item.companyId === company.id,
      );
      const companyOrders = orders.filter(
        (order) => order.equipment?.companyId === company.id,
      );
      const alerts = calculateAlertCounts(companyEquipment, companyOrders);

      return {
        company,
        equipment: companyEquipment.length,
        orders: companyOrders.length,
        alerts: alerts.total,
        outOfServiceEquipment: alerts.outOfServiceEquipment,
      };
    })
    .sort((left, right) => right.alerts - left.alerts);
}

function calculateAlertCounts(
  equipment: Equipment[],
  orders: MaintenanceOrder[],
): GlobalAlertCounts {
  const now = new Date();
  const until = new Date(now);
  until.setDate(until.getDate() + ALERT_WINDOW_DAYS);

  const overdueOrders = orders.filter((order) => {
    if (!order.scheduledDate) return false;
    return (
      new Date(order.scheduledDate) < now &&
      (order.status === 'PENDING' || order.status === 'IN_PROGRESS')
    );
  }).length;

  const upcomingOrders = orders.filter((order) => {
    if (!order.scheduledDate || order.status !== 'PENDING') return false;
    const scheduledDate = new Date(order.scheduledDate);
    return scheduledDate >= now && scheduledDate <= until;
  }).length;

  const inMaintenanceEquipment = equipment.filter(
    (item) => item.status === 'IN_MAINTENANCE',
  ).length;
  const outOfServiceEquipment = equipment.filter(
    (item) => item.status === 'OUT_OF_SERVICE',
  ).length;
  const warrantyExpiringEquipment = equipment.filter((item) => {
    if (!item.warrantyUntil || item.status === 'RETIRED') return false;
    const warrantyUntil = new Date(item.warrantyUntil);
    return warrantyUntil >= now && warrantyUntil <= until;
  }).length;

  return {
    overdueOrders,
    upcomingOrders,
    inMaintenanceEquipment,
    outOfServiceEquipment,
    warrantyExpiringEquipment,
    total:
      overdueOrders +
      upcomingOrders +
      inMaintenanceEquipment +
      outOfServiceEquipment +
      warrantyExpiringEquipment,
  };
}

function getAuditTone(action: string) {
  if (
    action.includes('DELETED') ||
    action.includes('CANCELLED') ||
    action.includes('RETIRED')
  ) {
    return 'danger';
  }

  if (action.includes('EXPORTED')) return 'info';
  if (action.includes('COMPLETED') || action.includes('CREATED')) {
    return 'success';
  }
  if (action.includes('STATUS')) return 'warning';
  return 'neutral';
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

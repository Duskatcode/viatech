import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  MonitorCog,
  TrendingUp,
} from 'lucide-react';

import {
  countEquipmentByStatus,
  countOrdersByStatus,
  equipmentStatusLabels,
  getActiveOrdersCount,
  getCompletedThisMonthCount,
  getCompletionRate,
  getEquipmentAlerts,
  getOverdueOrdersCount,
  getRecentOrders,
  maintenanceStatusLabels,
} from '../dashboard/dashboard-utils';
import { EquipmentAlerts } from '../dashboard/EquipmentAlerts';
import { MetricCard } from '../dashboard/MetricCard';
import { RecentMaintenanceOrders } from '../dashboard/RecentMaintenanceOrders';
import { StatusDistribution } from '../dashboard/StatusDistribution';
import { equipmentService } from '../services/equipment.service';
import { maintenanceOrdersService } from '../services/maintenance-orders.service';
import { reportsService } from '../services/reports.service';

export function DashboardPage() {
  const equipmentQuery = useQuery({
    queryKey: ['equipment'],
    queryFn: () => equipmentService.findAll(),
  });

  const ordersQuery = useQuery({
    queryKey: ['maintenance-orders'],
    queryFn: () => maintenanceOrdersService.findAll(),
  });

  const summaryQuery = useQuery({
    queryKey: ['reports-summary'],
    queryFn: reportsService.summary,
  });

  const equipment = equipmentQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const summary = summaryQuery.data;

  const equipmentStatus = useMemo(
    () => countEquipmentByStatus(equipment),
    [equipment],
  );

  const orderStatus = useMemo(() => countOrdersByStatus(orders), [orders]);

  const activeOrders = getActiveOrdersCount(orders);
  const overdueOrders = getOverdueOrdersCount(orders);
  const completedThisMonth = getCompletedThisMonthCount(orders);
  const completionRate = getCompletionRate(orders);
  const alerts = getEquipmentAlerts(equipment);
  const recentOrders = getRecentOrders(orders);

  const isLoading = equipmentQuery.isLoading || ordersQuery.isLoading || summaryQuery.isLoading;

  if (isLoading) {
    return <p className="text-slate-400">Cargando métricas...</p>;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Centro operativo
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">
            Métricas reales calculadas desde equipos y órdenes de mantenimiento.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400">
          Actualizado desde API local
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Equipos registrados"
          value={summary?.equipment.total ?? equipment.length}
          description="Total visible para el usuario actual"
          icon={MonitorCog}
        />

        <MetricCard
          title="Órdenes activas"
          value={summary ? summary.maintenanceOrders.pending + summary.maintenanceOrders.inProgress : activeOrders}
          description="Pendientes o en progreso"
          icon={ClipboardList}
        />

        <MetricCard
          title="Completadas este mes"
          value={completedThisMonth}
          description="Mantenimientos cerrados"
          icon={CheckCircle2}
        />

        <MetricCard
          title="Tasa de cierre"
          value={`${completionRate}%`}
          description="Completadas sobre total de órdenes"
          icon={TrendingUp}
        />
      </div>

      {overdueOrders > 0 ? (
        <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5 text-amber-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1" size={22} />
            <div>
              <h2 className="font-semibold">Órdenes vencidas detectadas</h2>
              <p className="mt-1 text-sm text-amber-100/80">
                Hay {overdueOrders} orden(es) programadas con fecha anterior a hoy
                que siguen abiertas.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <StatusDistribution
          title="Equipos por estado"
          items={[
            {
              label: equipmentStatusLabels.ACTIVE,
              value: equipmentStatus.ACTIVE,
            },
            {
              label: equipmentStatusLabels.IN_MAINTENANCE,
              value: equipmentStatus.IN_MAINTENANCE,
            },
            {
              label: equipmentStatusLabels.OUT_OF_SERVICE,
              value: equipmentStatus.OUT_OF_SERVICE,
            },
            {
              label: equipmentStatusLabels.RETIRED,
              value: equipmentStatus.RETIRED,
            },
          ]}
        />

        <StatusDistribution
          title="Órdenes por estado"
          items={[
            {
              label: maintenanceStatusLabels.PENDING,
              value: orderStatus.PENDING,
            },
            {
              label: maintenanceStatusLabels.IN_PROGRESS,
              value: orderStatus.IN_PROGRESS,
            },
            {
              label: maintenanceStatusLabels.COMPLETED,
              value: orderStatus.COMPLETED,
            },
            {
              label: maintenanceStatusLabels.CANCELLED,
              value: orderStatus.CANCELLED,
            },
          ]}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <EquipmentAlerts equipment={alerts} />
        <RecentMaintenanceOrders orders={recentOrders} />
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
            <Activity size={22} />
          </div>
          <div>
            <h2 className="font-semibold text-white">Resumen técnico</h2>
            <p className="mt-1 text-sm text-slate-400">
              {alerts.length} equipo(s) requieren seguimiento y {activeOrders}{' '}
              orden(es) siguen abiertas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import { ClipboardList, Download, FileSpreadsheet, FileText, MonitorCog } from 'lucide-react';

import { getErrorMessage } from '../lib/error-message';
import { formatDate } from '../reports/report-utils';
import { reportsService } from '../services/reports.service';
import type {
  EquipmentStatus,
  MaintenanceStatus,
  MaintenanceType,
} from '../types/domain';
import { ActionButton } from '../ui/ActionButton';
import { FilterBar } from '../ui/FilterBar';
import { PageHeader } from '../ui/PageHeader';
import { ResponsiveTable } from '../ui/ResponsiveTable';
import { SectionCard } from '../ui/SectionCard';
import { ErrorState, LoadingState } from '../ui/StateMessage';
import { StatusPill } from '../ui/StatusPill';
import { useToast } from '../ui/ToastProvider';

const equipmentStatusOptions: Array<EquipmentStatus | ''> = [
  '',
  'ACTIVE',
  'IN_MAINTENANCE',
  'OUT_OF_SERVICE',
  'RETIRED',
];

const maintenanceStatusOptions: Array<MaintenanceStatus | ''> = [
  '',
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

const maintenanceTypeOptions: Array<MaintenanceType | ''> = [
  '',
  'PREVENTIVE',
  'CORRECTIVE',
];

function getEquipmentTone(status: EquipmentStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'ACTIVE') return 'success';
  if (status === 'IN_MAINTENANCE') return 'warning';
  if (status === 'OUT_OF_SERVICE') return 'danger';
  return 'neutral';
}

function getMaintenanceTone(
  status: MaintenanceStatus,
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (status === 'COMPLETED') return 'success';
  if (status === 'IN_PROGRESS') return 'info';
  if (status === 'PENDING') return 'warning';
  if (status === 'CANCELLED') return 'danger';
  return 'neutral';
}

export function ReportsPage() {
  const { addToast } = useToast();

  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [equipmentStatus, setEquipmentStatus] = useState<EquipmentStatus | ''>('');
  const [equipmentCreatedFrom, setEquipmentCreatedFrom] = useState('');
  const [equipmentCreatedTo, setEquipmentCreatedTo] = useState('');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState<MaintenanceStatus | ''>('');
  const [orderType, setOrderType] = useState<MaintenanceType | ''>('');
  const [orderCreatedFrom, setOrderCreatedFrom] = useState('');
  const [orderCreatedTo, setOrderCreatedTo] = useState('');

  const [isDownloadingEquipmentCsv, setIsDownloadingEquipmentCsv] = useState(false);
  const [isDownloadingEquipmentXlsx, setIsDownloadingEquipmentXlsx] = useState(false);
  const [isDownloadingOrdersCsv, setIsDownloadingOrdersCsv] = useState(false);
  const [isDownloadingOrdersXlsx, setIsDownloadingOrdersXlsx] = useState(false);

  const equipmentParams = useMemo(
    () => ({
      search: equipmentSearch || undefined,
      status: equipmentStatus || undefined,
      createdFrom: equipmentCreatedFrom || undefined,
      createdTo: equipmentCreatedTo || undefined,
    }),
    [equipmentCreatedFrom, equipmentCreatedTo, equipmentSearch, equipmentStatus],
  );

  const orderParams = useMemo(
    () => ({
      search: orderSearch || undefined,
      status: orderStatus || undefined,
      type: orderType || undefined,
      createdFrom: orderCreatedFrom || undefined,
      createdTo: orderCreatedTo || undefined,
    }),
    [orderCreatedFrom, orderCreatedTo, orderSearch, orderStatus, orderType],
  );

  const summaryQuery = useQuery({
    queryKey: ['reports-summary'],
    queryFn: reportsService.summary,
  });

  const equipmentQuery = useQuery({
    queryKey: ['reports-equipment', equipmentParams],
    queryFn: () => reportsService.equipment(equipmentParams),
  });

  const ordersQuery = useQuery({
    queryKey: ['reports-maintenance-orders', orderParams],
    queryFn: () => reportsService.maintenanceOrders(orderParams),
  });

  const equipment = equipmentQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const summary = summaryQuery.data;

  const activeEquipment = equipment.filter((item) => item.status === 'ACTIVE').length;

  const openOrders = orders.filter(
    (order) => order.status === 'PENDING' || order.status === 'IN_PROGRESS',
  ).length;

  const isLoading =
    summaryQuery.isLoading || equipmentQuery.isLoading || ordersQuery.isLoading;

  const hasError =
    summaryQuery.isError || equipmentQuery.isError || ordersQuery.isError;

  async function handleDownloadEquipmentCsv() {
    setIsDownloadingEquipmentCsv(true);

    try {
      await reportsService.downloadEquipmentCsv(equipmentParams);

      addToast({
        type: 'success',
        title: 'CSV generado',
        description: 'El reporte de equipos fue descargado desde el backend.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'No se pudo descargar el CSV',
        description: getErrorMessage(error),
      });
    } finally {
      setIsDownloadingEquipmentCsv(false);
    }
  }

  async function handleDownloadEquipmentXlsx() {
    setIsDownloadingEquipmentXlsx(true);

    try {
      await reportsService.downloadEquipmentXlsx(equipmentParams);

      addToast({
        type: 'success',
        title: 'Excel generado',
        description: 'El reporte de equipos XLSX fue descargado desde el backend.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'No se pudo descargar el Excel',
        description: getErrorMessage(error),
      });
    } finally {
      setIsDownloadingEquipmentXlsx(false);
    }
  }

  async function handleDownloadOrdersCsv() {
    setIsDownloadingOrdersCsv(true);

    try {
      await reportsService.downloadMaintenanceOrdersCsv(orderParams);

      addToast({
        type: 'success',
        title: 'CSV generado',
        description: 'El reporte de mantenimientos fue descargado desde el backend.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'No se pudo descargar el CSV',
        description: getErrorMessage(error),
      });
    } finally {
      setIsDownloadingOrdersCsv(false);
    }
  }

  async function handleDownloadOrdersXlsx() {
    setIsDownloadingOrdersXlsx(true);

    try {
      await reportsService.downloadMaintenanceOrdersXlsx(orderParams);

      addToast({
        type: 'success',
        title: 'Excel generado',
        description: 'El reporte de mantenimientos XLSX fue descargado desde el backend.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'No se pudo descargar el Excel',
        description: getErrorMessage(error),
      });
    } finally {
      setIsDownloadingOrdersXlsx(false);
    }
  }

  if (isLoading) {
    return (
      <LoadingState
        title="Cargando reportes..."
        description="Consultando métricas y reportes desde Backend Reports API."
      />
    );
  }

  if (hasError) {
    return (
      <ErrorState
        title="No se pudieron cargar los reportes"
        description="Verifica que la API esté activa y que tu sesión siga vigente."
      />
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Backend Reports API"
        title="Reportes"
        description="Reportes operativos generados desde el backend con scoping, filtros, CSV y Excel."
        actions={
          <div className="stitch-card px-4 py-3 text-sm text-[var(--stitch-on-surface-variant)]">
            Generado:{' '}
            <span className="font-bold text-[var(--stitch-on-surface)]">
              {summary?.generatedAt ? new Date(summary.generatedAt).toLocaleString() : '-'}
            </span>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportMetric
          title="Equipos totales"
          value={summary?.equipment.total ?? 0}
          description="Resumen desde /reports/summary"
          icon={MonitorCog}
        />

        <ReportMetric
          title="Equipos filtrados"
          value={equipment.length}
          description={`Activos en filtro: ${activeEquipment}`}
          icon={FileText}
        />

        <ReportMetric
          title="Órdenes totales"
          value={summary?.maintenanceOrders.total ?? 0}
          description="Resumen desde /reports/summary"
          icon={ClipboardList}
        />

        <ReportMetric
          title="Órdenes filtradas"
          value={orders.length}
          description={`Abiertas en filtro: ${openOrders}`}
          icon={FileSpreadsheet}
        />
      </div>

      <SectionCard
        title="Reporte de equipos"
        description="Datos, CSV y Excel generados desde /reports/equipment."
        icon={<MonitorCog size={22} />}
        actions={
          <>
            <ActionButton
              type="button"
              variant="secondary"
              icon={<Download size={18} />}
              onClick={() => void handleDownloadEquipmentCsv()}
              disabled={isDownloadingEquipmentCsv}
            >
              {isDownloadingEquipmentCsv ? 'Descargando...' : 'CSV'}
            </ActionButton>

            <ActionButton
              type="button"
              icon={<FileSpreadsheet size={18} />}
              onClick={() => void handleDownloadEquipmentXlsx()}
              disabled={isDownloadingEquipmentXlsx}
            >
              {isDownloadingEquipmentXlsx ? 'Descargando...' : 'Excel'}
            </ActionButton>
          </>
        }
      >
        <FilterBar className="grid border-0 bg-transparent p-0 shadow-none md:grid-cols-4">
          <label className="block md:col-span-2">
            <span className="stitch-label">Búsqueda</span>
            <input
              className="stitch-input mt-2 px-4 py-3"
              placeholder="Buscar equipo..."
              value={equipmentSearch}
              onChange={(event) => setEquipmentSearch(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="stitch-label">Estado</span>
            <select
              className="stitch-input mt-2 px-4 py-3"
              value={equipmentStatus}
              onChange={(event) =>
                setEquipmentStatus(event.target.value as EquipmentStatus | '')
              }
            >
              {equipmentStatusOptions.map((option) => (
                <option key={option || 'all'} value={option}>
                  {option || 'Todos los estados'}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 md:col-span-4 md:grid-cols-2">
            <label className="block">
              <span className="stitch-label">Creado desde</span>
              <input
                className="stitch-input mt-2 px-4 py-3"
                type="date"
                value={equipmentCreatedFrom}
                onChange={(event) => setEquipmentCreatedFrom(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="stitch-label">Creado hasta</span>
              <input
                className="stitch-input mt-2 px-4 py-3"
                type="date"
                value={equipmentCreatedTo}
                onChange={(event) => setEquipmentCreatedTo(event.target.value)}
              />
            </label>
          </div>
        </FilterBar>

        <div className="mt-5">
          <ResponsiveTable wrapperClassName="rounded-lg">
            <thead>
              <tr>
                <th>Código</th>
                <th>Equipo</th>
                <th>Marca / Modelo</th>
                <th>Sede</th>
                <th>Área</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {equipment.slice(0, 10).map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="stitch-code font-semibold text-[var(--stitch-primary)]">
                      {item.internalCode}
                    </span>
                  </td>
                  <td className="font-semibold text-[var(--stitch-on-surface)]">
                    {item.name}
                  </td>
                  <td className="text-[var(--stitch-on-surface-variant)]">
                    {[item.brand, item.model].filter(Boolean).join(' / ') || '-'}
                  </td>
                  <td className="text-[var(--stitch-on-surface-variant)]">
                    {item.site?.name ?? '-'}
                  </td>
                  <td className="text-[var(--stitch-on-surface-variant)]">
                    {item.area?.name ?? '-'}
                  </td>
                  <td>
                    <StatusPill tone={getEquipmentTone(item.status)}>
                      {item.status}
                    </StatusPill>
                  </td>
                </tr>
              ))}

              {equipment.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-[var(--stitch-outline)]" colSpan={6}>
                    Sin equipos para los filtros seleccionados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </ResponsiveTable>
        </div>

        {equipment.length > 10 ? (
          <p className="mt-3 text-sm text-[var(--stitch-on-surface-variant)]">
            Vista previa limitada a 10 registros. Los archivos backend descargan
            todos los registros filtrados.
          </p>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Reporte de mantenimientos"
        description="Datos, CSV y Excel generados desde /reports/maintenance-orders."
        icon={<ClipboardList size={22} />}
        actions={
          <>
            <ActionButton
              type="button"
              variant="secondary"
              icon={<Download size={18} />}
              onClick={() => void handleDownloadOrdersCsv()}
              disabled={isDownloadingOrdersCsv}
            >
              {isDownloadingOrdersCsv ? 'Descargando...' : 'CSV'}
            </ActionButton>

            <ActionButton
              type="button"
              icon={<FileSpreadsheet size={18} />}
              onClick={() => void handleDownloadOrdersXlsx()}
              disabled={isDownloadingOrdersXlsx}
            >
              {isDownloadingOrdersXlsx ? 'Descargando...' : 'Excel'}
            </ActionButton>
          </>
        }
      >
        <FilterBar className="grid border-0 bg-transparent p-0 shadow-none md:grid-cols-5">
          <label className="block md:col-span-2">
            <span className="stitch-label">Búsqueda</span>
            <input
              className="stitch-input mt-2 px-4 py-3"
              placeholder="Buscar orden o equipo..."
              value={orderSearch}
              onChange={(event) => setOrderSearch(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="stitch-label">Estado</span>
            <select
              className="stitch-input mt-2 px-4 py-3"
              value={orderStatus}
              onChange={(event) =>
                setOrderStatus(event.target.value as MaintenanceStatus | '')
              }
            >
              {maintenanceStatusOptions.map((option) => (
                <option key={option || 'all'} value={option}>
                  {option || 'Estados'}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="stitch-label">Tipo</span>
            <select
              className="stitch-input mt-2 px-4 py-3"
              value={orderType}
              onChange={(event) =>
                setOrderType(event.target.value as MaintenanceType | '')
              }
            >
              {maintenanceTypeOptions.map((option) => (
                <option key={option || 'all'} value={option}>
                  {option || 'Tipos'}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 md:col-span-5 md:grid-cols-2">
            <label className="block">
              <span className="stitch-label">Creado desde</span>
              <input
                className="stitch-input mt-2 px-4 py-3"
                type="date"
                value={orderCreatedFrom}
                onChange={(event) => setOrderCreatedFrom(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="stitch-label">Creado hasta</span>
              <input
                className="stitch-input mt-2 px-4 py-3"
                type="date"
                value={orderCreatedTo}
                onChange={(event) => setOrderCreatedTo(event.target.value)}
              />
            </label>
          </div>
        </FilterBar>

        <div className="mt-5">
          <ResponsiveTable wrapperClassName="rounded-lg">
            <thead>
              <tr>
                <th>Código</th>
                <th>Equipo</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Creación</th>
                <th>Cierre</th>
              </tr>
            </thead>

            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr key={order.id}>
                  <td>
                    <span className="stitch-code font-semibold text-[var(--stitch-primary)]">
                      {order.code}
                    </span>
                  </td>
                  <td className="font-semibold text-[var(--stitch-on-surface)]">
                    {order.equipment?.name ?? '-'}
                  </td>
                  <td>
                    <StatusPill tone="info">{order.type}</StatusPill>
                  </td>
                  <td>
                    <StatusPill tone={getMaintenanceTone(order.status)}>
                      {order.status}
                    </StatusPill>
                  </td>
                  <td className="text-[var(--stitch-on-surface-variant)]">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="text-[var(--stitch-on-surface-variant)]">
                    {formatDate(order.completedAt)}
                  </td>
                </tr>
              ))}

              {orders.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-[var(--stitch-outline)]" colSpan={6}>
                    Sin órdenes para los filtros seleccionados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </ResponsiveTable>
        </div>

        {orders.length > 10 ? (
          <p className="mt-3 text-sm text-[var(--stitch-on-surface-variant)]">
            Vista previa limitada a 10 registros. Los archivos backend descargan
            todos los registros filtrados.
          </p>
        ) : null}
      </SectionCard>
    </section>
  );
}

function ReportMetric({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <article className="stitch-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="stitch-label">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[var(--stitch-on-surface)]">
            {value}
          </p>
          <p className="mt-2 text-sm text-[var(--stitch-on-surface-variant)]">
            {description}
          </p>
        </div>

        <div className="rounded-lg bg-[rgb(0_63_135_/_0.08)] p-3 text-[var(--stitch-primary)]">
          <Icon size={23} />
        </div>
      </div>
    </article>
  );
}

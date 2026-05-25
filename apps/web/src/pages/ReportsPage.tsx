import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Download, FileSpreadsheet, FileText, MonitorCog } from 'lucide-react';

import { getErrorMessage } from '../lib/error-message';
import { ReportMetricCard } from '../reports/ReportMetricCard';
import { formatDate } from '../reports/report-utils';
import { reportsService } from '../services/reports.service';
import type {
  EquipmentStatus,
  MaintenanceStatus,
  MaintenanceType,
} from '../types/domain';
import { ErrorState, LoadingState } from '../ui/StateMessage';
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
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Backend Reports API
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Reportes</h1>
          <p className="mt-2 text-sm text-slate-400">
            Reportes operativos generados desde el backend con scoping, filtros, CSV y Excel.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400">
          Generado: {summary?.generatedAt ? new Date(summary.generatedAt).toLocaleString() : '-'}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportMetricCard
          title="Equipos totales"
          value={summary?.equipment.total ?? 0}
          description="Resumen desde /reports/summary"
          icon={MonitorCog}
        />

        <ReportMetricCard
          title="Equipos filtrados"
          value={equipment.length}
          description={`Activos en filtro: ${activeEquipment}`}
          icon={FileText}
        />

        <ReportMetricCard
          title="Órdenes totales"
          value={summary?.maintenanceOrders.total ?? 0}
          description="Resumen desde /reports/summary"
          icon={ClipboardList}
        />

        <ReportMetricCard
          title="Órdenes filtradas"
          value={orders.length}
          description={`Abiertas en filtro: ${openOrders}`}
          icon={FileSpreadsheet}
        />
      </div>

      <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h2 className="text-lg font-semibold text-white">Reporte de equipos</h2>
            <p className="mt-1 text-sm text-slate-400">
              Datos, CSV y Excel generados desde `/reports/equipment`.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleDownloadEquipmentCsv()}
              disabled={isDownloadingEquipmentCsv}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={18} />
              {isDownloadingEquipmentCsv ? 'Descargando...' : 'CSV'}
            </button>

            <button
              type="button"
              onClick={() => void handleDownloadEquipmentXlsx()}
              disabled={isDownloadingEquipmentXlsx}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileSpreadsheet size={18} />
              {isDownloadingEquipmentXlsx ? 'Descargando...' : 'Excel'}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <input
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 md:col-span-2"
            placeholder="Buscar equipo..."
            value={equipmentSearch}
            onChange={(event) => setEquipmentSearch(event.target.value)}
          />

          <select
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
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

          <div className="grid gap-3 md:col-span-4 md:grid-cols-2">
            <label>
              <span className="text-xs text-slate-400">Creado desde</span>
              <input
                className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                type="date"
                value={equipmentCreatedFrom}
                onChange={(event) => setEquipmentCreatedFrom(event.target.value)}
              />
            </label>

            <label>
              <span className="text-xs text-slate-400">Creado hasta</span>
              <input
                className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                type="date"
                value={equipmentCreatedTo}
                onChange={(event) => setEquipmentCreatedTo(event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Equipo</th>
                <th className="px-4 py-3">Marca / Modelo</th>
                <th className="px-4 py-3">Sede</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {equipment.slice(0, 10).map((item) => (
                <tr key={item.id} className="text-slate-300">
                  <td className="px-4 py-3 font-medium text-white">
                    {item.internalCode}
                  </td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">
                    {[item.brand, item.model].filter(Boolean).join(' / ') || '-'}
                  </td>
                  <td className="px-4 py-3">{item.site?.name ?? '-'}</td>
                  <td className="px-4 py-3">{item.area?.name ?? '-'}</td>
                  <td className="px-4 py-3">{item.status}</td>
                </tr>
              ))}

              {equipment.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                    Sin equipos para los filtros seleccionados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {equipment.length > 10 ? (
          <p className="mt-3 text-sm text-slate-500">
            Vista previa limitada a 10 registros. Los archivos backend descargan
            todos los registros filtrados.
          </p>
        ) : null}
      </article>

      <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Reporte de mantenimientos
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Datos, CSV y Excel generados desde `/reports/maintenance-orders`.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleDownloadOrdersCsv()}
              disabled={isDownloadingOrdersCsv}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={18} />
              {isDownloadingOrdersCsv ? 'Descargando...' : 'CSV'}
            </button>

            <button
              type="button"
              onClick={() => void handleDownloadOrdersXlsx()}
              disabled={isDownloadingOrdersXlsx}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileSpreadsheet size={18} />
              {isDownloadingOrdersXlsx ? 'Descargando...' : 'Excel'}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-5">
          <input
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 md:col-span-2"
            placeholder="Buscar orden o equipo..."
            value={orderSearch}
            onChange={(event) => setOrderSearch(event.target.value)}
          />

          <select
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
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

          <select
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
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

          <div className="grid gap-3 md:col-span-5 md:grid-cols-2">
            <label>
              <span className="text-xs text-slate-400">Creado desde</span>
              <input
                className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                type="date"
                value={orderCreatedFrom}
                onChange={(event) => setOrderCreatedFrom(event.target.value)}
              />
            </label>

            <label>
              <span className="text-xs text-slate-400">Creado hasta</span>
              <input
                className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                type="date"
                value={orderCreatedTo}
                onChange={(event) => setOrderCreatedTo(event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Equipo</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Creación</th>
                <th className="px-4 py-3">Cierre</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {orders.slice(0, 10).map((order) => (
                <tr key={order.id} className="text-slate-300">
                  <td className="px-4 py-3 font-medium text-white">{order.code}</td>
                  <td className="px-4 py-3">{order.equipment?.name ?? '-'}</td>
                  <td className="px-4 py-3">{order.type}</td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">{formatDate(order.completedAt)}</td>
                </tr>
              ))}

              {orders.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                    Sin órdenes para los filtros seleccionados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {orders.length > 10 ? (
          <p className="mt-3 text-sm text-slate-500">
            Vista previa limitada a 10 registros. Los archivos backend descargan
            todos los registros filtrados.
          </p>
        ) : null}
      </article>
    </section>
  );
}

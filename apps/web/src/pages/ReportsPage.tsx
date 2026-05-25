import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Download, FileText, MonitorCog } from 'lucide-react';

import { ReportMetricCard } from '../reports/ReportMetricCard';
import {
  downloadCsv,
  formatDate,
  formatDateTime,
  isDateInsideRange,
  toCsv,
} from '../reports/report-utils';
import { equipmentService } from '../services/equipment.service';
import { maintenanceOrdersService } from '../services/maintenance-orders.service';
import type {
  EquipmentStatus,
  MaintenanceStatus,
  MaintenanceType,
} from '../types/domain';

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
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [equipmentStatus, setEquipmentStatus] = useState<EquipmentStatus | ''>('');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState<MaintenanceStatus | ''>('');
  const [orderType, setOrderType] = useState<MaintenanceType | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const equipmentQuery = useQuery({
    queryKey: ['equipment'],
    queryFn: () => equipmentService.findAll(),
  });

  const ordersQuery = useQuery({
    queryKey: ['maintenance-orders'],
    queryFn: () => maintenanceOrdersService.findAll(),
  });

  const equipment = equipmentQuery.data ?? [];
  const orders = ordersQuery.data ?? [];

  const filteredEquipment = useMemo(() => {
    const normalizedSearch = equipmentSearch.trim().toLowerCase();

    return equipment.filter((item) => {
      const matchesStatus = equipmentStatus ? item.status === equipmentStatus : true;

      const searchableText = [
        item.internalCode,
        item.name,
        item.brand,
        item.model,
        item.serialNumber,
        item.equipmentType,
        item.site?.name,
        item.area?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = normalizedSearch
        ? searchableText.includes(normalizedSearch)
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [equipment, equipmentSearch, equipmentStatus]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = orderSearch.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = orderStatus ? order.status === orderStatus : true;
      const matchesType = orderType ? order.type === orderType : true;

      const matchesDate = isDateInsideRange({
        value: order.createdAt,
        from: dateFrom,
        to: dateTo,
      });

      const searchableText = [
        order.code,
        order.type,
        order.status,
        order.equipment?.name,
        order.equipment?.internalCode,
        order.assignedTo?.name,
        order.diagnosis,
        order.actionsPerformed,
        order.recommendations,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = normalizedSearch
        ? searchableText.includes(normalizedSearch)
        : true;

      return matchesStatus && matchesType && matchesDate && matchesSearch;
    });
  }, [dateFrom, dateTo, orderSearch, orderStatus, orderType, orders]);

  const activeEquipment = filteredEquipment.filter(
    (item) => item.status === 'ACTIVE',
  ).length;

  const openOrders = filteredOrders.filter(
    (order) => order.status === 'PENDING' || order.status === 'IN_PROGRESS',
  ).length;

  function exportEquipmentCsv() {
    const csv = toCsv(
      [
        'Codigo interno',
        'Nombre',
        'Marca',
        'Modelo',
        'Serial',
        'Tipo',
        'Riesgo',
        'Estado',
        'Sede',
        'Area',
        'Fecha creacion',
      ],
      filteredEquipment.map((item) => [
        item.internalCode,
        item.name,
        item.brand,
        item.model,
        item.serialNumber,
        item.equipmentType,
        item.riskLevel,
        item.status,
        item.site?.name,
        item.area?.name,
        formatDateTime(item.createdAt),
      ]),
    );

    downloadCsv('reporte-equipos.csv', csv);
  }

  function exportOrdersCsv() {
    const csv = toCsv(
      [
        'Codigo',
        'Equipo',
        'Codigo equipo',
        'Tipo',
        'Estado',
        'Tecnico',
        'Diagnostico',
        'Acciones',
        'Recomendaciones',
        'Creacion',
        'Inicio',
        'Finalizacion',
      ],
      filteredOrders.map((order) => [
        order.code,
        order.equipment?.name,
        order.equipment?.internalCode,
        order.type,
        order.status,
        order.assignedTo?.name,
        order.diagnosis,
        order.actionsPerformed,
        order.recommendations,
        formatDateTime(order.createdAt),
        formatDateTime(order.startedAt),
        formatDateTime(order.completedAt),
      ]),
    );

    downloadCsv('reporte-mantenimientos.csv', csv);
  }

  const isLoading = equipmentQuery.isLoading || ordersQuery.isLoading;

  if (isLoading) {
    return <p className="text-slate-400">Cargando reportes...</p>;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Exportación inicial
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Reportes</h1>
          <p className="mt-2 text-sm text-slate-400">
            Reportes operativos en CSV para equipos y órdenes de mantenimiento.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportMetricCard
          title="Equipos filtrados"
          value={filteredEquipment.length}
          description="Según búsqueda y estado"
          icon={MonitorCog}
        />

        <ReportMetricCard
          title="Equipos activos"
          value={activeEquipment}
          description="Dentro del resultado filtrado"
          icon={FileText}
        />

        <ReportMetricCard
          title="Órdenes filtradas"
          value={filteredOrders.length}
          description="Según búsqueda, tipo, estado y fecha"
          icon={ClipboardList}
        />

        <ReportMetricCard
          title="Órdenes abiertas"
          value={openOrders}
          description="Pendientes o en progreso"
          icon={FileText}
        />
      </div>

      <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h2 className="text-lg font-semibold text-white">Reporte de equipos</h2>
            <p className="mt-1 text-sm text-slate-400">
              Exporta inventario filtrado por estado y búsqueda.
            </p>
          </div>

          <button
            type="button"
            onClick={exportEquipmentCsv}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <Download size={18} />
            Exportar equipos CSV
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
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
              {filteredEquipment.slice(0, 10).map((item) => (
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

              {filteredEquipment.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                    Sin equipos para los filtros seleccionados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {filteredEquipment.length > 10 ? (
          <p className="mt-3 text-sm text-slate-500">
            Vista previa limitada a 10 registros. El CSV exporta todos los registros
            filtrados.
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
              Exporta órdenes filtradas por estado, tipo, fecha y búsqueda.
            </p>
          </div>

          <button
            type="button"
            onClick={exportOrdersCsv}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <Download size={18} />
            Exportar órdenes CSV
          </button>
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
              <span className="text-xs text-slate-400">Desde</span>
              <input
                className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </label>

            <label>
              <span className="text-xs text-slate-400">Hasta</span>
              <input
                className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
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
              {filteredOrders.slice(0, 10).map((order) => (
                <tr key={order.id} className="text-slate-300">
                  <td className="px-4 py-3 font-medium text-white">{order.code}</td>
                  <td className="px-4 py-3">{order.equipment?.name ?? '-'}</td>
                  <td className="px-4 py-3">{order.type}</td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">{formatDate(order.completedAt)}</td>
                </tr>
              ))}

              {filteredOrders.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                    Sin órdenes para los filtros seleccionados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {filteredOrders.length > 10 ? (
          <p className="mt-3 text-sm text-slate-500">
            Vista previa limitada a 10 registros. El CSV exporta todos los registros
            filtrados.
          </p>
        ) : null}
      </article>
    </section>
  );
}

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, ShieldCheck, X } from 'lucide-react';

import { useAuth } from '../auth/useAuth';
import type { AuditLog } from '../services/audit-logs.service';
import { auditLogsService } from '../services/audit-logs.service';
import { ActionButton } from '../ui/ActionButton';
import { FilterBar } from '../ui/FilterBar';
import { PageHeader } from '../ui/PageHeader';
import { ResponsiveTable } from '../ui/ResponsiveTable';
import { SectionCard } from '../ui/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '../ui/StateMessage';
import { StatusPill } from '../ui/StatusPill';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function formatJson(value: unknown) {
  if (value === null || value === undefined) {
    return '-';
  }

  return JSON.stringify(value, null, 2);
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

export function AuditLogsPage() {
  const { user } = useAuth();

  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [entityId, setEntityId] = useState('');
  const [userId, setUserId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const canViewAuditLogs =
    user?.role === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'VIEWER';

  const params = useMemo(
    () => ({
      action: action || undefined,
      entity: entity || undefined,
      entityId: entityId || undefined,
      userId: userId || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [action, entity, entityId, from, to, userId],
  );

  const auditLogsQuery = useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditLogsService.findAll(params),
    enabled: canViewAuditLogs,
  });

  const logs = auditLogsQuery.data ?? [];

  function clearFilters() {
    setAction('');
    setEntity('');
    setEntityId('');
    setUserId('');
    setFrom('');
    setTo('');
  }

  if (!canViewAuditLogs) {
    return (
      <ErrorState
        title="Acceso restringido"
        description="Solo ADMIN, SUPER_ADMIN y VIEWER pueden consultar auditoría."
      />
    );
  }

  if (auditLogsQuery.isLoading) {
    return (
      <LoadingState
        title="Cargando auditoría..."
        description="Consultando eventos críticos del sistema."
      />
    );
  }

  if (auditLogsQuery.isError) {
    return (
      <ErrorState
        title="No se pudo cargar la auditoría"
        description="Verifica la sesión, permisos y estado de la API."
      />
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Trazabilidad"
        title="Auditoría"
        description="Consulta eventos críticos: adjuntos, reportes, equipos y acciones auditables."
        actions={
          <div className="stitch-card px-4 py-3 text-sm text-[var(--stitch-on-surface-variant)]">
            Eventos encontrados:{' '}
            <span className="font-bold text-[var(--stitch-on-surface)]">
              {logs.length}
            </span>
          </div>
        }
      />

      <SectionCard
        title="Filtros"
        description="Los filtros se aplican contra el backend."
        icon={<ShieldCheck size={22} />}
        actions={
          <ActionButton
            type="button"
            variant="secondary"
            onClick={clearFilters}
          >
            Limpiar filtros
          </ActionButton>
        }
      >
        <FilterBar className="grid border-0 bg-transparent p-0 shadow-none md:grid-cols-3">
          <label className="block">
            <span className="stitch-label">Acción</span>
            <input
              className="stitch-input mt-2 px-4 py-3"
              placeholder="REPORT_PDF_EXPORTED"
              value={action}
              onChange={(event) => setAction(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="stitch-label">Entidad</span>
            <input
              className="stitch-input mt-2 px-4 py-3"
              placeholder="MaintenanceOrder"
              value={entity}
              onChange={(event) => setEntity(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="stitch-label">Entity ID</span>
            <input
              className="stitch-input mt-2 px-4 py-3"
              placeholder="ID de entidad"
              value={entityId}
              onChange={(event) => setEntityId(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="stitch-label">User ID</span>
            <input
              className="stitch-input mt-2 px-4 py-3"
              placeholder="ID de usuario"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="stitch-label">Desde</span>
            <input
              className="stitch-input mt-2 px-4 py-3"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="stitch-label">Hasta</span>
            <input
              className="stitch-input mt-2 px-4 py-3"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>
        </FilterBar>
      </SectionCard>

      {logs.length > 0 ? (
        <div className="grid gap-3 lg:hidden">
          <p className="sr-only">Vista móvil de auditoría</p>

          {logs.map((log) => (
            <article key={log.id} className="stitch-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <StatusPill tone={getAuditTone(log.action)}>
                    {log.action}
                  </StatusPill>

                  <p className="mt-3 text-sm font-semibold text-[var(--stitch-on-surface)]">
                    {log.entity}
                  </p>

                  <p className="stitch-code mt-1 break-all text-xs text-[var(--stitch-outline)]">
                    {log.entityId}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLog(log)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[var(--stitch-outline-variant)] px-3 py-2 text-xs font-bold text-[var(--stitch-primary)] transition hover:bg-[rgb(0_63_135_/_0.06)]"
                >
                  <Eye size={15} />
                  JSON
                </button>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-[var(--stitch-on-surface-variant)]">
                <p>
                  <span className="text-[var(--stitch-outline)]">Fecha:</span>{' '}
                  {formatDate(log.createdAt)}
                </p>

                <p>
                  <span className="text-[var(--stitch-outline)]">Usuario:</span>{' '}
                  {log.user?.name ?? '-'}
                </p>

                <p className="break-all">
                  <span className="text-[var(--stitch-outline)]">Email:</span>{' '}
                  {log.user?.email ?? '-'}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {logs.length === 0 ? (
        <EmptyState
          title="Sin eventos"
          description="No hay eventos de auditoría para los filtros seleccionados."
        />
      ) : (
        <article className="hidden lg:block">
          <ResponsiveTable wrapperClassName="shadow-xl">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Acción</th>
                <th>Entidad</th>
                <th>Entity ID</th>
                <th>Usuario</th>
                <th className="text-right">Detalle</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="text-[var(--stitch-on-surface-variant)]">
                    {formatDate(log.createdAt)}
                  </td>

                  <td>
                    <StatusPill tone={getAuditTone(log.action)}>
                      {log.action}
                    </StatusPill>
                  </td>

                  <td className="font-medium text-[var(--stitch-on-surface)]">
                    {log.entity}
                  </td>

                  <td className="stitch-code text-xs text-[var(--stitch-outline)]">
                    {log.entityId}
                  </td>

                  <td>
                    <p className="font-medium text-[var(--stitch-on-surface)]">
                      {log.user?.name ?? '-'}
                    </p>
                    <p className="text-xs text-[var(--stitch-outline)]">
                      {log.user?.email ?? '-'}
                    </p>
                  </td>

                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--stitch-outline-variant)] px-3 py-2 text-xs font-bold text-[var(--stitch-primary)] transition hover:bg-[rgb(0_63_135_/_0.06)]"
                    >
                      <Eye size={15} />
                      Ver JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </ResponsiveTable>
        </article>
      )}

      {selectedLog ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 px-4 backdrop-blur-sm">
          <section className="stitch-card max-h-[85vh] w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="stitch-card-header flex items-start justify-between gap-4 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--stitch-on-surface)]">
                  Detalle de auditoría
                </h2>
                <p className="mt-1 text-sm text-[var(--stitch-on-surface-variant)]">
                  {selectedLog.action} · {selectedLog.entity}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg border border-[var(--stitch-outline-variant)] p-2 text-[var(--stitch-on-surface-variant)] transition hover:bg-[var(--stitch-surface-container)] hover:text-[var(--stitch-primary)]"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-5 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-[var(--stitch-on-surface)]">
                  oldValue
                </h3>
                <pre className="stitch-code overflow-auto rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] p-4 text-xs text-[var(--stitch-on-surface-variant)]">
                  {formatJson(selectedLog.oldValue)}
                </pre>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-[var(--stitch-on-surface)]">
                  newValue
                </h3>
                <pre className="stitch-code overflow-auto rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] p-4 text-xs text-[var(--stitch-on-surface-variant)]">
                  {formatJson(selectedLog.newValue)}
                </pre>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

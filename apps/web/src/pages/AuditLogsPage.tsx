import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, ShieldCheck } from 'lucide-react';

import { useAuth } from '../auth/useAuth';
import type { AuditLog } from '../services/audit-logs.service';
import { auditLogsService } from '../services/audit-logs.service';
import { PageHeader } from '../ui/PageHeader';
import { SectionCard } from '../ui/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '../ui/StateMessage';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function formatJson(value: unknown) {
  if (value === null || value === undefined) {
    return '-';
  }

  return JSON.stringify(value, null, 2);
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
    user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

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

  if (!canViewAuditLogs) {
    return (
      <ErrorState
        title="Acceso restringido"
        description="Solo ADMIN y SUPER_ADMIN pueden consultar auditoría."
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
        description="Consulta eventos críticos: adjuntos, reportes y acciones auditables."
        actions={
          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400">
            Eventos encontrados: <span className="font-semibold text-white">{logs.length}</span>
          </div>
        }
      />

      <SectionCard>
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-white">Filtros</h2>
            <p className="text-sm text-slate-400">
              Los filtros se aplican contra el backend.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            placeholder="Acción: REPORT_PDF_EXPORTED"
            value={action}
            onChange={(event) => setAction(event.target.value)}
          />

          <input
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            placeholder="Entidad: MaintenanceOrder"
            value={entity}
            onChange={(event) => setEntity(event.target.value)}
          />

          <input
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            placeholder="Entity ID"
            value={entityId}
            onChange={(event) => setEntityId(event.target.value)}
          />

          <input
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            placeholder="User ID"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />

          <label>
            <span className="text-xs text-slate-400">Desde</span>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>

          <label>
            <span className="text-xs text-slate-400">Hasta</span>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={() => {
            setAction('');
            setEntity('');
            setEntityId('');
            setUserId('');
            setFrom('');
            setTo('');
          }}
          className="mt-4 rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
        >
          Limpiar filtros
        </button>
      </SectionCard>

      {logs.length === 0 ? (
        <EmptyState
          title="Sin eventos"
          description="No hay registros de auditoría para los filtros seleccionados."
        />
      ) : (
        <article className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Acción</th>
                  <th className="px-4 py-3">Entidad</th>
                  <th className="px-4 py-3">Entity ID</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3 text-right">Detalle</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="text-slate-300">
                    <td className="px-4 py-3">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">{log.entity}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {log.entityId}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{log.user?.name ?? '-'}</p>
                      <p className="text-xs text-slate-500">{log.user?.email ?? '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
                      >
                        <Eye size={15} />
                        Ver JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {selectedLog ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/80 px-4 backdrop-blur">
          <section className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Detalle de auditoría
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedLog.action} · {selectedLog.entity}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>

            <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-5 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-white">
                  oldValue
                </h3>
                <pre className="overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300">
                  {formatJson(selectedLog.oldValue)}
                </pre>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-white">
                  newValue
                </h3>
                <pre className="overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300">
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

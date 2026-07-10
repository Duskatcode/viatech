import { Search, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { companyMembershipsService } from '../services/company-memberships.service';
import type { AssignableUser, SiteRef } from '../types/domain';

const roleLabels: Record<string, string> = {
  TECHNICIAN: 'Técnico',
  VIEWER: 'Visualizador',
};

interface LinkTechnicianModalProps {
  sites: SiteRef[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: { userId: string; siteId?: string }) => Promise<void>;
}

export function LinkTechnicianModal({
  sites,
  isSubmitting,
  onClose,
  onSubmit,
}: LinkTechnicianModalProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AssignableUser | null>(
    null,
  );
  const [siteId, setSiteId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(handle);
  }, [search]);

  const canSearch = debouncedSearch.length >= 2;

  const searchQuery = useQuery({
    queryKey: ['assignable-users', debouncedSearch],
    queryFn: () =>
      companyMembershipsService.searchAssignableUsers(debouncedSearch),
    enabled: canSearch,
  });

  const results = searchQuery.data ?? [];

  async function handleSubmit() {
    if (!selectedUser) {
      setError('Selecciona un usuario de la lista.');
      return;
    }

    setError(null);

    await onSubmit({
      userId: selectedUser.id,
      siteId: siteId || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/80 px-4 backdrop-blur">
      <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Vincular técnico o visualizador
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Busca un usuario ya existente en el sistema (de cualquier
              empresa) y vincúlalo a la tuya. No crea un usuario nuevo.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 disabled:opacity-60"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <label className="block">
          <span className="text-sm text-slate-300">
            Buscar por nombre o email
          </span>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3">
            <Search size={16} className="text-slate-500" />
            <input
              className="w-full border-0 bg-transparent p-0 text-sm text-white outline-none focus:ring-0"
              placeholder="Ej. Ana Torres"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelectedUser(null);
              }}
            />
          </div>
        </label>

        <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          {!canSearch ? (
            <p className="px-1 py-3 text-sm text-slate-500">
              Escribe al menos 2 caracteres para buscar.
            </p>
          ) : searchQuery.isFetching ? (
            <p className="px-1 py-3 text-sm text-slate-500">Buscando...</p>
          ) : results.length === 0 ? (
            <p className="px-1 py-3 text-sm text-slate-500">
              No se encontraron técnicos ni visualizadores con ese criterio.
            </p>
          ) : (
            results.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => setSelectedUser(candidate)}
                className={[
                  'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition',
                  selectedUser?.id === candidate.id
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/60',
                ].join(' ')}
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {candidate.name}
                  </p>
                  <p className="text-xs text-slate-400">{candidate.email}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                  {roleLabels[candidate.role] ?? candidate.role}
                </span>
              </button>
            ))
          )}
        </div>

        {selectedUser && sites.length > 0 ? (
          <label className="mt-4 block">
            <span className="text-sm text-slate-300">
              Sede (opcional — si se omite, aplica a toda la empresa)
            </span>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              value={siteId}
              onChange={(event) => setSiteId(event.target.value)}
            >
              <option value="">Toda la empresa</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-2xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedUser}
            className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserPlus size={16} />
            {isSubmitting ? 'Vinculando...' : 'Vincular'}
          </button>
        </div>
      </section>
    </div>
  );
}

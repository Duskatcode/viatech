import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EquipmentFormModal } from '../equipment/EquipmentFormModal';
import { EquipmentStatusBadge } from '../equipment/EquipmentStatusBadge';
import { EquipmentStatusModal } from '../equipment/EquipmentStatusModal';
import { getErrorMessage } from '../lib/error-message';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useToast } from '../ui/ToastProvider';
import { equipmentService } from '../services/equipment.service';
import { organizationService } from '../services/organization.service';
import type {
  CreateEquipmentPayload,
  Equipment,
  EquipmentStatus,
  QueryEquipmentParams,
  UpdateEquipmentPayload,
  UpdateEquipmentStatusPayload,
} from '../types/domain';

const statusOptions: Array<EquipmentStatus | ''> = [
  '',
  'ACTIVE',
  'IN_MAINTENANCE',
  'OUT_OF_SERVICE',
  'RETIRED',
];

export function EquipmentPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [siteId, setSiteId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [status, setStatus] = useState<EquipmentStatus | ''>('');
  const [formEquipment, setFormEquipment] = useState<Equipment | null | undefined>();
  const [statusEquipment, setStatusEquipment] = useState<Equipment | null>(null);
  const [equipmentToRetire, setEquipmentToRetire] = useState<Equipment | null>(null);

  const filters = useMemo<QueryEquipmentParams>(
    () => ({
      search: search || undefined,
      siteId: siteId || undefined,
      areaId: areaId || undefined,
      status: status || undefined,
    }),
    [areaId, search, siteId, status],
  );

  const equipmentQuery = useQuery({
    queryKey: ['equipment', filters],
    queryFn: () => equipmentService.findAll(filters),
  });

  const sitesQuery = useQuery({
    queryKey: ['sites'],
    queryFn: organizationService.sites,
  });

  const areasQuery = useQuery({
    queryKey: ['areas'],
    queryFn: organizationService.areas,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateEquipmentPayload) => equipmentService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setFormEquipment(undefined);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEquipmentPayload;
    }) => equipmentService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setFormEquipment(undefined);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEquipmentStatusPayload;
    }) => equipmentService.updateStatus(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setStatusEquipment(null);
    },
  });

  const retireMutation = useMutation({
    mutationFn: (id: string) => equipmentService.retire(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setEquipmentToRetire(null);
      addToast({
        type: 'success',
        title: 'Equipo retirado',
        description: 'El equipo fue marcado como RETIRED.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo retirar el equipo',
        description: getErrorMessage(error),
      });
    },
  });

  const equipment = equipmentQuery.data ?? [];
  const sites = sitesQuery.data ?? [];
  const areas = areasQuery.data ?? [];

  async function handleFormSubmit(
    payload: CreateEquipmentPayload | UpdateEquipmentPayload,
  ) {
    if (formEquipment?.id) {
      await updateMutation.mutateAsync({
        id: formEquipment.id,
        payload,
      });
      return;
    }

    await createMutation.mutateAsync(payload as CreateEquipmentPayload);
  }

  async function handleStatusSubmit(payload: UpdateEquipmentStatusPayload) {
    if (!statusEquipment) return;

    await statusMutation.mutateAsync({
      id: statusEquipment.id,
      payload,
    });
  }

  async function handleRetire() {
    if (!equipmentToRetire) return;

    await retireMutation.mutateAsync(equipmentToRetire.id);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-white">Equipos</h1>
          <p className="mt-1 text-sm text-slate-400">
            Inventario biomédico con creación, edición, filtros y hoja de vida.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormEquipment(null)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          <Plus size={18} />
          Nuevo equipo
        </button>
      </div>

      <div className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-4">
        <input
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          placeholder="Buscar por código, nombre, marca..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          value={siteId}
          onChange={(event) => setSiteId(event.target.value)}
        >
          <option value="">Todas las sedes</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>

        <select
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          value={areaId}
          onChange={(event) => setAreaId(event.target.value)}
        >
          <option value="">Todas las áreas</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>

        <select
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          value={status}
          onChange={(event) => setStatus(event.target.value as EquipmentStatus | '')}
        >
          {statusOptions.map((option) => (
            <option key={option || 'all'} value={option}>
              {option || 'Todos los estados'}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-950 text-slate-400">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Marca / Modelo</th>
              <th className="px-4 py-3">Sede</th>
              <th className="px-4 py-3">Área</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {equipment.map((item) => (
              <tr key={item.id} className="text-slate-300">
                <td className="px-4 py-3 font-medium text-white">{item.internalCode}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">
                  {[item.brand, item.model].filter(Boolean).join(' / ') || '-'}
                </td>
                <td className="px-4 py-3">{item.site?.name ?? '-'}</td>
                <td className="px-4 py-3">{item.area?.name ?? '-'}</td>
                <td className="px-4 py-3">
                  <EquipmentStatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/equipment/${item.id}`}
                      className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                      title="Ver hoja de vida"
                    >
                      <Eye size={16} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setFormEquipment(item)}
                      className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatusEquipment(item)}
                      className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                      title="Cambiar estado"
                    >
                      <RotateCcw size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setEquipmentToRetire(item)}
                      className="rounded-xl border border-red-500/30 p-2 text-red-300 transition hover:bg-red-500/10"
                      title="Retirar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {equipment.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>
                  No hay equipos para los filtros seleccionados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {formEquipment !== undefined ? (
        <EquipmentFormModal
          equipment={formEquipment}
          sites={sites}
          areas={areas}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onClose={() => setFormEquipment(undefined)}
          onSubmit={handleFormSubmit}
        />
      ) : null}

      {statusEquipment ? (
        <EquipmentStatusModal
          equipment={statusEquipment}
          isSubmitting={statusMutation.isPending}
          onClose={() => setStatusEquipment(null)}
          onSubmit={handleStatusSubmit}
        />
      ) : null}
      {equipmentToRetire ? (
        <ConfirmModal
          title="Retirar equipo"
          description={`El equipo "${equipmentToRetire.name}" quedará marcado como RETIRED. Esta acción no borra el historial.`}
          confirmLabel="Retirar equipo"
          variant="danger"
          isSubmitting={retireMutation.isPending}
          onCancel={() => setEquipmentToRetire(null)}
          onConfirm={handleRetire}
        />
      ) : null}

    </section>
  );
}

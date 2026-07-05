import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { EquipmentFormModal } from '../equipment/EquipmentFormModal';
import { EquipmentStatusBadge } from '../equipment/EquipmentStatusBadge';
import { EquipmentStatusModal } from '../equipment/EquipmentStatusModal';
import { getErrorMessage } from '../lib/error-message';
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
import { ActionButton } from '../ui/ActionButton';
import { ConfirmModal } from '../ui/ConfirmModal';
import { FilterBar } from '../ui/FilterBar';
import { PageHeader } from '../ui/PageHeader';
import { ResponsiveTable } from '../ui/ResponsiveTable';
import { useToast } from '../ui/useToast';

const statusOptions: Array<EquipmentStatus | ''> = [
  '',
  'ACTIVE',
  'IN_MAINTENANCE',
  'OUT_OF_SERVICE',
  'RETIRED',
];

export function EquipmentPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const canManageEquipment =
    user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const [search, setSearch] = useState('');
  const [siteId, setSiteId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [status, setStatus] = useState<EquipmentStatus | ''>('');
  const [formEquipment, setFormEquipment] = useState<
    Equipment | null | undefined
  >();
  const [statusEquipment, setStatusEquipment] = useState<Equipment | null>(
    null,
  );
  const [equipmentToRetire, setEquipmentToRetire] = useState<Equipment | null>(
    null,
  );

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
    mutationFn: (payload: CreateEquipmentPayload) =>
      equipmentService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setFormEquipment(undefined);
      addToast({
        type: 'success',
        title: 'Equipo creado',
        description: 'El equipo fue agregado al inventario biomédico.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo crear el equipo',
        description: getErrorMessage(error),
      });
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
      addToast({
        type: 'success',
        title: 'Equipo actualizado',
        description: 'Los cambios del equipo fueron guardados.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo actualizar el equipo',
        description: getErrorMessage(error),
      });
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
      addToast({
        type: 'success',
        title: 'Estado actualizado',
        description: 'El estado técnico del equipo fue guardado.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo cambiar el estado',
        description: getErrorMessage(error),
      });
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
      <PageHeader
        eyebrow="Inventario biomédico"
        title="Equipos"
        description="Inventario clínico con creación, edición, filtros, estado técnico y hoja de vida."
        actions={
          canManageEquipment ? (
            <ActionButton
              type="button"
              icon={<Plus size={18} />}
              onClick={() => setFormEquipment(null)}
            >
              Nuevo equipo
            </ActionButton>
          ) : undefined
        }
      />

      <FilterBar className="grid md:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className="stitch-label">Búsqueda</span>
          <input
            className="stitch-input mt-2 px-4 py-3"
            placeholder="Buscar por código, nombre, marca..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="stitch-label">Sede</span>
          <select
            className="stitch-input mt-2 px-4 py-3"
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
        </label>

        <label className="block">
          <span className="stitch-label">Área</span>
          <select
            className="stitch-input mt-2 px-4 py-3"
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
        </label>

        <label className="block">
          <span className="stitch-label">Estado</span>
          <select
            className="stitch-input mt-2 px-4 py-3"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as EquipmentStatus | '')
            }
          >
            {statusOptions.map((option) => (
              <option key={option || 'all'} value={option}>
                {option || 'Todos los estados'}
              </option>
            ))}
          </select>
        </label>
      </FilterBar>

      <ResponsiveTable wrapperClassName="shadow-xl">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Marca / Modelo</th>
            <th>Sede</th>
            <th>Área</th>
            <th>Estado</th>
            <th className="text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {equipment.map((item) => (
            <tr key={item.id}>
              <td>
                <span className="stitch-code font-semibold text-[var(--stitch-primary)]">
                  {item.internalCode}
                </span>
              </td>

              <td>
                <p className="font-semibold text-[var(--stitch-on-surface)]">
                  {item.name}
                </p>
                <p className="mt-1 text-xs text-[var(--stitch-outline)]">
                  {item.equipmentType ?? 'Tipo no definido'}
                </p>
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
                <EquipmentStatusBadge status={item.status} />
              </td>

              <td>
                <div className="flex justify-end gap-2">
                  <Link
                    to={`/equipment/${item.id}`}
                    className="rounded-lg border border-[var(--stitch-outline-variant)] p-2 text-[var(--stitch-on-surface-variant)] transition hover:border-[var(--stitch-primary)] hover:bg-[rgb(0_63_135_/_0.06)] hover:text-[var(--stitch-primary)]"
                    title="Ver hoja de vida"
                  >
                    <Eye size={16} />
                  </Link>

                  {canManageEquipment ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setFormEquipment(item)}
                        className="rounded-lg border border-[var(--stitch-outline-variant)] p-2 text-[var(--stitch-on-surface-variant)] transition hover:border-[var(--stitch-primary)] hover:bg-[rgb(0_63_135_/_0.06)] hover:text-[var(--stitch-primary)]"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setStatusEquipment(item)}
                        className="rounded-lg border border-[var(--stitch-outline-variant)] p-2 text-[var(--stitch-on-surface-variant)] transition hover:border-[var(--stitch-primary)] hover:bg-[rgb(0_63_135_/_0.06)] hover:text-[var(--stitch-primary)]"
                        title="Cambiar estado"
                      >
                        <RotateCcw size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEquipmentToRetire(item)}
                        className="rounded-lg border border-[var(--stitch-danger-border)] p-2 text-[var(--stitch-danger-text)] transition hover:bg-[var(--stitch-danger-bg)]"
                        title="Retirar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}

          {equipment.length === 0 ? (
            <tr>
              <td
                className="px-4 py-8 text-center text-[var(--stitch-outline)]"
                colSpan={7}
              >
                No hay equipos con los filtros actuales.
              </td>
            </tr>
          ) : null}
        </tbody>
      </ResponsiveTable>

      {canManageEquipment && formEquipment !== undefined ? (
        <EquipmentFormModal
          equipment={formEquipment}
          sites={sites}
          areas={areas}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onClose={() => setFormEquipment(undefined)}
          onSubmit={handleFormSubmit}
        />
      ) : null}

      {canManageEquipment && statusEquipment ? (
        <EquipmentStatusModal
          equipment={statusEquipment}
          isSubmitting={statusMutation.isPending}
          onClose={() => setStatusEquipment(null)}
          onSubmit={handleStatusSubmit}
        />
      ) : null}

      {canManageEquipment && equipmentToRetire ? (
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

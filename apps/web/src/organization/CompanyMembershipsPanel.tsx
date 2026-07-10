import { Link2, Unlink } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { companyMembershipsService } from '../services/company-memberships.service';
import type { CompanyMembership, SiteRef } from '../types/domain';
import { ActionButton } from '../ui/ActionButton';
import { ConfirmModal } from '../ui/ConfirmModal';
import { ResponsiveTable } from '../ui/ResponsiveTable';
import { EmptyState, ErrorState, LoadingState } from '../ui/StateMessage';
import { StatusPill } from '../ui/StatusPill';
import { SectionCard } from '../ui/SectionCard';
import { useToast } from '../ui/useToast';
import { LinkTechnicianModal } from './LinkTechnicianModal';

const roleLabels: Record<string, string> = {
  TECHNICIAN: 'Técnico',
  VIEWER: 'Visualizador',
};

interface CompanyMembershipsPanelProps {
  companyId: string;
  sites: SiteRef[];
}

export function CompanyMembershipsPanel({
  companyId,
  sites,
}: CompanyMembershipsPanelProps) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [membershipToRevoke, setMembershipToRevoke] =
    useState<CompanyMembership | null>(null);

  const membershipsQuery = useQuery({
    queryKey: ['company-memberships', companyId],
    queryFn: () => companyMembershipsService.findAll(companyId),
    enabled: Boolean(companyId),
  });

  const createMutation = useMutation({
    mutationFn: (values: { userId: string; siteId?: string }) =>
      companyMembershipsService.create({ ...values, companyId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['company-memberships', companyId],
      });
      setShowLinkModal(false);
      addToast({
        type: 'success',
        title: 'Usuario vinculado',
        description: 'El técnico/visualizador ya tiene acceso a esta empresa.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo vincular',
        description: getMembershipErrorMessage(error),
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (membership: CompanyMembership) =>
      companyMembershipsService.revoke(membership.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['company-memberships', companyId],
      });
      setMembershipToRevoke(null);
      addToast({
        type: 'success',
        title: 'Vinculación revocada',
        description: 'El usuario ya no tiene acceso a esta empresa.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo revocar',
        description: getMembershipErrorMessage(error),
      });
    },
  });

  const memberships = membershipsQuery.data ?? [];
  const activeMemberships = memberships.filter(
    (item) => item.status === 'ACTIVE',
  );

  return (
    <SectionCard
      title="Técnicos y visualizadores vinculados"
      description={`${activeMemberships.length} vinculación(es) activa(s). Vincula usuarios ya existentes en el sistema (de cualquier empresa) a esta empresa, sin crear cuentas duplicadas.`}
      icon={<Link2 size={18} />}
      actions={
        <ActionButton
          icon={<Link2 size={16} />}
          onClick={() => setShowLinkModal(true)}
        >
          Vincular técnico/visualizador
        </ActionButton>
      }
    >
      {membershipsQuery.isLoading ? (
        <LoadingState
          title="Cargando vinculaciones"
          description="Consultando los técnicos y visualizadores vinculados."
        />
      ) : null}

      {membershipsQuery.isError ? (
        <ErrorState
          title="No se pudieron cargar las vinculaciones"
          description={getMembershipErrorMessage(membershipsQuery.error)}
        />
      ) : null}

      {!membershipsQuery.isLoading &&
      !membershipsQuery.isError &&
      memberships.length === 0 ? (
        <EmptyState title="Todavía no hay técnicos ni visualizadores vinculados." />
      ) : null}

      {!membershipsQuery.isLoading &&
      !membershipsQuery.isError &&
      memberships.length > 0 ? (
        <ResponsiveTable>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Sede</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {memberships.map((membership) => (
              <tr key={membership.id}>
                <td>
                  <p className="font-semibold text-[var(--stitch-on-surface)]">
                    {membership.user.name}
                  </p>
                </td>
                <td className="text-[var(--stitch-on-surface-variant)]">
                  {membership.user.email}
                </td>
                <td>
                  <StatusPill
                    tone={
                      membership.user.role === 'TECHNICIAN'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {roleLabels[membership.user.role] ?? membership.user.role}
                  </StatusPill>
                </td>
                <td className="text-[var(--stitch-on-surface-variant)]">
                  {membership.site?.name ?? 'Toda la empresa'}
                </td>
                <td>
                  <StatusPill
                    tone={membership.status === 'ACTIVE' ? 'success' : 'neutral'}
                  >
                    {membership.status === 'ACTIVE' ? 'Activa' : 'Revocada'}
                  </StatusPill>
                </td>
                <td>
                  {membership.status === 'ACTIVE' ? (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setMembershipToRevoke(membership)}
                        className="rounded-lg border border-[var(--stitch-danger-border)] p-2 text-[var(--stitch-danger-text)] transition hover:bg-[var(--stitch-danger-bg)]"
                        title="Revocar vinculación"
                      >
                        <Unlink size={16} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-right text-xs text-[var(--stitch-outline)]">
                      Sin acciones
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </ResponsiveTable>
      ) : null}

      {showLinkModal ? (
        <LinkTechnicianModal
          sites={sites}
          isSubmitting={createMutation.isPending}
          onClose={() => setShowLinkModal(false)}
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values);
          }}
        />
      ) : null}

      {membershipToRevoke ? (
        <ConfirmModal
          title="Revocar vinculación"
          description={`"${membershipToRevoke.user.name}" perderá el acceso a esta empresa. Su historial de órdenes de mantenimiento se conserva.`}
          confirmLabel="Revocar vinculación"
          variant="danger"
          isSubmitting={revokeMutation.isPending}
          onCancel={() => setMembershipToRevoke(null)}
          onConfirm={async () => {
            await revokeMutation.mutateAsync(membershipToRevoke);
          }}
        />
      ) : null}
    </SectionCard>
  );
}

function getMembershipErrorMessage(error: unknown): string {
  const withResponse = error as { response?: { status?: number } };

  if (withResponse.response?.status === 403) {
    return 'No tienes permisos para gestionar vinculaciones de esta empresa.';
  }

  if (withResponse.response?.status === 409) {
    return 'Este usuario ya tiene una vinculación activa con esta empresa/sede.';
  }

  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}

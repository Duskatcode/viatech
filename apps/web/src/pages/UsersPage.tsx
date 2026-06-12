import axios from 'axios';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Power, PowerOff } from 'lucide-react';

import { useAuth } from '../auth/useAuth';
import { getErrorMessage } from '../lib/error-message';
import { organizationService } from '../services/organization.service';
import { usersService } from '../services/users.service';
import type { UserRole } from '../types/auth';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserSummary,
} from '../types/domain';
import { ActionButton } from '../ui/ActionButton';
import { ConfirmModal } from '../ui/ConfirmModal';
import { PageHeader } from '../ui/PageHeader';
import { ResponsiveTable } from '../ui/ResponsiveTable';
import { EmptyState, ErrorState, LoadingState } from '../ui/StateMessage';
import { StatusPill } from '../ui/StatusPill';
import { useToast } from '../ui/ToastProvider';
import { UserFormModal, type UserFormValues } from '../users/UserFormModal';

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'Superadministrador',
  ADMIN: 'Administrador',
  TECHNICIAN: 'Técnico',
  VIEWER: 'Visualizador',
};

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [formUser, setFormUser] = useState<UserSummary | null | undefined>();
  const [statusUser, setStatusUser] = useState<UserSummary | null>(null);

  const canAccess =
    currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.listUsers(),
    enabled: canAccess,
  });

  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: organizationService.companies,
    enabled: isSuperAdmin,
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      existingUser,
      values,
    }: {
      existingUser: UserSummary | null;
      values: UserFormValues;
    }) => {
      if (!existingUser) {
        const payload: CreateUserPayload = {
          name: values.name,
          email: values.email,
          password: values.password ?? '',
          role: values.role,
          companyId: values.companyId,
        };

        return usersService.createUser(payload);
      }

      const payload: UpdateUserPayload = {
        name: values.name,
        email: values.email,
        isActive: values.isActive,
      };

      if (existingUser.role !== 'SUPER_ADMIN') {
        payload.role = values.role;
      }

      if (isSuperAdmin && existingUser.role !== 'SUPER_ADMIN') {
        payload.companyId = values.companyId;
      }

      return usersService.updateUser(existingUser.id, payload);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      setFormUser(undefined);
      addToast({
        type: 'success',
        title: variables.existingUser
          ? 'Usuario actualizado'
          : 'Usuario creado',
        description: variables.existingUser
          ? 'Los cambios del usuario fueron guardados.'
          : 'El nuevo usuario ya puede acceder según su rol.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo guardar el usuario',
        description: getUserActionError(error),
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (target: UserSummary) =>
      usersService.updateUserStatus(target.id, {
        isActive: !(target.isActive ?? true),
      }),
    onSuccess: async (_, target) => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      setStatusUser(null);
      addToast({
        type: 'success',
        title:
          target.isActive === false
            ? 'Usuario activado'
            : 'Usuario desactivado',
        description: 'El estado de acceso fue actualizado.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo cambiar el estado',
        description: getUserActionError(error),
      });
    },
  });

  const users = usersQuery.data ?? [];
  const companies = useMemo(
    () => companiesQuery.data ?? [],
    [companiesQuery.data],
  );
  const companyNames = useMemo(
    () => new Map(companies.map((company) => [company.id, company.name])),
    [companies],
  );

  function canManage(target: UserSummary) {
    return (
      isSuperAdmin || target.role === 'TECHNICIAN' || target.role === 'VIEWER'
    );
  }

  function getCompanyName(companyId: string | null) {
    if (!companyId) {
      return 'Sin empresa';
    }

    return (
      companyNames.get(companyId) ??
      (isSuperAdmin ? companyId : 'Empresa actual')
    );
  }

  async function handleSubmit(values: UserFormValues) {
    await saveMutation.mutateAsync({
      existingUser: formUser ?? null,
      values,
    });
  }

  async function handleStatusChange() {
    if (!statusUser) {
      return;
    }

    await statusMutation.mutateAsync(statusUser);
  }

  if (!canAccess) {
    return (
      <section className="space-y-6">
        <PageHeader
          eyebrow="Administración"
          title="Usuarios"
          description="Administra usuarios, técnicos y auditores según tu rol."
        />
        <ErrorState title="No tienes permisos para ver esta sección." />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administración"
        title="Usuarios"
        description="Administra usuarios, técnicos y auditores según tu rol."
        actions={
          <ActionButton
            icon={<Plus size={18} />}
            onClick={() => setFormUser(null)}
          >
            Nuevo usuario
          </ActionButton>
        }
      />

      {usersQuery.isLoading ? (
        <LoadingState
          title="Cargando usuarios"
          description="Consultando los usuarios disponibles para tu rol."
        />
      ) : null}

      {usersQuery.isError ? (
        <ErrorState
          title="No se pudieron cargar los usuarios"
          description={getUserActionError(usersQuery.error)}
        />
      ) : null}

      {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 ? (
        <EmptyState title="No hay usuarios para mostrar." />
      ) : null}

      {!usersQuery.isLoading && !usersQuery.isError && users.length > 0 ? (
        <ResponsiveTable wrapperClassName="shadow-xl">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Empresa</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((item) => {
              const isActive = item.isActive ?? true;
              const isManageable = canManage(item);

              return (
                <tr key={item.id}>
                  <td>
                    <p className="font-semibold text-[var(--stitch-on-surface)]">
                      {item.name}
                    </p>
                  </td>
                  <td className="text-[var(--stitch-on-surface-variant)]">
                    {item.email}
                  </td>
                  <td>
                    <StatusPill tone={getRoleTone(item.role)}>
                      {roleLabels[item.role]}
                    </StatusPill>
                  </td>
                  <td className="text-[var(--stitch-on-surface-variant)]">
                    {getCompanyName(item.companyId)}
                  </td>
                  <td>
                    <StatusPill tone={isActive ? 'success' : 'neutral'}>
                      {isActive ? 'Activo' : 'Inactivo'}
                    </StatusPill>
                  </td>
                  <td>
                    {isManageable ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setFormUser(item)}
                          className="rounded-lg border border-[var(--stitch-outline-variant)] p-2 text-[var(--stitch-on-surface-variant)] transition hover:border-[var(--stitch-primary)] hover:bg-[rgb(0_63_135_/_0.06)] hover:text-[var(--stitch-primary)]"
                          title="Editar usuario"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatusUser(item)}
                          className={[
                            'rounded-lg border p-2 transition',
                            isActive
                              ? 'border-[var(--stitch-danger-border)] text-[var(--stitch-danger-text)] hover:bg-[var(--stitch-danger-bg)]'
                              : 'border-[var(--stitch-outline-variant)] text-[var(--stitch-primary)] hover:border-[var(--stitch-primary)] hover:bg-[rgb(0_63_135_/_0.06)]',
                          ].join(' ')}
                          title={
                            isActive ? 'Desactivar usuario' : 'Activar usuario'
                          }
                        >
                          {isActive ? (
                            <PowerOff size={16} />
                          ) : (
                            <Power size={16} />
                          )}
                        </button>
                      </div>
                    ) : (
                      <p className="text-right text-xs text-[var(--stitch-outline)]">
                        Sin acciones disponibles
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </ResponsiveTable>
      ) : null}

      {formUser !== undefined && currentUser ? (
        <UserFormModal
          key={formUser?.id ?? 'create-user'}
          currentUserRole={currentUser.role}
          user={formUser}
          companies={companies}
          isSubmitting={saveMutation.isPending}
          onClose={() => setFormUser(undefined)}
          onSubmit={handleSubmit}
        />
      ) : null}

      {statusUser ? (
        <ConfirmModal
          title={
            statusUser.isActive === false
              ? 'Activar usuario'
              : 'Desactivar usuario'
          }
          description={
            statusUser.isActive === false
              ? `El usuario "${statusUser.name}" podrá volver a iniciar sesión.`
              : `El usuario "${statusUser.name}" perderá el acceso y sus sesiones activas se invalidarán.`
          }
          confirmLabel={
            statusUser.isActive === false
              ? 'Activar usuario'
              : 'Desactivar usuario'
          }
          variant={statusUser.isActive === false ? 'default' : 'danger'}
          isSubmitting={statusMutation.isPending}
          onCancel={() => setStatusUser(null)}
          onConfirm={handleStatusChange}
        />
      ) : null}
    </section>
  );
}

function getRoleTone(role: UserRole) {
  if (role === 'SUPER_ADMIN') return 'danger';
  if (role === 'ADMIN') return 'info';
  if (role === 'TECHNICIAN') return 'warning';
  return 'neutral';
}

function getUserActionError(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) {
      return 'No tienes permisos para realizar esta acción.';
    }

    if (error.response?.status === 409) {
      return 'Ya existe un usuario con este correo.';
    }

    if (error.response?.status === 400) {
      return 'Revisa los datos del formulario.';
    }
  }

  return getErrorMessage(error);
}

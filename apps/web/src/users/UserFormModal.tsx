import { X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { UserRole } from '../types/auth';
import type { Company, UserSummary } from '../types/domain';
import { FieldError, RequiredMark } from '../ui/FieldFeedback';

export interface UserFormValues {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  companyId?: string;
  isActive: boolean;
}

interface UserFormModalProps {
  currentUserRole: UserRole;
  user?: UserSummary | null;
  companies: Company[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  companyId?: string;
}

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'Superadministrador',
  ADMIN: 'Administrador de empresa',
  TECHNICIAN: 'Técnico',
  VIEWER: 'Visualizador / auditor',
};

export function UserFormModal({
  currentUserRole,
  user,
  companies,
  isSubmitting,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const isEditing = Boolean(user);
  const isSuperAdmin = currentUserRole === UserRole.SUPER_ADMIN;
  const isSuperAdminTarget = user?.role === UserRole.SUPER_ADMIN;
  const allowedRoles: UserRole[] = isSuperAdmin
    ? [UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.VIEWER]
    : [UserRole.TECHNICIAN, UserRole.VIEWER];
  const selectableRoles = isSuperAdminTarget
    ? [UserRole.SUPER_ADMIN]
    : allowedRoles;

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(
    user?.role ?? allowedRoles[0] ?? UserRole.VIEWER,
  );
  const [companyId, setCompanyId] = useState(
    user?.companyId ?? companies[0]?.id ?? '',
  );
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [errors, setErrors] = useState<FormErrors>({});

  function validate() {
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'El nombre es obligatorio.';
    }

    if (!email.trim()) {
      nextErrors.email = 'El correo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Ingresa un correo válido.';
    }

    if (!isEditing && password.length < 8) {
      nextErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }

    if (!selectableRoles.includes(role)) {
      nextErrors.role = 'Selecciona un rol autorizado.';
    }

    if (isSuperAdmin && !isSuperAdminTarget && !companyId) {
      nextErrors.companyId = 'Selecciona una empresa.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        password: isEditing ? undefined : password,
        role,
        companyId: isSuperAdmin ? companyId || undefined : undefined,
        isActive,
      });
    } catch {
      // The page mutation displays the API error and keeps the modal open.
    }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/80 px-4 backdrop-blur">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {isEditing ? 'Editar usuario' : 'Crear usuario'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {isEditing
                ? 'Actualiza los datos y permisos disponibles para este usuario.'
                : 'Registra un nuevo usuario con acceso acorde a su rol.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 disabled:opacity-60"
            aria-label="Cerrar formulario"
          >
            <X size={18} />
          </button>
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field
            label="Nombre"
            value={name}
            error={errors.name}
            autoComplete="name"
            onChange={setName}
          />

          <Field
            label="Email"
            type="email"
            value={email}
            error={errors.email}
            autoComplete="email"
            onChange={setEmail}
          />

          {!isEditing ? (
            <Field
              label="Password"
              type="password"
              value={password}
              error={errors.password}
              autoComplete="new-password"
              onChange={setPassword}
            />
          ) : null}

          <label className="block">
            <span className="text-sm text-slate-300">
              Rol <RequiredMark />
            </span>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 disabled:opacity-60"
              value={role}
              disabled={isSuperAdminTarget}
              onChange={(event) => setRole(event.target.value as UserRole)}
            >
              {selectableRoles.map((option) => (
                <option key={option} value={option}>
                  {roleLabels[option]}
                </option>
              ))}
            </select>
            <FieldError message={errors.role} />
          </label>

          {isSuperAdmin && !isSuperAdminTarget ? (
            <label className="block">
              <span className="text-sm text-slate-300">
                Empresa <RequiredMark />
              </span>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
              >
                <option value="">Selecciona una empresa</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <FieldError message={errors.companyId} />
            </label>
          ) : null}

          {isEditing ? (
            <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 md:col-span-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
              />
              <span>
                <span className="block text-sm font-medium text-white">
                  Usuario activo
                </span>
                <span className="mt-0.5 block text-xs text-slate-400">
                  Los usuarios inactivos no pueden iniciar ni mantener sesión.
                </span>
              </span>
            </label>
          ) : null}

          <div className="flex justify-end gap-3 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar usuario'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  type?: string;
  error?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
}

function Field({
  label,
  value,
  type = 'text',
  error,
  autoComplete,
  onChange,
}: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">
        {label} <RequiredMark />
      </span>
      <input
        className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError message={error} />
    </label>
  );
}

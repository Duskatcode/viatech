import type { MaintenanceStatus } from '../types/domain';

const label: Record<MaintenanceStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const className: Record<MaintenanceStatus, string> = {
  PENDING: 'bg-slate-400/10 text-slate-300',
  IN_PROGRESS: 'bg-amber-400/10 text-amber-300',
  COMPLETED: 'bg-emerald-400/10 text-emerald-300',
  CANCELLED: 'bg-red-400/10 text-red-300',
};

interface MaintenanceStatusBadgeProps {
  status: MaintenanceStatus;
}

export function MaintenanceStatusBadge({ status }: MaintenanceStatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
        className[status],
      ].join(' ')}
    >
      {label[status]}
    </span>
  );
}

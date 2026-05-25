import type { EquipmentStatus } from '../types/domain';

const statusLabel: Record<EquipmentStatus, string> = {
  ACTIVE: 'Activo',
  IN_MAINTENANCE: 'En mantenimiento',
  OUT_OF_SERVICE: 'Fuera de servicio',
  RETIRED: 'Retirado',
};

const statusClassName: Record<EquipmentStatus, string> = {
  ACTIVE: 'bg-emerald-400/10 text-emerald-300',
  IN_MAINTENANCE: 'bg-amber-400/10 text-amber-300',
  OUT_OF_SERVICE: 'bg-red-400/10 text-red-300',
  RETIRED: 'bg-slate-500/10 text-slate-400',
};

interface EquipmentStatusBadgeProps {
  status: EquipmentStatus;
}

export function EquipmentStatusBadge({ status }: EquipmentStatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
        statusClassName[status],
      ].join(' ')}
    >
      {statusLabel[status]}
    </span>
  );
}

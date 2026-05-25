import type {
  Equipment,
  EquipmentStatus,
  MaintenanceOrder,
  MaintenanceStatus,
} from '../types/domain';

export const equipmentStatusLabels: Record<EquipmentStatus, string> = {
  ACTIVE: 'Activos',
  IN_MAINTENANCE: 'En mantenimiento',
  OUT_OF_SERVICE: 'Fuera de servicio',
  RETIRED: 'Retirados',
};

export const maintenanceStatusLabels: Record<MaintenanceStatus, string> = {
  PENDING: 'Pendientes',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completadas',
  CANCELLED: 'Canceladas',
};

export function countEquipmentByStatus(equipment: Equipment[]) {
  return {
    ACTIVE: equipment.filter((item) => item.status === 'ACTIVE').length,
    IN_MAINTENANCE: equipment.filter(
      (item) => item.status === 'IN_MAINTENANCE',
    ).length,
    OUT_OF_SERVICE: equipment.filter(
      (item) => item.status === 'OUT_OF_SERVICE',
    ).length,
    RETIRED: equipment.filter((item) => item.status === 'RETIRED').length,
  };
}

export function countOrdersByStatus(orders: MaintenanceOrder[]) {
  return {
    PENDING: orders.filter((order) => order.status === 'PENDING').length,
    IN_PROGRESS: orders.filter((order) => order.status === 'IN_PROGRESS').length,
    COMPLETED: orders.filter((order) => order.status === 'COMPLETED').length,
    CANCELLED: orders.filter((order) => order.status === 'CANCELLED').length,
  };
}

export function getActiveOrdersCount(orders: MaintenanceOrder[]) {
  return orders.filter(
    (order) => order.status === 'PENDING' || order.status === 'IN_PROGRESS',
  ).length;
}

export function getCompletedThisMonthCount(orders: MaintenanceOrder[]) {
  const now = new Date();

  return orders.filter((order) => {
    if (order.status !== 'COMPLETED' || !order.completedAt) {
      return false;
    }

    const completedAt = new Date(order.completedAt);

    return (
      completedAt.getFullYear() === now.getFullYear() &&
      completedAt.getMonth() === now.getMonth()
    );
  }).length;
}

export function getOverdueOrdersCount(orders: MaintenanceOrder[]) {
  const now = new Date();

  return orders.filter((order) => {
    if (!order.scheduledDate) {
      return false;
    }

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      return false;
    }

    return new Date(order.scheduledDate) < now;
  }).length;
}

export function getCompletionRate(orders: MaintenanceOrder[]) {
  if (orders.length === 0) {
    return 0;
  }

  const completed = orders.filter((order) => order.status === 'COMPLETED').length;

  return Math.round((completed / orders.length) * 100);
}

export function getRecentOrders(orders: MaintenanceOrder[], limit = 6) {
  return [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}

export function getEquipmentAlerts(equipment: Equipment[]) {
  return equipment.filter(
    (item) =>
      item.status === 'OUT_OF_SERVICE' ||
      item.status === 'IN_MAINTENANCE' ||
      item.status === 'RETIRED',
  );
}

import { api } from '../lib/api';

export interface AlertEquipment {
  id: string;
  internalCode: string;
  name: string;
  status: string;
  warrantyUntil?: string | null;
  updatedAt?: string;
  company?: {
    id: string;
    name: string;
    nit?: string | null;
  };
  site?: {
    id: string;
    name: string;
    city?: string | null;
  };
  area?: {
    id: string;
    name: string;
    floor?: string | null;
  };
}

export interface AlertMaintenanceOrder {
  id: string;
  code: string;
  type: string;
  status: string;
  scheduledDate?: string | null;
  equipment?: {
    id: string;
    internalCode: string;
    name: string;
    status: string;
    company?: {
      id: string;
      name: string;
      nit?: string | null;
    };
    site?: {
      id: string;
      name: string;
      city?: string | null;
    };
    area?: {
      id: string;
      name: string;
      floor?: string | null;
    };
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface AlertsSummary {
  generatedAt: string;
  windowDays: number;
  counts: {
    overdueOrders: number;
    upcomingOrders: number;
    inMaintenanceEquipment: number;
    outOfServiceEquipment: number;
    warrantyExpiringEquipment: number;
    total: number;
  };
  overdueOrders: AlertMaintenanceOrder[];
  upcomingOrders: AlertMaintenanceOrder[];
  inMaintenanceEquipment: AlertEquipment[];
  outOfServiceEquipment: AlertEquipment[];
  warrantyExpiringEquipment: AlertEquipment[];
}

export const alertsService = {
  async summary(days = 30) {
    const response = await api.get<AlertsSummary>('/alerts/summary', {
      params: {
        days,
      },
    });

    return response.data;
  },
};

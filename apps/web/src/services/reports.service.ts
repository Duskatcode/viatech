import { api } from '../lib/api';
import type {
  Equipment,
  EquipmentStatus,
  MaintenanceOrder,
  MaintenanceStatus,
  MaintenanceType,
} from '../types/domain';

export interface ReportsSummary {
  equipment: {
    total: number;
    active: number;
    inMaintenance: number;
    outOfService: number;
    retired: number;
  };
  maintenanceOrders: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  generatedAt: string;
}

export interface EquipmentReportParams {
  companyId?: string;
  siteId?: string;
  areaId?: string;
  status?: EquipmentStatus;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface MaintenanceOrdersReportParams {
  companyId?: string;
  equipmentId?: string;
  assignedToId?: string;
  type?: MaintenanceType;
  status?: MaintenanceStatus;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
}

function removeEmptyParams(params: object) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined),
  );
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export const reportsService = {
  async summary() {
    const response = await api.get<ReportsSummary>('/reports/summary');
    return response.data;
  },

  async equipment(params?: EquipmentReportParams) {
    const response = await api.get<Equipment[]>('/reports/equipment', {
      params: params ? removeEmptyParams(params) : undefined,
    });

    return response.data;
  },

  async maintenanceOrders(params?: MaintenanceOrdersReportParams) {
    const response = await api.get<MaintenanceOrder[]>(
      '/reports/maintenance-orders',
      {
        params: params ? removeEmptyParams(params) : undefined,
      },
    );

    return response.data;
  },

  async downloadEquipmentCsv(params?: EquipmentReportParams) {
    const response = await api.get<Blob>('/reports/equipment.csv', {
      params: params ? removeEmptyParams(params) : undefined,
      responseType: 'blob',
    });

    downloadBlob('equipment-report.csv', response.data);
  },

  async downloadMaintenanceOrdersCsv(params?: MaintenanceOrdersReportParams) {
    const response = await api.get<Blob>('/reports/maintenance-orders.csv', {
      params: params ? removeEmptyParams(params) : undefined,
      responseType: 'blob',
    });

    downloadBlob('maintenance-orders-report.csv', response.data);
  },
};

import { api } from '../lib/api';
import type {
  AssignMaintenanceOrderPayload,
  CancelMaintenanceOrderPayload,
  CompleteMaintenanceOrderPayload,
  CreateMaintenanceOrderPayload,
  CreateMaintenanceTaskPayload,
  MaintenanceOrder,
  QueryMaintenanceOrdersParams,
  UpdateMaintenanceOrderPayload,
  UpdateMaintenanceTaskPayload,
} from '../types/domain';

export const maintenanceOrdersService = {
  async findAll(params?: QueryMaintenanceOrdersParams) {
    const response = await api.get<MaintenanceOrder[]>('/maintenance-orders', {
      params,
    });

    return response.data;
  },

  async findOne(id: string) {
    const response = await api.get<MaintenanceOrder>(`/maintenance-orders/${id}`);
    return response.data;
  },

  async create(payload: CreateMaintenanceOrderPayload) {
    const response = await api.post<MaintenanceOrder>(
      '/maintenance-orders',
      payload,
    );

    return response.data;
  },

  async update(id: string, payload: UpdateMaintenanceOrderPayload) {
    const response = await api.patch<MaintenanceOrder>(
      `/maintenance-orders/${id}`,
      payload,
    );

    return response.data;
  },

  async assign(id: string, payload: AssignMaintenanceOrderPayload) {
    const response = await api.patch<MaintenanceOrder>(
      `/maintenance-orders/${id}/assign`,
      payload,
    );

    return response.data;
  },

  async start(id: string) {
    const response = await api.patch<MaintenanceOrder>(
      `/maintenance-orders/${id}/start`,
    );

    return response.data;
  },

  async complete(id: string, payload: CompleteMaintenanceOrderPayload) {
    const response = await api.patch<MaintenanceOrder>(
      `/maintenance-orders/${id}/complete`,
      payload,
    );

    return response.data;
  },

  async cancel(id: string, payload: CancelMaintenanceOrderPayload) {
    const response = await api.patch<MaintenanceOrder>(
      `/maintenance-orders/${id}/cancel`,
      payload,
    );

    return response.data;
  },

  async addTask(orderId: string, payload: CreateMaintenanceTaskPayload) {
    const response = await api.post(
      `/maintenance-orders/${orderId}/tasks`,
      payload,
    );

    return response.data;
  },

  async updateTask(
    orderId: string,
    taskId: string,
    payload: UpdateMaintenanceTaskPayload,
  ) {
    const response = await api.patch(
      `/maintenance-orders/${orderId}/tasks/${taskId}`,
      payload,
    );

    return response.data;
  },
};

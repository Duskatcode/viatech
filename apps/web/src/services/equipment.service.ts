import { api } from '../lib/api';
import type {
  CreateEquipmentPayload,
  Equipment,
  EquipmentProfile,
  QueryEquipmentParams,
  UpdateEquipmentPayload,
  UpdateEquipmentStatusPayload,
} from '../types/domain';

export const equipmentService = {
  async findAll(params?: QueryEquipmentParams) {
    const response = await api.get<Equipment[]>('/equipment', { params });
    return response.data;
  },

  async findOne(id: string) {
    const response = await api.get<Equipment>(`/equipment/${id}`);
    return response.data;
  },

  async profile(id: string) {
    const response = await api.get<EquipmentProfile>(`/equipment/${id}/profile`);
    return response.data;
  },

  async create(payload: CreateEquipmentPayload) {
    const response = await api.post<Equipment>('/equipment', payload);
    return response.data;
  },

  async update(id: string, payload: UpdateEquipmentPayload) {
    const response = await api.patch<Equipment>(`/equipment/${id}`, payload);
    return response.data;
  },

  async updateStatus(id: string, payload: UpdateEquipmentStatusPayload) {
    const response = await api.patch<Equipment>(
      `/equipment/${id}/status`,
      payload,
    );
    return response.data;
  },

  async retire(id: string) {
    const response = await api.delete<Equipment>(`/equipment/${id}`);
    return response.data;
  },
};

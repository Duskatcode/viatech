import { api } from '../lib/api';
import type {
  CreateUserPayload,
  QueryUsersParams,
  UpdateUserPayload,
  UpdateUserRolePayload,
  UpdateUserStatusPayload,
  UserSummary,
} from '../types/domain';

export const usersService = {
  async findAll() {
    const response = await api.get<UserSummary[]>('/users');
    return response.data;
  },

  async listUsers(params?: QueryUsersParams) {
    const response = await api.get<UserSummary[]>('/users', { params });
    return response.data;
  },

  async getUser(id: string) {
    const response = await api.get<UserSummary>(`/users/${id}`);
    return response.data;
  },

  async createUser(payload: CreateUserPayload) {
    const response = await api.post<UserSummary>('/users', payload);
    return response.data;
  },

  async updateUser(id: string, payload: UpdateUserPayload) {
    const response = await api.patch<UserSummary>(`/users/${id}`, payload);
    return response.data;
  },

  async updateUserRole(id: string, payload: UpdateUserRolePayload) {
    const response = await api.patch<UserSummary>(`/users/${id}/role`, payload);
    return response.data;
  },

  async updateUserStatus(id: string, payload: UpdateUserStatusPayload) {
    const response = await api.patch<UserSummary>(
      `/users/${id}/status`,
      payload,
    );
    return response.data;
  },
};

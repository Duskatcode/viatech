import { api } from '../lib/api';
import type { UserSummary } from '../types/domain';

export const usersService = {
  async findAll() {
    const response = await api.get<UserSummary[]>('/users');
    return response.data;
  },
};

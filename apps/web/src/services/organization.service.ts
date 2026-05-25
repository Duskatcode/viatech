import { api } from '../lib/api';
import type { Area, Company, Site } from '../types/domain';

export const organizationService = {
  async companies() {
    const response = await api.get<Company[]>('/companies');
    return response.data;
  },

  async sites() {
    const response = await api.get<Site[]>('/sites');
    return response.data;
  },

  async areas() {
    const response = await api.get<Area[]>('/areas');
    return response.data;
  },
};

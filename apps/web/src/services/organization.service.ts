import { api } from '../lib/api';
import type {
  Area,
  Company,
  CreateAreaPayload,
  CreateSitePayload,
  Site,
  UpdateAreaPayload,
  UpdateCompanyPayload,
  UpdateSitePayload,
} from '../types/domain';

export const organizationService = {
  async companies() {
    const response = await api.get<Company[]>('/companies');
    return response.data;
  },

  async updateCompany(id: string, payload: UpdateCompanyPayload) {
    const response = await api.patch<Company>(`/companies/${id}`, payload);
    return response.data;
  },

  async sites() {
    const response = await api.get<Site[]>('/sites');
    return response.data;
  },

  async createSite(payload: CreateSitePayload) {
    const response = await api.post<Site>('/sites', payload);
    return response.data;
  },

  async updateSite(id: string, payload: UpdateSitePayload) {
    const response = await api.patch<Site>(`/sites/${id}`, payload);
    return response.data;
  },

  async removeSite(id: string) {
    const response = await api.delete<Site>(`/sites/${id}`);
    return response.data;
  },

  async areas() {
    const response = await api.get<Area[]>('/areas');
    return response.data;
  },

  async createArea(payload: CreateAreaPayload) {
    const response = await api.post<Area>('/areas', payload);
    return response.data;
  },

  async updateArea(id: string, payload: UpdateAreaPayload) {
    const response = await api.patch<Area>(`/areas/${id}`, payload);
    return response.data;
  },

  async removeArea(id: string) {
    const response = await api.delete<Area>(`/areas/${id}`);
    return response.data;
  },
};

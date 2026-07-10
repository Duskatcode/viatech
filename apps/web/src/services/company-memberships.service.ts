import { api } from '../lib/api';
import type {
  AssignableUser,
  CompanyMembership,
  CreateMembershipPayload,
} from '../types/domain';

export const companyMembershipsService = {
  async searchAssignableUsers(search?: string) {
    const response = await api.get<AssignableUser[]>(
      '/company-memberships/search-users',
      { params: search ? { search } : undefined },
    );
    return response.data;
  },

  async findAll(companyId: string) {
    const response = await api.get<CompanyMembership[]>(
      '/company-memberships',
      { params: { companyId } },
    );
    return response.data;
  },

  async create(payload: CreateMembershipPayload) {
    const response = await api.post<CompanyMembership>(
      '/company-memberships',
      payload,
    );
    return response.data;
  },

  async revoke(id: string) {
    const response = await api.patch<CompanyMembership>(
      `/company-memberships/${id}/revoke`,
    );
    return response.data;
  },
};

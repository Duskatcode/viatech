import { api } from '../lib/api';

export interface AuditLogUser {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string | null;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue: unknown | null;
  newValue: unknown | null;
  userId: string | null;
  createdAt: string;
  user?: AuditLogUser | null;
}

export interface AuditLogParams {
  action?: string;
  entity?: string;
  entityId?: string;
  userId?: string;
  from?: string;
  to?: string;
}

function removeEmptyParams(params: object) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined),
  );
}

export const auditLogsService = {
  async findAll(params?: AuditLogParams) {
    const response = await api.get<AuditLog[]>('/audit-logs', {
      params: params ? removeEmptyParams(params) : undefined,
    });

    return response.data;
  },
};

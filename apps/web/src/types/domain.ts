import type { UserRole } from './auth';

export type EquipmentStatus =
  | 'ACTIVE'
  | 'IN_MAINTENANCE'
  | 'OUT_OF_SERVICE'
  | 'RETIRED';

export type MaintenanceStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE';

export interface CompanyRef {
  id: string;
  name: string;
  nit?: string | null;
}

export interface Company extends CompanyRef {
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isActive?: boolean;
}

export interface SiteRef {
  id: string;
  name: string;
  city?: string | null;
  address?: string | null;
  companyId?: string;
}

export interface Site extends SiteRef {
  isActive?: boolean;
}

export interface AreaRef {
  id: string;
  name: string;
  floor?: string | null;
  description?: string | null;
  siteId?: string;
}

export interface Area extends AreaRef {
  isActive?: boolean;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryUsersParams {
  companyId?: string;
}


export interface CreateCompanyPayload {
  name: string;
  nit?: string;
  phone?: string;
  email?: string;
  address?: string;
}
export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: UserRole;
  companyId?: string;
  isActive?: boolean;
}

export interface UpdateUserRolePayload {
  role: UserRole;
}

export interface UpdateUserStatusPayload {
  isActive: boolean;
}

export interface Equipment {
  id: string;
  internalCode: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  equipmentType?: string | null;
  riskLevel?: string | null;
  status: EquipmentStatus;
  purchaseDate?: string | null;
  installationDate?: string | null;
  warrantyUntil?: string | null;
  notes?: string | null;
  companyId: string;
  siteId: string;
  areaId: string;
  createdAt: string;
  updatedAt: string;
  company?: CompanyRef;
  site?: SiteRef;
  area?: AreaRef;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  description?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
  orderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  type: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface MaintenanceOrderEquipment {
  id: string;
  internalCode: string;
  name: string;
  status: EquipmentStatus;
  companyId: string;
  site?: {
    id: string;
    name: string;
  };
  area?: {
    id: string;
    name: string;
  };
}

export interface MaintenanceOrder {
  id: string;
  code: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduledDate?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  description?: string | null;
  diagnosis?: string | null;
  actionsPerformed?: string | null;
  recommendations?: string | null;
  finalEquipmentStatus?: EquipmentStatus | null;
  equipmentId: string;
  assignedToId?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  equipment?: MaintenanceOrderEquipment;
  assignedTo?: UserSummary | null;
  createdBy?: UserSummary | null;
  tasks?: MaintenanceTask[];
  attachments?: Attachment[];
}

export interface EquipmentProfile extends Equipment {
  company: CompanyRef;
  site: SiteRef;
  area: AreaRef;
  maintenanceOrders: MaintenanceOrder[];
  attachments: Attachment[];
}

export interface CreateEquipmentPayload {
  siteId: string;
  areaId: string;
  internalCode: string;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  equipmentType?: string;
  riskLevel?: string;
  status?: EquipmentStatus;
  purchaseDate?: string;
  installationDate?: string;
  warrantyUntil?: string;
  notes?: string;
}

export type UpdateEquipmentPayload = Partial<CreateEquipmentPayload>;

export interface QueryEquipmentParams {
  siteId?: string;
  areaId?: string;
  status?: EquipmentStatus;
  search?: string;
}

export interface UpdateEquipmentStatusPayload {
  status: EquipmentStatus;
  notes?: string;
}

export interface CreateMaintenanceTaskPayload {
  title: string;
  description?: string;
}

export interface UpdateMaintenanceTaskPayload {
  title?: string;
  description?: string;
  isCompleted?: boolean;
}

export interface CreateMaintenanceOrderPayload {
  equipmentId: string;
  type: MaintenanceType;
  assignedToId?: string;
  scheduledDate?: string;
  description?: string;
  tasks?: CreateMaintenanceTaskPayload[];
}

export interface UpdateMaintenanceOrderPayload {
  equipmentId?: string;
  assignedToId?: string;
  scheduledDate?: string;
  description?: string;
}

export interface AssignMaintenanceOrderPayload {
  assignedToId: string;
}

export interface CompleteMaintenanceOrderPayload {
  diagnosis?: string;
  actionsPerformed?: string;
  recommendations?: string;
  finalEquipmentStatus?: EquipmentStatus;
}

export interface CancelMaintenanceOrderPayload {
  reason?: string;
}

export interface QueryMaintenanceOrdersParams {
  equipmentId?: string;
  assignedToId?: string;
  type?: MaintenanceType;
  status?: MaintenanceStatus;
  search?: string;
}

export interface UpdateCompanyPayload {
  name?: string;
  nit?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface CreateSitePayload {
  companyId?: string;
  name: string;
  city?: string;
  address?: string;
}

export type UpdateSitePayload = Partial<CreateSitePayload>;

export interface CreateAreaPayload {
  siteId: string;
  name: string;
  floor?: string;
  description?: string;
}

export type UpdateAreaPayload = Partial<CreateAreaPayload>;

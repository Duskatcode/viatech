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

export interface SiteRef {
  id: string;
  name: string;
  city?: string | null;
}

export interface AreaRef {
  id: string;
  name: string;
  floor?: string | null;
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
  equipment?: {
    id: string;
    internalCode: string;
    name: string;
    status: EquipmentStatus;
    companyId: string;
  };
}

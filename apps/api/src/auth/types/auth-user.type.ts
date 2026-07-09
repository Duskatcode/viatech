import { UserRole } from '@vitatech/shared';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  /**
   * Empresas a las que este usuario tiene una CompanyMembership ACTIVE.
   * Distinto de `companyId`: ese campo sigue significando "la empresa que
   * administra" para un ADMIN. `companyIds` es la lista de vinculaciones
   * explicitas (tipicamente para TECHNICIAN/VIEWER que pueden trabajar en
   * mas de una empresa/sede). Se recalcula en cada request, nunca se
   * embebe en el JWT, para que revocar un acceso sea efectivo de inmediato.
   */
  companyIds: string[];
}

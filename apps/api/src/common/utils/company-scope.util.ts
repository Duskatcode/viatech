import { UserRole } from '@vitatech/shared';

import type { AuthUser } from '../../auth/types/auth-user.type';

/**
 * Construye el filtro de companyId a usar en queries de LECTURA (listar o
 * ver un registro), segun el rol del usuario actual:
 * - SUPER_ADMIN: se maneja aparte en cada servicio (visibilidad global u
 *   opcionalmente filtrada por requestedCompanyId); esta funcion no aplica.
 * - ADMIN: administra exactamente una empresa (companyId).
 * - TECHNICIAN / VIEWER: pueden estar vinculados a varias empresas via
 *   CompanyMembership (user.companyIds). Si no tienen ninguna membresia
 *   activa, el filtro resultante ({ in: [] }) no matchea nada, evitando
 *   una fuga de datos por defecto inseguro.
 *
 * Uso: spread directo en un Prisma where -> `companyId: buildUserCompanyFilter(user)`
 * Prisma acepta tanto un string (igualdad) como { in: string[] } para
 * filtros de campos escalares, incluso en relaciones anidadas
 * (ej. `equipment: { companyId: buildUserCompanyFilter(user) } }`).
 */
export function buildUserCompanyFilter(
  user: AuthUser,
): string | { in: string[] } {
  if (user.role === UserRole.ADMIN) {
    return user.companyId ?? '';
  }

  return { in: user.companyIds };
}

/**
 * Verifica si el usuario tiene acceso de LECTURA a una empresa especifica
 * (por ejemplo, al ver el detalle de un equipo/orden que pertenece a esa
 * empresa). No lanza excepcion: el llamador decide que hacer (ForbiddenException,
 * NotFoundException, etc.) segun el contexto.
 * - SUPER_ADMIN: siempre true.
 * - ADMIN: solo su propia empresa.
 * - TECHNICIAN / VIEWER: cualquier empresa con membresia activa.
 */
export function userHasCompanyAccess(
  user: AuthUser,
  companyId: string,
): boolean {
  if (user.role === UserRole.SUPER_ADMIN) {
    return true;
  }

  if (user.role === UserRole.ADMIN) {
    return Boolean(user.companyId) && user.companyId === companyId;
  }

  return user.companyIds.includes(companyId);
}

import { UserRole } from './roles';

export type PermissionAction =
  | 'company:create'
  | 'company:read'
  | 'company:update'
  | 'company:delete'
  | 'site:create'
  | 'site:read'
  | 'site:update'
  | 'site:delete'
  | 'area:create'
  | 'area:read'
  | 'area:update'
  | 'area:delete'
  | 'equipment:create'
  | 'equipment:read'
  | 'equipment:update'
  | 'equipment:delete'
  | 'maintenance:create'
  | 'maintenance:read'
  | 'maintenance:update'
  | 'maintenance:start'
  | 'maintenance:complete'
  | 'maintenance:cancel'
  | 'user:create'
  | 'user:read'
  | 'user:update'
  | 'user:delete'
  | 'report:read'
  | 'audit:read';

export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  [UserRole.SUPER_ADMIN]: [
    'company:create',
    'company:read',
    'company:update',
    'company:delete',
    'site:create',
    'site:read',
    'site:update',
    'site:delete',
    'area:create',
    'area:read',
    'area:update',
    'area:delete',
    'equipment:create',
    'equipment:read',
    'equipment:update',
    'equipment:delete',
    'maintenance:create',
    'maintenance:read',
    'maintenance:update',
    'maintenance:start',
    'maintenance:complete',
    'maintenance:cancel',
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'report:read',
    'audit:read'
  ],

  [UserRole.ADMIN]: [
    'company:read',
    'site:create',
    'site:read',
    'site:update',
    'site:delete',
    'area:create',
    'area:read',
    'area:update',
    'area:delete',
    'equipment:create',
    'equipment:read',
    'equipment:update',
    'equipment:delete',
    'maintenance:create',
    'maintenance:read',
    'maintenance:update',
    'maintenance:start',
    'maintenance:complete',
    'maintenance:cancel',
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'report:read',
    'audit:read'
  ],

  [UserRole.TECHNICIAN]: [
    'site:read',
    'area:read',
    'equipment:read',
    'equipment:update',
    'maintenance:read',
    'maintenance:update',
    'maintenance:start',
    'maintenance:complete',
    'report:read'
  ],

  [UserRole.VIEWER]: [
    'site:read',
    'area:read',
    'equipment:read',
    'maintenance:read',
    'report:read'
  ]
};

export function hasPermission(role: UserRole, permission: PermissionAction): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

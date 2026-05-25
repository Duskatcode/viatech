import { existsSync, readFileSync } from 'node:fs';

const checks = [];

function read(file) {
  if (!existsSync(file)) {
    throw new Error(`Missing required file: ${file}`);
  }

  return readFileSync(file, 'utf8');
}

function assertContains(file, patterns) {
  const content = read(file);

  for (const pattern of patterns) {
    if (!content.includes(pattern)) {
      throw new Error(`Missing pattern in ${file}: ${pattern}`);
    }
  }

  checks.push(`OK: ${file}`);
}

function assertAny(file, patterns) {
  const content = read(file);

  if (!patterns.some((pattern) => content.includes(pattern))) {
    throw new Error(
      `Missing at least one expected pattern in ${file}: ${patterns.join(' OR ')}`,
    );
  }

  checks.push(`OK: ${file}`);
}

console.log('Running critical backend regression checks...');

assertContains('apps/api/src/database/prisma.service.ts', [
  'DATABASE_URL is required',
]);

assertContains('apps/api/src/auth/auth.controller.ts', [
  "@Controller('auth')",
  "@Post('login')",
  "@Post('refresh')",
  "@Get('me')",
]);

assertContains('apps/api/src/equipment/equipment.controller.ts', [
  "@Controller('equipment')",
  '@UseGuards(JwtAuthGuard, RolesGuard)',
  '@Roles',
]);

assertContains('apps/api/src/equipment/equipment.service.ts', [
  'buildCompanyScope',
  'EQUIPMENT_CREATED',
  'EQUIPMENT_UPDATED',
  'EQUIPMENT_STATUS_CHANGED',
  'EQUIPMENT_RETIRED',
]);

assertContains('apps/api/src/maintenance-orders/maintenance-orders.controller.ts', [
  "@Controller('maintenance-orders')",
  '@UseGuards(JwtAuthGuard, RolesGuard)',
  '@Roles',
]);

assertContains('apps/api/src/maintenance-orders/maintenance-orders.service.ts', [
  'MAINTENANCE_ORDER_CREATED',
  'MAINTENANCE_ORDER_STARTED',
  'MAINTENANCE_ORDER_COMPLETED',
  'MAINTENANCE_ORDER_CANCELLED',
]);

assertContains('apps/api/src/reports/reports.controller.ts', [
  "@Controller('reports')",
  '@UseGuards(JwtAuthGuard, RolesGuard)',
  'equipment.csv',
  'equipment.xlsx',
  'maintenance-orders.csv',
  'maintenance-orders.xlsx',
  'maintenance-orders/:id.pdf',
]);

assertContains('apps/api/src/reports/reports.service.ts', [
  'REPORT_CSV_EXPORTED',
  'REPORT_XLSX_EXPORTED',
  'REPORT_PDF_EXPORTED',
  'buildEquipmentCompanyScope',
  'buildMaintenanceCompanyScope',
]);

assertContains('apps/api/src/attachments/attachments.controller.ts', [
  "@Controller('attachments')",
  '@UseGuards(JwtAuthGuard, RolesGuard)',
]);

assertContains('apps/api/src/attachments/attachments.service.ts', [
  'ATTACHMENT_UPLOADED',
  'ATTACHMENT_DELETED',
  'resolveSafePath',
  'ensureEquipmentAccess',
  'ensureMaintenanceOrderAccess',
]);

assertContains('apps/api/src/audit-logs/audit-logs.controller.ts', [
  "@Controller('audit-logs')",
  '@UseGuards(JwtAuthGuard, RolesGuard)',
  'UserRole.SUPER_ADMIN',
  'UserRole.ADMIN',
]);

assertContains('apps/api/src/audit-logs/audit-logs.service.ts', [
  'safeCreate',
  'buildScope',
  'user.role === UserRole.SUPER_ADMIN',
  'companyId',
]);

assertContains('apps/api/src/alerts/alerts.controller.ts', [
  "@Controller('alerts')",
  '@UseGuards(JwtAuthGuard, RolesGuard)',
  "@Get('summary')",
]);

assertContains('apps/api/src/alerts/alerts.service.ts', [
  'overdueOrders',
  'upcomingOrders',
  'inMaintenanceEquipment',
  'outOfServiceEquipment',
  'warrantyExpiringEquipment',
  'buildEquipmentScope',
  'buildMaintenanceScope',
]);

assertAny('apps/api/src/main.ts', [
  "app.setGlobalPrefix('api/v1')",
  'setGlobalPrefix',
]);

for (const check of checks) {
  console.log(check);
}

console.log('');
console.log(`Critical backend regression checks passed: ${checks.length}`);

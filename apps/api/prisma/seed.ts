import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import {
  EquipmentStatus,
  MaintenanceStatus,
  MaintenanceType,
  Prisma,
  PrismaClient,
  UserRole,
} from '../src/generated/prisma/client';
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITIES,
} from '../src/audit-logs/audit-log.constants';

config({ path: '../../.env' });
config({ path: '.env' });

/**
 * Guarda de seguridad: este seed genera datos ficticios masivos (12
 * empresas, ~1900 equipos, ~13000 ordenes, 100000 registros de auditoria) y
 * NUNCA debe correr contra una base real. Se bloquea si detecta cualquier
 * indicio de que DATABASE_URL apunta a produccion, sin importar como se
 * invoque el comando (pnpm, docker exec, ts-node directo, etc).
 *
 * Para saltarse esto de forma deliberada (no recomendado, nunca contra
 * datos reales) hay que setear explicitamente ALLOW_PROD_SEED=YES_I_AM_SURE.
 */
function assertNotProductionDatabase() {
  const databaseUrl = process.env.DATABASE_URL ?? '';
  const nodeEnv = process.env.NODE_ENV ?? '';
  const override = process.env.ALLOW_PROD_SEED === 'YES_I_AM_SURE';

  const looksLikeManagedCloudDb = /supabase\.co|pooler\.supabase\.com|rds\.amazonaws\.com|neon\.tech|render\.com/i.test(
    databaseUrl,
  );
  const isProductionEnv = nodeEnv === 'production';

  if ((looksLikeManagedCloudDb || isProductionEnv) && !override) {
    console.error(
      '\n\ud83d\uded1 SEED BLOQUEADO: DATABASE_URL parece apuntar a una base de datos',
      'gestionada/de produccion (o NODE_ENV=production).\n' +
        'Este seed borra y regenera datos masivos: nunca debe correr ahi.\n\n' +
        'Si esto es un entorno de desarrollo legitimo con un proveedor',
      'cloud, vuelve a correr el comando con:\n' +
        '  ALLOW_PROD_SEED=YES_I_AM_SURE pnpm prisma:seed\n',
    );
    process.exit(1);
  }
}

assertNotProductionDatabase();

const adapter = new PrismaPg(
  { connectionString: process.env.DATABASE_URL! },
  { schema: 'public' },
);
const prisma = new PrismaClient({ adapter });

// ========================
// TIPOS LOCALES
// ========================
type DemoEquipmentDefinition = {
  companyId: string;
  internalCode: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  equipmentType: string;
  riskLevel: string;
  status: EquipmentStatus;
  siteId: string;
  areaId: string;
  purchaseDate: Date;
  installationDate: Date;
  warrantyUntil: Date;
  notes: string;
};

type DemoOrderDefinition = {
  code: string;
  equipmentCode: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduledDate: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  description: string;
  diagnosis: string | null;
  actionsPerformed: string | null;
  recommendations: string | null;
  finalEquipmentStatus: EquipmentStatus | null;
  assignedToId: string;
  createdById: string;
};

// ========================
// UTILIDADES
// ========================
function addDays(days: number, hour = 10) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ========================
// UPSERTS
// ========================
async function upsertSite(
  companyId: string,
  data: { name: string; address: string; city: string },
) {
  const existing = await prisma.site.findFirst({
    where: { companyId, name: data.name },
  });
  if (existing) {
    return prisma.site.update({
      where: { id: existing.id },
      data: { ...data, isActive: true },
    });
  }
  return prisma.site.create({ data: { ...data, companyId } });
}

async function upsertArea(
  siteId: string,
  data: { name: string; floor: string; description: string },
) {
  const existing = await prisma.area.findFirst({
    where: { siteId, name: data.name },
  });
  if (existing) {
    return prisma.area.update({
      where: { id: existing.id },
      data: { ...data, isActive: true },
    });
  }
  return prisma.area.create({ data: { ...data, siteId } });
}

// ========================
// CONSTANTES
// ========================
const COMPANY_DEFINITIONS = [
  { name: 'Clínica Metropolitana', nit: '900000001-1', phone: '6044441010', email: 'biomedica@clinicametro.demo', address: 'Cra 48 #20-85, Medellín' },
  { name: 'Hospital San Rafael', nit: '900000002-2', phone: '6044442020', email: 'biomedica@sanrafael.demo', address: 'Calle 38 Sur #27-120, Envigado' },
  { name: 'Hospital General de Medellín', nit: '900000003-3', phone: '6044443030', email: 'biomedica@hgm.demo', address: 'Calle 64 #51D-154, Medellín' },
  { name: 'Clínica Las Américas', nit: '900000004-4', phone: '6044444040', email: 'biomedica@lasamericas.demo', address: 'Av 80 #2-150, Cali' },
  { name: 'Hospital Pablo Tobón Uribe', nit: '900000005-5', phone: '6044445050', email: 'biomedica@hptu.demo', address: 'Calle 78B #69-240, Medellín' },
  { name: 'Clínica del Norte', nit: '900000006-6', phone: '6054446060', email: 'biomedica@clinicadelnorte.demo', address: 'Cra 53 #100-50, Barranquilla' },
  { name: 'Hospital Universitario', nit: '900000007-7', phone: '6074447070', email: 'biomedica@hospitaluni.demo', address: 'Cra 33 #29-130, Bucaramanga' },
  { name: 'Centro Médico Integral', nit: '900000008-8', phone: '6064448080', email: 'biomedica@cmi.demo', address: 'Av Circunvalar #10-80, Pereira' },
  { name: 'Fundación Cardiovascular', nit: '900000009-9', phone: '6074449090', email: 'biomedica@fcv.demo', address: 'Calle 155 #23-58, Floridablanca' },
  { name: 'Clínica de Especialistas', nit: '900000010-0', phone: '6084440101', email: 'biomedica@especialistas.demo', address: 'Cra 12 #34-56, Ibagué' },
  { name: 'Hospital Infantil', nit: '900000011-1', phone: '6054441111', email: 'biomedica@infantil.demo', address: 'Calle 45 #10-20, Cartagena' },
  { name: 'Centro Oncológico Nacional', nit: '900000012-2', phone: '6014441212', email: 'biomedica@oncologico.demo', address: 'Av 68 #20-90, Bogotá' },
];

const SITE_NAMES = [
  'Principal', 'Torre Norte', 'Torre Sur', 'Consulta Externa', 'Centro Diagnóstico',
  'Unidad Renal', 'Sede Centro', 'UCI Central', 'Centro Quirúrgico', 'Edificio de Especialistas',
  'Sede Norte', 'Sede Sur', 'Anexo Laboratorio', 'Unidad Cardiovascular', 'Clínica de Día',
];

const AREA_NAMES = [
  'Urgencias', 'UCI Adultos', 'UCI Neonatal', 'Pediatría', 'Neonatos', 'Hospitalización',
  'Cirugía', 'Central de Esterilización', 'Laboratorio', 'Radiología', 'Imagenología',
  'Hemodinamia', 'Consulta Externa', 'Farmacia', 'Patología', 'Banco de Sangre',
  'Oncología', 'Quimioterapia', 'Diálisis', 'Odontología', 'Procedimientos', 'Recuperación',
  'Endoscopia', 'Broncoscopia', 'Electrofisiología', 'Rehabilitación', 'Cuidados Paliativos',
  'Nutrición Parenteral', 'Terapia Respiratoria', 'Hospital Día',
];

const EQUIPMENT_BRANDS = [
  'Philips', 'GE Healthcare', 'Mindray', 'Dräger', 'Hamilton', 'Medtronic', 'Welch Allyn',
  'Siemens Healthineers', 'Canon Medical', 'Olympus', 'Stryker', 'Steris', 'Atom Medical',
  'Nihon Kohden', 'B. Braun', 'Fujifilm', 'Zoll', 'Tuttnauer', 'Allied Healthcare',
  'Dr. Mach', 'Omron', 'Hospira', 'Edwards Lifesciences', 'Maquet', 'Covidien',
  'Karl Storz', 'Richard Wolf', 'Esaote', 'Toshiba Medical', 'Hitachi Aloka',
];

const EQUIPMENT_TYPES = [
  'Monitor Multiparámetro', 'Ventilador Mecánico', 'Electrobisturí', 'Ecógrafo', 'Rayos X',
  'Tomógrafo', 'Resonancia Magnética', 'Monitor Fetal', 'Incubadora', 'Desfibrilador',
  'Autoclave', 'Bomba de Infusión', 'Aspirador', 'Capnógrafo', 'Gasómetro',
  'Electrocardiógrafo', 'Mesa Quirúrgica', 'Lámpara Cialítica', 'Nebulizador',
  'Balanza Neonatal', 'Cama Eléctrica', 'Monitor de Signos Vitales', 'Tensiómetro Digital',
  'Esterilizador Rápido', 'Ventilador de Transporte', 'Calentador de Pacientes',
  'Manta Térmica', 'Sistema de Anestesia', 'Torre Laparoscópica', 'Laringoscopio',
  'Bisturí Armónico', 'Sistema de Navegación', 'Microscopio Quirúrgico', 'Ecógrafo Portátil',
  'Monitor de Gasto Cardíaco', 'Bomba de Balón Intraaórtico', 'Equipo de Hemodiálisis',
  'Centrífuga', 'Analizador de Gases', 'Espectrofotómetro', 'Autoclave de Vapor',
  'Lavadora Desinfectadora', 'Selladora de Bolsas', 'Electroencefalógrafo', 'Polisomnógrafo',
];

// Distribución ponderada de estados (ACTIVE 75%, IN_MAINTENANCE 10%, OUT_OF_SERVICE 8%, RETIRED 7%)
function getWeightedStatus(): EquipmentStatus {
  const r = randomBetween(1, 100);
  if (r <= 75) return EquipmentStatus.ACTIVE;
  if (r <= 85) return EquipmentStatus.IN_MAINTENANCE;
  if (r <= 93) return EquipmentStatus.OUT_OF_SERVICE;
  return EquipmentStatus.RETIRED;
}

// ========================
// GENERADORES
// ========================
function generateCompanyInitials(companyName: string): string {
  return companyName.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
}

function generateEquipmentDefinitions(
  companies: { id: string; name: string }[],
  sitesMap: Map<string, { id: string; companyId: string }[]>,
  areasMap: Map<string, { id: string; name: string }[]>,
) {
  const definitions: DemoEquipmentDefinition[] = [];
  let counter = 0;

  for (const company of companies) {
    const companySites = sitesMap.get(company.id) ?? [];
    const initials = generateCompanyInitials(company.name);
    const numEquipments = randomBetween(120, 200);

    for (let i = 0; i < numEquipments; i++) {
      const site = pickRandom(companySites);
      const areasOfSite = areasMap.get(site.id) ?? [];
      if (areasOfSite.length === 0) continue;
      const area = pickRandom(areasOfSite);
      const type = pickRandom(EQUIPMENT_TYPES);
      const brand = pickRandom(EQUIPMENT_BRANDS);
      const status = getWeightedStatus();
      const purchaseDate = randomDate(new Date(2018, 0, 1), new Date(2025, 5, 1));
      const installationDate = new Date(purchaseDate.getTime() + randomBetween(1, 30) * 86400000);
      const warrantyUntil = new Date(installationDate.getTime() + randomBetween(365, 1095) * 86400000);
      const internalCode = `EQ-${initials}-${String(++counter).padStart(5, '0')}`;
      const serialNumber = `${initials}-${type.substring(0, 3).toUpperCase()}-${String(counter).padStart(4, '0')}`;
      const model = `${brand.split(' ')[0]} ${type.split(' ')[0]}-${String(randomBetween(100, 999))}`;
      const riskLevel = type.includes('Ventilador') || type.includes('Desfibrilador') || type.includes('Tomógrafo') || type.includes('Resonancia')
        ? 'III'
        : type.includes('Monitor') || type.includes('Bomba') || type.includes('Incubadora') || type.includes('Anestesia')
          ? 'IIb'
          : pickRandom(['I', 'IIa']);

      definitions.push({
        companyId: company.id,
        internalCode,
        name: `${type} ${brand}`,
        brand,
        model,
        serialNumber,
        equipmentType: type,
        riskLevel,
        status,
        siteId: site.id,
        areaId: area.id,
        purchaseDate,
        installationDate,
        warrantyUntil,
        notes: status === EquipmentStatus.OUT_OF_SERVICE ? 'Equipo fuera de servicio por falla técnica.' : '',
      });
    }
  }
  return definitions;
}

function generateOrderDefinitions(
  equipments: { internalCode: string; id: string; equipmentType: string; status: EquipmentStatus; companyId?: string }[],
  techniciansMap: Map<string, string[]>,
  adminsMap: Map<string, string[]>,
) {
  const definitions: DemoOrderDefinition[] = [];
  let orderCodeCounter = 0;

  for (const equipment of equipments) {
    const numOrders = randomBetween(4, 10);
    for (let j = 0; j < numOrders; j++) {
      const orderDate = randomDate(new Date(2021, 0, 1), new Date(2026, 6, 30));
      const type = pickRandom([MaintenanceType.PREVENTIVE, MaintenanceType.CORRECTIVE]);
      const status = deriveMaintenanceStatus(orderDate);
      const companyId = equipment.companyId ?? '';
      const technicianIds = techniciansMap.get(companyId);
      const adminIds = adminsMap.get(companyId);
      if (!technicianIds || !adminIds) continue;
      const technician = pickRandom(technicianIds);
      const creator = pickRandom(adminIds);
      const startedAt =
        status === MaintenanceStatus.IN_PROGRESS || status === MaintenanceStatus.COMPLETED
          ? new Date(orderDate.getTime() + randomBetween(1, 24) * 3600000)
          : null;
      const completedAt =
        status === MaintenanceStatus.COMPLETED
          ? new Date(orderDate.getTime() + randomBetween(4, 72) * 3600000)
          : null;

      definitions.push({
        code: `OM-${String(++orderCodeCounter).padStart(6, '0')}`,
        equipmentCode: equipment.internalCode,
        type,
        status,
        scheduledDate: orderDate,
        startedAt,
        completedAt,
        description: `Mantenimiento ${type === MaintenanceType.PREVENTIVE ? 'preventivo' : 'correctivo'} programado.`,
        diagnosis: status === MaintenanceStatus.COMPLETED ? 'Equipo dentro de parámetros normales.' : null,
        actionsPerformed: status === MaintenanceStatus.COMPLETED ? 'Limpieza, calibración y pruebas funcionales.' : null,
        recommendations: status === MaintenanceStatus.COMPLETED ? 'Continuar monitoreo regular.' : null,
        finalEquipmentStatus: status === MaintenanceStatus.COMPLETED ? EquipmentStatus.ACTIVE : null,
        assignedToId: technician,
        createdById: creator,
      });
    }
  }
  return definitions;
}

function deriveMaintenanceStatus(orderDate: Date): MaintenanceStatus {
  const now = new Date();
  if (orderDate > now) return MaintenanceStatus.PENDING;
  const rand = Math.random();
  if (rand < 0.7) return MaintenanceStatus.COMPLETED;
  if (rand < 0.85) return MaintenanceStatus.CANCELLED;
  if (rand < 0.95) return MaintenanceStatus.IN_PROGRESS;
  return MaintenanceStatus.PENDING;
}

// ========================
// SEED MASIVO
// ========================
async function main() {
  console.log('🌱 Iniciando seed ultra masivo...');

  // 1. Empresas (sin city)
  const companiesMap = new Map<string, Awaited<ReturnType<typeof prisma.company.upsert>>>();
  for (const c of COMPANY_DEFINITIONS) {
    const company = await prisma.company.upsert({
      where: { nit: c.nit },
      update: { name: c.name, phone: c.phone, email: c.email, address: c.address, isActive: true },
      create: { name: c.name, nit: c.nit, phone: c.phone, email: c.email, address: c.address },
    });
    companiesMap.set(company.id, company);
  }
  const companies = Array.from(companiesMap.values());
  console.log(`✅ ${companies.length} empresas creadas.`);

  // 2. Sedes (usamos "Ciudad Principal" como city)
  const sitesMap = new Map<string, { id: string; companyId: string }[]>();
  let totalSites = 0;
  for (const company of companies) {
    const siteCount = randomBetween(4, 8);
    const usedNames = new Set<string>();
    const companySites: { id: string; companyId: string }[] = [];
    for (let i = 0; i < siteCount; i++) {
      let name = pickRandom(SITE_NAMES);
      while (usedNames.has(name)) name = pickRandom(SITE_NAMES);
      usedNames.add(name);
      const site = await upsertSite(company.id, {
        name,
        address: `Dirección ${name} - ${company.name}`,
        city: 'Ciudad Principal',
      });
      companySites.push(site);
    }
    sitesMap.set(company.id, companySites);
    totalSites += companySites.length;
  }
  console.log(`✅ ${totalSites} sedes creadas.`);

  // 3. Áreas
  const areasMap = new Map<string, { id: string; name: string }[]>();
  let totalAreas = 0;
  for (const [, sites] of sitesMap.entries()) {
    for (const site of sites) {
      const areaCount = randomBetween(18, 30);
      const selectedAreas = new Set<string>();
      while (selectedAreas.size < areaCount) {
        selectedAreas.add(pickRandom(AREA_NAMES));
      }
      const siteAreas: { id: string; name: string }[] = [];
      for (const areaName of selectedAreas) {
        const area = await upsertArea(site.id, {
          name: areaName,
          floor: String(randomBetween(1, 6)),
          description: `Área de ${areaName}`,
        });
        siteAreas.push(area);
      }
      areasMap.set(site.id, siteAreas);
      totalAreas += siteAreas.length;
    }
  }
  console.log(`✅ ${totalAreas} áreas creadas.`);

  // 4. Usuarios (contraseña Admin123.)
  const PASSWORD_HASH = await bcrypt.hash('Admin123.', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@vitatech.local' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@vitatech.local',
      passwordHash: PASSWORD_HASH,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  const techniciansByCompany = new Map<string, string[]>();
  const adminsByCompany = new Map<string, string[]>();
  const allUsers: { id: string; companyId: string | null; email: string }[] = [superAdmin];

  for (const company of companies) {
    const adminEmail = `admin.${company.name.toLowerCase().replace(/ /g, '')}@demo.com`;
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        name: `Admin ${company.name}`,
        email: adminEmail,
        passwordHash: PASSWORD_HASH,
        role: UserRole.ADMIN,
        companyId: company.id,
        isActive: true,
      },
    });
    adminsByCompany.set(company.id, [admin.id]);
    allUsers.push(admin);

    const techIds: string[] = [];
    const techCount = randomBetween(6, 10);
    for (let i = 0; i < techCount; i++) {
      const techEmail = `tecnico${i + 1}.${company.name.toLowerCase().replace(/ /g, '')}@demo.com`;
      const tech = await prisma.user.upsert({
        where: { email: techEmail },
        update: {},
        create: {
          name: `Técnico ${i + 1} ${company.name}`,
          email: techEmail,
          passwordHash: PASSWORD_HASH,
          role: UserRole.TECHNICIAN,
          companyId: company.id,
          isActive: true,
        },
      });
      techIds.push(tech.id);
      allUsers.push(tech);
    }
    techniciansByCompany.set(company.id, techIds);

    const viewerEmail = `viewer.${company.name.toLowerCase().replace(/ /g, '')}@demo.com`;
    const viewer = await prisma.user.upsert({
      where: { email: viewerEmail },
      update: {},
      create: {
        name: `Visualizador ${company.name}`,
        email: viewerEmail,
        passwordHash: PASSWORD_HASH,
        role: UserRole.VIEWER,
        companyId: company.id,
        isActive: true,
      },
    });
    allUsers.push(viewer);
  }
  console.log(`✅ ${allUsers.length} usuarios creados.`);

  // 5. Equipos
  console.log('🔧 Generando equipos...');
  const equipmentDefinitions = generateEquipmentDefinitions(companies, sitesMap, areasMap);
  const equipmentByCode = new Map<string, { id: string; internalCode: string; equipmentType: string; status: EquipmentStatus; companyId?: string }>();
  for (const def of equipmentDefinitions) {
    const equipment = await prisma.equipment.upsert({
      where: { companyId_internalCode: { companyId: def.companyId, internalCode: def.internalCode } },
      update: def,
      create: def,
    });
    equipmentByCode.set(equipment.internalCode, {
      id: equipment.id,
      internalCode: equipment.internalCode,
      equipmentType: def.equipmentType,
      status: def.status,
      companyId: def.companyId,
    });
  }
  console.log(`✅ ${equipmentByCode.size} equipos creados.`);

  // 6. Órdenes
  console.log('📋 Generando órdenes...');
  const orderDefinitions = generateOrderDefinitions(
    Array.from(equipmentByCode.values()),
    techniciansByCompany,
    adminsByCompany,
  );
  const ordersByCode = new Map<string, { id: string; code: string; status: MaintenanceStatus; type: MaintenanceType }>();

  for (let i = 0; i < orderDefinitions.length; i += 100) {
    const batch = orderDefinitions.slice(i, i + 100);
    for (const def of batch) {
      const equipment = equipmentByCode.get(def.equipmentCode);
      if (!equipment) continue;
      const { equipmentCode: _ec, ...orderData } = def;
      const order = await prisma.maintenanceOrder.upsert({
        where: { code: def.code },
        update: { ...orderData, equipmentId: equipment.id },
        create: { ...orderData, equipmentId: equipment.id },
      });
      ordersByCode.set(order.code, {
        id: order.id,
        code: order.code,
        status: def.status,
        type: def.type,
      });
    }
  }
  console.log(`✅ ${ordersByCode.size} órdenes creadas.`);

  // 7. Tareas
  console.log('📝 Generando tareas...');
  const allOrderIds = Array.from(ordersByCode.values()).map(o => o.id);
  await prisma.maintenanceTask.deleteMany({ where: { orderId: { in: allOrderIds } } });

  const taskTemplates = {
    PREVENTIVE: ['Limpieza externa', 'Verificación eléctrica', 'Prueba funcional', 'Calibración', 'Revisión de alarmas', 'Registro de observaciones', 'Cambio de filtros', 'Prueba de seguridad'],
    CORRECTIVE: ['Diagnóstico inicial', 'Identificación de falla', 'Corrección técnica', 'Prueba posterior', 'Recomendaciones', 'Verificación de parámetros'],
  };

  const tasksToCreate: { orderId: string; title: string; isCompleted: boolean; completedAt: Date | null }[] = [];
  for (const [, order] of ordersByCode.entries()) {
    const templates = taskTemplates[order.type] ?? taskTemplates.PREVENTIVE;
    const numTasks = randomBetween(5, templates.length + 2);
    const isCompleted = order.status === MaintenanceStatus.COMPLETED;
    for (let i = 0; i < numTasks; i++) {
      tasksToCreate.push({
        orderId: order.id,
        title: templates[i % templates.length],
        isCompleted,
        completedAt: isCompleted ? addDays(-1, 16) : null,
      });
    }
  }

  for (let i = 0; i < tasksToCreate.length; i += 5000) {
    const batch = tasksToCreate.slice(i, i + 5000);
    await prisma.maintenanceTask.createMany({ data: batch });
  }
  console.log(`✅ ${tasksToCreate.length} tareas creadas.`);

  // 8. Auditoría (100k)
  console.log('📊 Generando auditoría...');
  const existingAuditCount = await prisma.auditLog.count();
  const targetAudit = 100_000;
  if (existingAuditCount < targetAudit) {
    const toGenerate = targetAudit - existingAuditCount;
    const batchSize = 1000;
    for (let i = 0; i < toGenerate; i += batchSize) {
      const batch = [];
      const limit = Math.min(batchSize, toGenerate - i);
      for (let j = 0; j < limit; j++) {
        const user = pickRandom(allUsers);
        const action = pickRandom(Object.values(AUDIT_ACTIONS));
        const entity = pickRandom(Object.values(AUDIT_ENTITIES));
        batch.push({
          action,
          entity,
          entityId: `seed-${Date.now()}-${i + j}`,
          userId: user.id,
          newValue: { seed: true },
          createdAt: randomDate(new Date(2021, 0, 1), new Date()),
        });
      }
      await prisma.auditLog.createMany({ data: batch });
    }
    console.log(`✅ ${toGenerate} registros de auditoría añadidos (total ${targetAudit}).`);
  } else {
    console.log('ℹ️ Auditoría ya tiene suficientes registros.');
  }

  // 9. Resumen
  const counts = {
    companies: await prisma.company.count(),
    sites: await prisma.site.count(),
    areas: await prisma.area.count(),
    users: await prisma.user.count(),
    equipment: await prisma.equipment.count(),
    orders: await prisma.maintenanceOrder.count(),
    tasks: await prisma.maintenanceTask.count(),
    auditLogs: await prisma.auditLog.count(),
  };

  console.log('🎉 Seed ultra masivo completado.');
  console.log('📊 Dataset final:', counts);
  console.log('🔑 Contraseña estándar para todos los usuarios: Admin123.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
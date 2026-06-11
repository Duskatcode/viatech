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

const adapter = new PrismaPg(
  {
    connectionString: process.env.DATABASE_URL!,
  },
  {
    schema: 'public',
  },
);

const prisma = new PrismaClient({ adapter });

function addDays(days: number, hour = 10) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function upsertSite(
  companyId: string,
  data: {
    name: string;
    address: string;
    city: string;
  },
) {
  const existing = await prisma.site.findFirst({
    where: {
      companyId,
      name: data.name,
    },
  });

  if (existing) {
    return prisma.site.update({
      where: { id: existing.id },
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  return prisma.site.create({
    data: {
      ...data,
      companyId,
    },
  });
}

async function upsertArea(
  siteId: string,
  data: {
    name: string;
    floor: string;
    description: string;
  },
) {
  const existing = await prisma.area.findFirst({
    where: {
      siteId,
      name: data.name,
    },
  });

  if (existing) {
    return prisma.area.update({
      where: { id: existing.id },
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  return prisma.area.create({
    data: {
      ...data,
      siteId,
    },
  });
}

async function upsertAuditLog(data: {
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  newValue: Prisma.InputJsonValue;
}) {
  const existing = await prisma.auditLog.findFirst({
    where: {
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      userId: data.userId,
    },
  });

  if (existing) {
    return prisma.auditLog.update({
      where: { id: existing.id },
      data: {
        newValue: data.newValue,
      },
    });
  }

  return prisma.auditLog.create({
    data,
  });
}

async function main() {
  const defaultPassword = 'Admin12345!';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  const company = await prisma.company.upsert({
    where: { nit: '900000000-1' },
    update: {
      name: 'Clínica Metropolitana',
      phone: '6044441010',
      email: 'biomedica@clinicametro.demo',
      address: 'Carrera 48 # 20-85, Medellín',
      isActive: true,
    },
    create: {
      name: 'Clínica Metropolitana',
      nit: '900000000-1',
      phone: '6044441010',
      email: 'biomedica@clinicametro.demo',
      address: 'Carrera 48 # 20-85, Medellín',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@biomed.local' },
    update: {
      name: 'Admin Demo',
      passwordHash,
      role: UserRole.ADMIN,
      companyId: company.id,
      isActive: true,
    },
    create: {
      name: 'Admin Demo',
      email: 'admin@biomed.local',
      passwordHash,
      role: UserRole.ADMIN,
      companyId: company.id,
    },
  });

  const technician = await prisma.user.upsert({
    where: { email: 'tecnico@biomed.local' },
    update: {
      name: 'Técnico Biomédico Demo',
      passwordHash,
      role: UserRole.TECHNICIAN,
      companyId: company.id,
      isActive: true,
    },
    create: {
      name: 'Técnico Biomédico Demo',
      email: 'tecnico@biomed.local',
      passwordHash,
      role: UserRole.TECHNICIAN,
      companyId: company.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'visualizador@biomed.local' },
    update: {
      name: 'Visualizador Demo',
      passwordHash,
      role: UserRole.VIEWER,
      companyId: company.id,
      isActive: true,
    },
    create: {
      name: 'Visualizador Demo',
      email: 'visualizador@biomed.local',
      passwordHash,
      role: UserRole.VIEWER,
      companyId: company.id,
    },
  });

  const mainSite = await upsertSite(company.id, {
    name: 'Sede Principal',
    city: 'Medellín',
    address: 'Carrera 48 # 20-85',
  });

  const northSite = await upsertSite(company.id, {
    name: 'Sede Norte',
    city: 'Medellín',
    address: 'Calle 104 # 52-18',
  });

  const areas = {
    urgencias: await upsertArea(mainSite.id, {
      name: 'Urgencias',
      floor: '1',
      description: 'Atención inicial, observación y estabilización.',
    }),
    uci: await upsertArea(mainSite.id, {
      name: 'UCI',
      floor: '3',
      description: 'Unidad de cuidados intensivos para pacientes críticos.',
    }),
    cirugia: await upsertArea(mainSite.id, {
      name: 'Cirugía',
      floor: '4',
      description: 'Quirófanos y central de apoyo quirúrgico.',
    }),
    hospitalizacion: await upsertArea(northSite.id, {
      name: 'Hospitalización',
      floor: '2',
      description: 'Hospitalización general y cuidado neonatal.',
    }),
    imagenologia: await upsertArea(northSite.id, {
      name: 'Imagenología',
      floor: '1',
      description: 'Diagnóstico por imágenes y apoyo ambulatorio.',
    }),
  };

  const equipmentDefinitions = [
    {
      internalCode: 'EQ-DEMO-001',
      name: 'Pulsoxímetro Adulto',
      brand: 'Masimo',
      model: 'Rad-5',
      serialNumber: 'MAS-R5-24001',
      equipmentType: 'Monitorización',
      riskLevel: 'IIA',
      status: EquipmentStatus.ACTIVE,
      siteId: mainSite.id,
      areaId: areas.urgencias.id,
      purchaseDate: addDays(-720),
      installationDate: addDays(-710),
      warrantyUntil: addDays(180),
      notes: 'Equipo portátil asignado a observación de adultos.',
    },
    {
      internalCode: 'EQ-DEMO-002',
      name: 'Monitor Multiparámetro',
      brand: 'Mindray',
      model: 'BeneVision N12',
      serialNumber: 'MDR-N12-24002',
      equipmentType: 'Monitorización',
      riskLevel: 'IIB',
      status: EquipmentStatus.ACTIVE,
      siteId: mainSite.id,
      areaId: areas.uci.id,
      purchaseDate: addDays(-690),
      installationDate: addDays(-680),
      warrantyUntil: addDays(20),
      notes: 'Monitor de cabecera con ECG, SpO2, PANI y temperatura.',
    },
    {
      internalCode: 'EQ-DEMO-003',
      name: 'Bomba de Infusión',
      brand: 'B. Braun',
      model: 'Infusomat Space',
      serialNumber: 'BBR-IS-24003',
      equipmentType: 'Infusión',
      riskLevel: 'IIB',
      status: EquipmentStatus.IN_MAINTENANCE,
      siteId: mainSite.id,
      areaId: areas.uci.id,
      purchaseDate: addDays(-540),
      installationDate: addDays(-535),
      warrantyUntil: addDays(150),
      notes: 'En revisión por alarma intermitente de presión.',
    },
    {
      internalCode: 'EQ-DEMO-004',
      name: 'Desfibrilador Externo',
      brand: 'Zoll',
      model: 'R Series',
      serialNumber: 'ZOL-RS-24004',
      equipmentType: 'Reanimación',
      riskLevel: 'III',
      status: EquipmentStatus.ACTIVE,
      siteId: mainSite.id,
      areaId: areas.urgencias.id,
      purchaseDate: addDays(-820),
      installationDate: addDays(-815),
      warrantyUntil: addDays(12),
      notes: 'Incluye marcapasos transcutáneo y palas externas.',
    },
    {
      internalCode: 'EQ-DEMO-005',
      name: 'Ventilador Mecánico',
      brand: 'Dräger',
      model: 'Evita V300',
      serialNumber: 'DRA-EV-24005',
      equipmentType: 'Soporte vital',
      riskLevel: 'III',
      status: EquipmentStatus.OUT_OF_SERVICE,
      siteId: mainSite.id,
      areaId: areas.uci.id,
      purchaseDate: addDays(-980),
      installationDate: addDays(-970),
      warrantyUntil: addDays(-120),
      notes: 'Fuera de servicio por falla en el módulo de flujo.',
    },
    {
      internalCode: 'EQ-DEMO-006',
      name: 'Electrocardiógrafo',
      brand: 'GE Healthcare',
      model: 'MAC 2000',
      serialNumber: 'GE-MAC-24006',
      equipmentType: 'Diagnóstico',
      riskLevel: 'IIA',
      status: EquipmentStatus.ACTIVE,
      siteId: northSite.id,
      areaId: areas.imagenologia.id,
      purchaseDate: addDays(-430),
      installationDate: addDays(-425),
      warrantyUntil: addDays(300),
      notes: 'Electrocardiógrafo de 12 derivaciones.',
    },
    {
      internalCode: 'EQ-DEMO-007',
      name: 'Autoclave de Mesa',
      brand: 'Tuttnauer',
      model: '3870EA',
      serialNumber: 'TUT-3870-24007',
      equipmentType: 'Esterilización',
      riskLevel: 'IIB',
      status: EquipmentStatus.ACTIVE,
      siteId: mainSite.id,
      areaId: areas.cirugia.id,
      purchaseDate: addDays(-760),
      installationDate: addDays(-755),
      warrantyUntil: addDays(90),
      notes: 'Autoclave para instrumental de procedimientos menores.',
    },
    {
      internalCode: 'EQ-DEMO-008',
      name: 'Aspirador de Secreciones',
      brand: 'Allied Healthcare',
      model: 'Gomco 6000',
      serialNumber: 'AH-G6-24008',
      equipmentType: 'Terapia respiratoria',
      riskLevel: 'IIA',
      status: EquipmentStatus.IN_MAINTENANCE,
      siteId: northSite.id,
      areaId: areas.hospitalizacion.id,
      purchaseDate: addDays(-350),
      installationDate: addDays(-345),
      warrantyUntil: addDays(210),
      notes: 'Mantenimiento correctivo por pérdida de vacío.',
    },
    {
      internalCode: 'EQ-DEMO-009',
      name: 'Lámpara Cialítica',
      brand: 'Dr. Mach',
      model: 'LED 3MC',
      serialNumber: 'MAC-LED-24009',
      equipmentType: 'Iluminación quirúrgica',
      riskLevel: 'I',
      status: EquipmentStatus.ACTIVE,
      siteId: mainSite.id,
      areaId: areas.cirugia.id,
      purchaseDate: addDays(-610),
      installationDate: addDays(-600),
      warrantyUntil: addDays(240),
      notes: 'Lámpara principal del quirófano 2.',
    },
    {
      internalCode: 'EQ-DEMO-010',
      name: 'Incubadora Neonatal',
      brand: 'Atom Medical',
      model: 'Incu i',
      serialNumber: 'ATM-II-24010',
      equipmentType: 'Cuidado neonatal',
      riskLevel: 'IIB',
      status: EquipmentStatus.ACTIVE,
      siteId: northSite.id,
      areaId: areas.hospitalizacion.id,
      purchaseDate: addDays(-500),
      installationDate: addDays(-495),
      warrantyUntil: addDays(28),
      notes: 'Incubadora con control servo de temperatura y humedad.',
    },
  ];

  const equipmentByCode = new Map<string, { id: string; name: string }>();

  for (const definition of equipmentDefinitions) {
    const equipment = await prisma.equipment.upsert({
      where: {
        companyId_internalCode: {
          companyId: company.id,
          internalCode: definition.internalCode,
        },
      },
      update: {
        ...definition,
        companyId: company.id,
      },
      create: {
        ...definition,
        companyId: company.id,
      },
    });

    equipmentByCode.set(equipment.internalCode, equipment);
  }

  const orderDefinitions = [
    {
      code: 'MTTO-DEMO-001',
      equipmentCode: 'EQ-DEMO-001',
      type: MaintenanceType.PREVENTIVE,
      status: MaintenanceStatus.PENDING,
      scheduledDate: addDays(7, 9),
      startedAt: null,
      completedAt: null,
      description:
        'Mantenimiento preventivo semestral y verificación de lectura.',
      diagnosis: null,
      actionsPerformed: null,
      recommendations: null,
      finalEquipmentStatus: null,
    },
    {
      code: 'MTTO-DEMO-002',
      equipmentCode: 'EQ-DEMO-003',
      type: MaintenanceType.CORRECTIVE,
      status: MaintenanceStatus.IN_PROGRESS,
      scheduledDate: addDays(-2, 8),
      startedAt: addDays(-1, 8),
      completedAt: null,
      description: 'Diagnóstico de alarma intermitente de presión.',
      diagnosis: 'Posible obstrucción en el sistema de detección de presión.',
      actionsPerformed: 'Desmontaje inicial y limpieza del mecanismo.',
      recommendations: null,
      finalEquipmentStatus: null,
    },
    {
      code: 'MTTO-DEMO-003',
      equipmentCode: 'EQ-DEMO-002',
      type: MaintenanceType.PREVENTIVE,
      status: MaintenanceStatus.COMPLETED,
      scheduledDate: addDays(-18, 9),
      startedAt: addDays(-18, 9),
      completedAt: addDays(-18, 12),
      description: 'Mantenimiento preventivo anual del monitor multiparámetro.',
      diagnosis: 'Equipo funcional, sin desviaciones críticas.',
      actionsPerformed: 'Limpieza, pruebas de ECG, SpO2, PANI y alarmas.',
      recommendations: 'Mantener limpieza semanal de sensores y cables.',
      finalEquipmentStatus: EquipmentStatus.ACTIVE,
    },
    {
      code: 'MTTO-DEMO-004',
      equipmentCode: 'EQ-DEMO-005',
      type: MaintenanceType.CORRECTIVE,
      status: MaintenanceStatus.PENDING,
      scheduledDate: addDays(-8, 8),
      startedAt: null,
      completedAt: null,
      description: 'Revisión prioritaria por falla en el módulo de flujo.',
      diagnosis: null,
      actionsPerformed: null,
      recommendations: null,
      finalEquipmentStatus: null,
    },
    {
      code: 'MTTO-DEMO-005',
      equipmentCode: 'EQ-DEMO-004',
      type: MaintenanceType.PREVENTIVE,
      status: MaintenanceStatus.PENDING,
      scheduledDate: addDays(14, 10),
      startedAt: null,
      completedAt: null,
      description: 'Prueba de descarga, batería, palas y marcapasos.',
      diagnosis: null,
      actionsPerformed: null,
      recommendations: null,
      finalEquipmentStatus: null,
    },
    {
      code: 'MTTO-DEMO-006',
      equipmentCode: 'EQ-DEMO-007',
      type: MaintenanceType.CORRECTIVE,
      status: MaintenanceStatus.COMPLETED,
      scheduledDate: addDays(-35, 7),
      startedAt: addDays(-35, 7),
      completedAt: addDays(-34, 15),
      description: 'Corrección de fuga leve en sello de puerta.',
      diagnosis: 'Desgaste del empaque de silicona de la puerta.',
      actionsPerformed: 'Cambio de empaque y ciclo completo de validación.',
      recommendations: 'Inspeccionar el sello al inicio de cada jornada.',
      finalEquipmentStatus: EquipmentStatus.ACTIVE,
    },
    {
      code: 'MTTO-DEMO-007',
      equipmentCode: 'EQ-DEMO-006',
      type: MaintenanceType.CORRECTIVE,
      status: MaintenanceStatus.CANCELLED,
      scheduledDate: addDays(-12, 11),
      startedAt: null,
      completedAt: null,
      description: 'Revisión por impresión tenue del trazado.',
      diagnosis: 'Solicitud duplicada; el papel térmico estaba agotado.',
      actionsPerformed: null,
      recommendations: 'Mantener inventario mínimo de consumibles.',
      finalEquipmentStatus: null,
    },
    {
      code: 'MTTO-DEMO-008',
      equipmentCode: 'EQ-DEMO-008',
      type: MaintenanceType.CORRECTIVE,
      status: MaintenanceStatus.IN_PROGRESS,
      scheduledDate: addDays(3, 14),
      startedAt: addDays(0, 8),
      completedAt: null,
      description: 'Recuperación de nivel de vacío y revisión de mangueras.',
      diagnosis: 'Fuga en conexión interna y filtro saturado.',
      actionsPerformed: 'Cambio de filtro y ajuste de conexiones.',
      recommendations: null,
      finalEquipmentStatus: null,
    },
  ];

  const ordersByCode = new Map<string, { id: string; code: string }>();

  for (const definition of orderDefinitions) {
    const equipment = equipmentByCode.get(definition.equipmentCode);

    if (!equipment) {
      throw new Error(`Missing demo equipment: ${definition.equipmentCode}`);
    }

    const { equipmentCode: _equipmentCode, ...orderData } = definition;
    const order = await prisma.maintenanceOrder.upsert({
      where: { code: definition.code },
      update: {
        ...orderData,
        equipmentId: equipment.id,
        assignedToId: technician.id,
        createdById: admin.id,
      },
      create: {
        ...orderData,
        equipmentId: equipment.id,
        assignedToId: technician.id,
        createdById: admin.id,
      },
    });

    ordersByCode.set(order.code, order);
  }

  const taskDefinitions: Record<
    string,
    Array<{ title: string; isCompleted: boolean }>
  > = {
    'MTTO-DEMO-001': [
      { title: 'Limpieza externa', isCompleted: false },
      { title: 'Prueba funcional', isCompleted: false },
      { title: 'Verificación de lectura de SpO2', isCompleted: false },
    ],
    'MTTO-DEMO-002': [
      { title: 'Inspección del mecanismo', isCompleted: true },
      { title: 'Verificación eléctrica', isCompleted: true },
      { title: 'Prueba funcional', isCompleted: false },
      { title: 'Registro de observaciones', isCompleted: false },
    ],
    'MTTO-DEMO-003': [
      { title: 'Limpieza externa', isCompleted: true },
      { title: 'Verificación eléctrica', isCompleted: true },
      { title: 'Calibración', isCompleted: true },
      { title: 'Revisión de alarmas', isCompleted: true },
    ],
    'MTTO-DEMO-004': [
      { title: 'Verificación eléctrica', isCompleted: false },
      { title: 'Revisión de alarmas', isCompleted: false },
      { title: 'Prueba del módulo de flujo', isCompleted: false },
    ],
    'MTTO-DEMO-005': [
      { title: 'Prueba de descarga', isCompleted: false },
      { title: 'Revisión de batería', isCompleted: false },
      { title: 'Verificación de alarmas', isCompleted: false },
    ],
    'MTTO-DEMO-006': [
      { title: 'Cambio de empaque', isCompleted: true },
      { title: 'Prueba funcional', isCompleted: true },
      { title: 'Registro de observaciones', isCompleted: true },
    ],
    'MTTO-DEMO-007': [
      { title: 'Revisión de impresión', isCompleted: false },
      { title: 'Registro de observaciones', isCompleted: false },
    ],
    'MTTO-DEMO-008': [
      { title: 'Limpieza externa', isCompleted: true },
      { title: 'Cambio de filtro', isCompleted: true },
      { title: 'Prueba funcional', isCompleted: false },
    ],
  };

  const demoOrderIds = [...ordersByCode.values()].map((order) => order.id);

  await prisma.maintenanceTask.deleteMany({
    where: {
      orderId: {
        in: demoOrderIds,
      },
    },
  });

  await prisma.maintenanceTask.createMany({
    data: Object.entries(taskDefinitions).flatMap(([orderCode, tasks]) => {
      const order = ordersByCode.get(orderCode);

      if (!order) {
        throw new Error(`Missing demo order: ${orderCode}`);
      }

      return tasks.map((task) => ({
        orderId: order.id,
        title: task.title,
        isCompleted: task.isCompleted,
        completedAt: task.isCompleted ? addDays(-1, 16) : null,
      }));
    }),
  });

  for (const definition of equipmentDefinitions) {
    const equipment = equipmentByCode.get(definition.internalCode);

    if (!equipment) continue;

    await upsertAuditLog({
      action: AUDIT_ACTIONS.EQUIPMENT_CREATED,
      entity: AUDIT_ENTITIES.EQUIPMENT,
      entityId: equipment.id,
      userId: admin.id,
      newValue: {
        seed: true,
        internalCode: definition.internalCode,
        name: definition.name,
        status: definition.status,
      },
    });
  }

  for (const definition of orderDefinitions) {
    const order = ordersByCode.get(definition.code);

    if (!order) continue;

    await upsertAuditLog({
      action: AUDIT_ACTIONS.MAINTENANCE_ORDER_CREATED,
      entity: AUDIT_ENTITIES.MAINTENANCE_ORDER,
      entityId: order.id,
      userId: admin.id,
      newValue: {
        seed: true,
        code: definition.code,
        type: definition.type,
        status: definition.status,
      },
    });

    const statusAction =
      definition.status === MaintenanceStatus.IN_PROGRESS
        ? AUDIT_ACTIONS.MAINTENANCE_ORDER_STARTED
        : definition.status === MaintenanceStatus.COMPLETED
          ? AUDIT_ACTIONS.MAINTENANCE_ORDER_COMPLETED
          : definition.status === MaintenanceStatus.CANCELLED
            ? AUDIT_ACTIONS.MAINTENANCE_ORDER_CANCELLED
            : null;

    if (statusAction) {
      await upsertAuditLog({
        action: statusAction,
        entity: AUDIT_ENTITIES.MAINTENANCE_ORDER,
        entityId: order.id,
        userId: admin.id,
        newValue: {
          seed: true,
          code: definition.code,
          status: definition.status,
        },
      });
    }
  }

  const completedOrder = ordersByCode.get('MTTO-DEMO-003');

  if (completedOrder) {
    await upsertAuditLog({
      action: AUDIT_ACTIONS.REPORT_PDF_EXPORTED,
      entity: AUDIT_ENTITIES.REPORT,
      entityId: `maintenance-order-${completedOrder.id}`,
      userId: admin.id,
      newValue: {
        seed: true,
        report: 'maintenance-order-pdf',
        orderId: completedOrder.id,
        code: completedOrder.code,
      },
    });
  }

  const counts = {
    companies: await prisma.company.count({
      where: { id: company.id },
    }),
    sites: await prisma.site.count({
      where: { companyId: company.id },
    }),
    areas: await prisma.area.count({
      where: {
        site: {
          companyId: company.id,
        },
      },
    }),
    users: await prisma.user.count({
      where: { companyId: company.id },
    }),
    equipment: await prisma.equipment.count({
      where: { companyId: company.id },
    }),
    orders: await prisma.maintenanceOrder.count({
      where: {
        equipment: {
          companyId: company.id,
        },
      },
    }),
    auditLogs: await prisma.auditLog.count({
      where: { userId: admin.id },
    }),
  };

  console.log('Seed completed successfully.');
  console.log('Demo dataset:', counts);
  console.log('Demo admin:');
  console.log('Email: admin@biomed.local');
  console.log(`Password: ${defaultPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

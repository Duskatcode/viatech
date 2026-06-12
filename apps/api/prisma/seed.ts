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

async function main() {
  const metroCompany = await prisma.company.upsert({
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

  const rafaelCompany = await prisma.company.upsert({
    where: { nit: '900000000-2' },
    update: {
      name: 'Hospital San Rafael Demo',
      phone: '6044442020',
      email: 'biomedica@sanrafael.demo',
      address: 'Calle 38 Sur # 27-120, Envigado',
      isActive: true,
    },
    create: {
      name: 'Hospital San Rafael Demo',
      nit: '900000000-2',
      phone: '6044442020',
      email: 'biomedica@sanrafael.demo',
      address: 'Calle 38 Sur # 27-120, Envigado',
    },
  });

  const userDefinitions = [
    {
      name: 'Super Admin Demo',
      email: 'superadmin@biomed.local',
      password: 'SuperAdmin123!',
      role: UserRole.SUPER_ADMIN,
      companyId: null,
    },
    {
      name: 'Admin Demo',
      email: 'admin@biomed.local',
      password: 'Admin12345!',
      role: UserRole.ADMIN,
      companyId: metroCompany.id,
    },
    {
      name: 'Admin Clínica Metropolitana',
      email: 'admin.metro@biomed.local',
      password: 'AdminMetro123!',
      role: UserRole.ADMIN,
      companyId: metroCompany.id,
    },
    {
      name: 'Técnico Biomédico Demo',
      email: 'tecnico@biomed.local',
      password: 'Tecnico123!',
      role: UserRole.TECHNICIAN,
      companyId: metroCompany.id,
    },
    {
      name: 'Auditor Clínica Metropolitana',
      email: 'auditor.metro@biomed.local',
      password: 'AuditorMetro123!',
      role: UserRole.VIEWER,
      companyId: metroCompany.id,
    },
    {
      name: 'Admin Hospital San Rafael',
      email: 'admin.rafael@biomed.local',
      password: 'AdminRafael123!',
      role: UserRole.ADMIN,
      companyId: rafaelCompany.id,
    },
    {
      name: 'Técnico Hospital San Rafael',
      email: 'tecnico.rafael@biomed.local',
      password: 'TecnicoRafael123!',
      role: UserRole.TECHNICIAN,
      companyId: rafaelCompany.id,
    },
    {
      name: 'Auditor Hospital San Rafael',
      email: 'auditor.rafael@biomed.local',
      password: 'AuditorRafael123!',
      role: UserRole.VIEWER,
      companyId: rafaelCompany.id,
    },
  ];

  const usersByEmail = new Map<
    string,
    { id: string; email: string; companyId: string | null }
  >();

  for (const definition of userDefinitions) {
    const passwordHash = await bcrypt.hash(definition.password, 12);
    const user = await prisma.user.upsert({
      where: { email: definition.email },
      update: {
        name: definition.name,
        passwordHash,
        role: definition.role,
        companyId: definition.companyId,
        isActive: true,
      },
      create: {
        name: definition.name,
        email: definition.email,
        passwordHash,
        role: definition.role,
        companyId: definition.companyId,
      },
    });

    usersByEmail.set(user.email, user);
  }

  const metroAdmin = usersByEmail.get('admin@biomed.local');
  const metroTechnician = usersByEmail.get('tecnico@biomed.local');
  const rafaelAdmin = usersByEmail.get('admin.rafael@biomed.local');
  const rafaelTechnician = usersByEmail.get('tecnico.rafael@biomed.local');

  if (!metroAdmin || !metroTechnician || !rafaelAdmin || !rafaelTechnician) {
    throw new Error('Missing required demo users');
  }

  const metroMainSite = await upsertSite(metroCompany.id, {
    name: 'Sede Principal',
    city: 'Medellín',
    address: 'Carrera 48 # 20-85',
  });
  const metroNorthSite = await upsertSite(metroCompany.id, {
    name: 'Sede Norte',
    city: 'Medellín',
    address: 'Calle 104 # 52-18',
  });
  const rafaelCentralSite = await upsertSite(rafaelCompany.id, {
    name: 'Sede Central',
    city: 'Envigado',
    address: 'Calle 38 Sur # 27-120',
  });
  const rafaelOutpatientSite = await upsertSite(rafaelCompany.id, {
    name: 'Consulta Externa',
    city: 'Envigado',
    address: 'Carrera 43A # 25 Sur-50',
  });

  const areas = {
    metroUrgencias: await upsertArea(metroMainSite.id, {
      name: 'Urgencias',
      floor: '1',
      description: 'Atención inicial, observación y estabilización.',
    }),
    metroUci: await upsertArea(metroMainSite.id, {
      name: 'UCI',
      floor: '3',
      description: 'Unidad de cuidados intensivos para pacientes críticos.',
    }),
    metroCirugia: await upsertArea(metroMainSite.id, {
      name: 'Cirugía',
      floor: '4',
      description: 'Quirófanos y central de apoyo quirúrgico.',
    }),
    metroHospitalizacion: await upsertArea(metroNorthSite.id, {
      name: 'Hospitalización',
      floor: '2',
      description: 'Hospitalización general y cuidado neonatal.',
    }),
    metroImagenologia: await upsertArea(metroNorthSite.id, {
      name: 'Imagenología',
      floor: '1',
      description: 'Diagnóstico por imágenes y apoyo ambulatorio.',
    }),
    rafaelUrgencias: await upsertArea(rafaelCentralSite.id, {
      name: 'Urgencias',
      floor: '1',
      description: 'Urgencias generales y observación clínica.',
    }),
    rafaelHospitalizacion: await upsertArea(rafaelCentralSite.id, {
      name: 'Hospitalización',
      floor: '2',
      description: 'Hospitalización de adultos.',
    }),
    rafaelEsterilizacion: await upsertArea(rafaelCentralSite.id, {
      name: 'Esterilización',
      floor: '1',
      description: 'Procesamiento y esterilización de instrumental.',
    }),
    rafaelConsultaPrioritaria: await upsertArea(rafaelOutpatientSite.id, {
      name: 'Consulta Prioritaria',
      floor: '1',
      description: 'Atención ambulatoria prioritaria.',
    }),
    rafaelProcedimientos: await upsertArea(rafaelOutpatientSite.id, {
      name: 'Procedimientos Menores',
      floor: '2',
      description: 'Sala de procedimientos ambulatorios.',
    }),
  };

  const equipmentDefinitions: DemoEquipmentDefinition[] = [
    {
      companyId: metroCompany.id,
      internalCode: 'EQ-MET-001',
      name: 'Pulsoxímetro Adulto',
      brand: 'ChoiceMMed',
      model: 'MD300C',
      serialNumber: 'MET-PUL-001',
      equipmentType: 'Monitorización',
      riskLevel: 'IIA',
      status: EquipmentStatus.ACTIVE,
      siteId: metroMainSite.id,
      areaId: areas.metroUrgencias.id,
      purchaseDate: addDays(-720),
      installationDate: addDays(-710),
      warrantyUntil: addDays(180),
      notes: 'Equipo portátil para observación de pacientes adultos.',
    },
    {
      companyId: metroCompany.id,
      internalCode: 'EQ-MET-002',
      name: 'Monitor Multiparámetro',
      brand: 'Mindray',
      model: 'BeneVision N12',
      serialNumber: 'MET-MON-002',
      equipmentType: 'Monitorización',
      riskLevel: 'IIB',
      status: EquipmentStatus.ACTIVE,
      siteId: metroMainSite.id,
      areaId: areas.metroUci.id,
      purchaseDate: addDays(-690),
      installationDate: addDays(-680),
      warrantyUntil: addDays(210),
      notes: 'Monitor de cabecera con ECG, SpO2, PANI y temperatura.',
    },
    {
      companyId: metroCompany.id,
      internalCode: 'EQ-MET-003',
      name: 'Bomba de Infusión',
      brand: 'B. Braun',
      model: 'Infusomat Space',
      serialNumber: 'MET-INF-003',
      equipmentType: 'Infusión',
      riskLevel: 'IIB',
      status: EquipmentStatus.IN_MAINTENANCE,
      siteId: metroMainSite.id,
      areaId: areas.metroUci.id,
      purchaseDate: addDays(-540),
      installationDate: addDays(-535),
      warrantyUntil: addDays(150),
      notes: 'En revisión por alarma intermitente de presión.',
    },
    {
      companyId: metroCompany.id,
      internalCode: 'EQ-MET-004',
      name: 'Desfibrilador Externo',
      brand: 'Zoll',
      model: 'R Series',
      serialNumber: 'MET-DES-004',
      equipmentType: 'Reanimación',
      riskLevel: 'III',
      status: EquipmentStatus.ACTIVE,
      siteId: metroMainSite.id,
      areaId: areas.metroUrgencias.id,
      purchaseDate: addDays(-820),
      installationDate: addDays(-815),
      warrantyUntil: addDays(12),
      notes: 'Garantía próxima a vencer. Incluye marcapasos transcutáneo.',
    },
    {
      companyId: metroCompany.id,
      internalCode: 'EQ-MET-005',
      name: 'Ventilador Mecánico',
      brand: 'Dräger',
      model: 'Evita V300',
      serialNumber: 'MET-VEN-005',
      equipmentType: 'Soporte vital',
      riskLevel: 'III',
      status: EquipmentStatus.OUT_OF_SERVICE,
      siteId: metroMainSite.id,
      areaId: areas.metroUci.id,
      purchaseDate: addDays(-980),
      installationDate: addDays(-970),
      warrantyUntil: addDays(-120),
      notes: 'Equipo crítico fuera de servicio por falla del módulo de flujo.',
    },
    {
      companyId: metroCompany.id,
      internalCode: 'EQ-MET-006',
      name: 'Electrocardiógrafo',
      brand: 'GE Healthcare',
      model: 'MAC 2000',
      serialNumber: 'MET-ECG-006',
      equipmentType: 'Diagnóstico',
      riskLevel: 'IIA',
      status: EquipmentStatus.ACTIVE,
      siteId: metroNorthSite.id,
      areaId: areas.metroImagenologia.id,
      purchaseDate: addDays(-430),
      installationDate: addDays(-425),
      warrantyUntil: addDays(300),
      notes: 'Electrocardiógrafo de doce derivaciones.',
    },
    {
      companyId: metroCompany.id,
      internalCode: 'EQ-MET-007',
      name: 'Autoclave de Mesa',
      brand: 'Tuttnauer',
      model: '2540M',
      serialNumber: 'MET-AUT-007',
      equipmentType: 'Esterilización',
      riskLevel: 'IIA',
      status: EquipmentStatus.ACTIVE,
      siteId: metroMainSite.id,
      areaId: areas.metroCirugia.id,
      purchaseDate: addDays(-760),
      installationDate: addDays(-755),
      warrantyUntil: addDays(90),
      notes: 'Autoclave para instrumental de procedimientos menores.',
    },
    {
      companyId: metroCompany.id,
      internalCode: 'EQ-MET-008',
      name: 'Aspirador de Secreciones',
      brand: 'Allied Healthcare',
      model: 'Gomco 6000',
      serialNumber: 'MET-ASP-008',
      equipmentType: 'Terapia respiratoria',
      riskLevel: 'IIA',
      status: EquipmentStatus.IN_MAINTENANCE,
      siteId: metroNorthSite.id,
      areaId: areas.metroHospitalizacion.id,
      purchaseDate: addDays(-350),
      installationDate: addDays(-345),
      warrantyUntil: addDays(210),
      notes: 'Mantenimiento correctivo por pérdida de vacío.',
    },
    {
      companyId: metroCompany.id,
      internalCode: 'EQ-MET-009',
      name: 'Lámpara Cialítica',
      brand: 'Dr. Mach',
      model: 'LED 3SC',
      serialNumber: 'MET-LAM-009',
      equipmentType: 'Iluminación quirúrgica',
      riskLevel: 'I',
      status: EquipmentStatus.ACTIVE,
      siteId: metroMainSite.id,
      areaId: areas.metroCirugia.id,
      purchaseDate: addDays(-610),
      installationDate: addDays(-600),
      warrantyUntil: addDays(240),
      notes: 'Lámpara principal del quirófano dos.',
    },
    {
      companyId: metroCompany.id,
      internalCode: 'EQ-MET-010',
      name: 'Incubadora Neonatal',
      brand: 'Atom Medical',
      model: 'Incu i',
      serialNumber: 'MET-INC-010',
      equipmentType: 'Cuidado neonatal',
      riskLevel: 'IIB',
      status: EquipmentStatus.ACTIVE,
      siteId: metroNorthSite.id,
      areaId: areas.metroHospitalizacion.id,
      purchaseDate: addDays(-500),
      installationDate: addDays(-495),
      warrantyUntil: addDays(28),
      notes: 'Garantía próxima a vencer. Control servo de temperatura.',
    },
    {
      companyId: rafaelCompany.id,
      internalCode: 'EQ-RAF-001',
      name: 'Monitor de Signos Vitales',
      brand: 'Philips',
      model: 'SureSigns VM6',
      serialNumber: 'RAF-MON-001',
      equipmentType: 'Monitorización',
      riskLevel: 'IIA',
      status: EquipmentStatus.ACTIVE,
      siteId: rafaelCentralSite.id,
      areaId: areas.rafaelUrgencias.id,
      purchaseDate: addDays(-460),
      installationDate: addDays(-455),
      warrantyUntil: addDays(200),
      notes: 'Monitor de signos vitales para observación de urgencias.',
    },
    {
      companyId: rafaelCompany.id,
      internalCode: 'EQ-RAF-002',
      name: 'Bomba de Infusión Volumétrica',
      brand: 'Hospira',
      model: 'Plum A+',
      serialNumber: 'RAF-INF-002',
      equipmentType: 'Infusión',
      riskLevel: 'IIB',
      status: EquipmentStatus.ACTIVE,
      siteId: rafaelCentralSite.id,
      areaId: areas.rafaelHospitalizacion.id,
      purchaseDate: addDays(-620),
      installationDate: addDays(-615),
      warrantyUntil: addDays(120),
      notes: 'Bomba volumétrica para hospitalización de adultos.',
    },
    {
      companyId: rafaelCompany.id,
      internalCode: 'EQ-RAF-003',
      name: 'Esterilizador Rápido',
      brand: 'Steris',
      model: 'AMSCO 400',
      serialNumber: 'RAF-EST-003',
      equipmentType: 'Esterilización',
      riskLevel: 'IIA',
      status: EquipmentStatus.OUT_OF_SERVICE,
      siteId: rafaelCentralSite.id,
      areaId: areas.rafaelEsterilizacion.id,
      purchaseDate: addDays(-880),
      installationDate: addDays(-870),
      warrantyUntil: addDays(-90),
      notes: 'Fuera de servicio por pérdida de presión en el ciclo rápido.',
    },
    {
      companyId: rafaelCompany.id,
      internalCode: 'EQ-RAF-004',
      name: 'Electrocardiógrafo Portátil',
      brand: 'Welch Allyn',
      model: 'CP 150',
      serialNumber: 'RAF-ECG-004',
      equipmentType: 'Diagnóstico',
      riskLevel: 'IIA',
      status: EquipmentStatus.ACTIVE,
      siteId: rafaelOutpatientSite.id,
      areaId: areas.rafaelConsultaPrioritaria.id,
      purchaseDate: addDays(-330),
      installationDate: addDays(-325),
      warrantyUntil: addDays(250),
      notes: 'Equipo portátil para consulta prioritaria.',
    },
    {
      companyId: rafaelCompany.id,
      internalCode: 'EQ-RAF-005',
      name: 'Tensiómetro Digital Clínico',
      brand: 'Omron',
      model: 'HEM-907',
      serialNumber: 'RAF-TEN-005',
      equipmentType: 'Diagnóstico',
      riskLevel: 'I',
      status: EquipmentStatus.ACTIVE,
      siteId: rafaelOutpatientSite.id,
      areaId: areas.rafaelProcedimientos.id,
      purchaseDate: addDays(-270),
      installationDate: addDays(-265),
      warrantyUntil: addDays(25),
      notes: 'Garantía próxima a vencer para apoyar alertas de la empresa.',
    },
  ];

  const equipmentByCode = new Map<string, { id: string; name: string }>();

  for (const definition of equipmentDefinitions) {
    const equipment = await prisma.equipment.upsert({
      where: {
        companyId_internalCode: {
          companyId: definition.companyId,
          internalCode: definition.internalCode,
        },
      },
      update: definition,
      create: definition,
    });

    equipmentByCode.set(equipment.internalCode, equipment);
  }

  const orderDefinitions: DemoOrderDefinition[] = [
    {
      code: 'MTTO-MET-001',
      equipmentCode: 'EQ-MET-001',
      type: MaintenanceType.PREVENTIVE,
      status: MaintenanceStatus.PENDING,
      scheduledDate: addDays(7, 9),
      startedAt: null,
      completedAt: null,
      description: 'Mantenimiento preventivo y verificación de lectura.',
      diagnosis: null,
      actionsPerformed: null,
      recommendations: null,
      finalEquipmentStatus: null,
      assignedToId: metroTechnician.id,
      createdById: metroAdmin.id,
    },
    {
      code: 'MTTO-MET-002',
      equipmentCode: 'EQ-MET-003',
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
      assignedToId: metroTechnician.id,
      createdById: metroAdmin.id,
    },
    {
      code: 'MTTO-MET-003',
      equipmentCode: 'EQ-MET-002',
      type: MaintenanceType.PREVENTIVE,
      status: MaintenanceStatus.COMPLETED,
      scheduledDate: addDays(-18, 9),
      startedAt: addDays(-18, 9),
      completedAt: addDays(-18, 12),
      description: 'Mantenimiento preventivo anual del monitor.',
      diagnosis: 'Equipo funcional, sin desviaciones críticas.',
      actionsPerformed: 'Limpieza, pruebas de ECG, SpO2, PANI y alarmas.',
      recommendations: 'Mantener limpieza semanal de sensores y cables.',
      finalEquipmentStatus: EquipmentStatus.ACTIVE,
      assignedToId: metroTechnician.id,
      createdById: metroAdmin.id,
    },
    {
      code: 'MTTO-MET-004',
      equipmentCode: 'EQ-MET-005',
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
      assignedToId: metroTechnician.id,
      createdById: metroAdmin.id,
    },
    {
      code: 'MTTO-MET-005',
      equipmentCode: 'EQ-MET-004',
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
      assignedToId: metroTechnician.id,
      createdById: metroAdmin.id,
    },
    {
      code: 'MTTO-MET-006',
      equipmentCode: 'EQ-MET-007',
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
      assignedToId: metroTechnician.id,
      createdById: metroAdmin.id,
    },
    {
      code: 'MTTO-MET-007',
      equipmentCode: 'EQ-MET-006',
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
      assignedToId: metroTechnician.id,
      createdById: metroAdmin.id,
    },
    {
      code: 'MTTO-MET-008',
      equipmentCode: 'EQ-MET-010',
      type: MaintenanceType.PREVENTIVE,
      status: MaintenanceStatus.PENDING,
      scheduledDate: addDays(21, 9),
      startedAt: null,
      completedAt: null,
      description: 'Preventivo previo al vencimiento de garantía.',
      diagnosis: null,
      actionsPerformed: null,
      recommendations: null,
      finalEquipmentStatus: null,
      assignedToId: metroTechnician.id,
      createdById: metroAdmin.id,
    },
    {
      code: 'MTTO-RAF-001',
      equipmentCode: 'EQ-RAF-001',
      type: MaintenanceType.PREVENTIVE,
      status: MaintenanceStatus.PENDING,
      scheduledDate: addDays(10, 9),
      startedAt: null,
      completedAt: null,
      description: 'Mantenimiento preventivo del monitor de urgencias.',
      diagnosis: null,
      actionsPerformed: null,
      recommendations: null,
      finalEquipmentStatus: null,
      assignedToId: rafaelTechnician.id,
      createdById: rafaelAdmin.id,
    },
    {
      code: 'MTTO-RAF-002',
      equipmentCode: 'EQ-RAF-003',
      type: MaintenanceType.CORRECTIVE,
      status: MaintenanceStatus.PENDING,
      scheduledDate: addDays(-6, 8),
      startedAt: null,
      completedAt: null,
      description: 'Diagnóstico de pérdida de presión en ciclo rápido.',
      diagnosis: null,
      actionsPerformed: null,
      recommendations: null,
      finalEquipmentStatus: null,
      assignedToId: rafaelTechnician.id,
      createdById: rafaelAdmin.id,
    },
    {
      code: 'MTTO-RAF-003',
      equipmentCode: 'EQ-RAF-002',
      type: MaintenanceType.PREVENTIVE,
      status: MaintenanceStatus.COMPLETED,
      scheduledDate: addDays(-20, 9),
      startedAt: addDays(-20, 9),
      completedAt: addDays(-20, 13),
      description: 'Preventivo anual de bomba volumétrica.',
      diagnosis: 'Equipo dentro de tolerancias operativas.',
      actionsPerformed: 'Limpieza, verificación eléctrica y calibración.',
      recommendations: 'Repetir prueba de flujo en doce meses.',
      finalEquipmentStatus: EquipmentStatus.ACTIVE,
      assignedToId: rafaelTechnician.id,
      createdById: rafaelAdmin.id,
    },
    {
      code: 'MTTO-RAF-004',
      equipmentCode: 'EQ-RAF-004',
      type: MaintenanceType.CORRECTIVE,
      status: MaintenanceStatus.IN_PROGRESS,
      scheduledDate: addDays(-1, 10),
      startedAt: addDays(0, 8),
      completedAt: null,
      description: 'Corrección de interferencia en el trazado ECG.',
      diagnosis: 'Cable de paciente con falso contacto intermitente.',
      actionsPerformed: 'Inspección y limpieza de conectores.',
      recommendations: null,
      finalEquipmentStatus: null,
      assignedToId: rafaelTechnician.id,
      createdById: rafaelAdmin.id,
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
      },
      create: {
        ...orderData,
        equipmentId: equipment.id,
      },
    });

    ordersByCode.set(order.code, order);
  }

  const preventiveTasks = [
    'Limpieza externa',
    'Verificación eléctrica',
    'Prueba funcional',
    'Calibración',
    'Revisión de alarmas',
    'Registro de observaciones',
  ];
  const correctiveTasks = [
    'Diagnóstico inicial',
    'Identificación de falla',
    'Corrección técnica',
    'Prueba posterior',
    'Recomendaciones',
  ];
  const criticalVentilatorTasks = [
    'Verificación eléctrica',
    'Revisión de alarmas',
    'Prueba del módulo de flujo',
    'Validación de presión',
    'Registro de salida de servicio',
  ];
  const taskDefinitions = Object.fromEntries(
    orderDefinitions.map((order) => {
      const titles =
        order.code === 'MTTO-MET-004'
          ? criticalVentilatorTasks
          : order.type === MaintenanceType.PREVENTIVE
            ? preventiveTasks
            : correctiveTasks;
      const completedCount =
        order.status === MaintenanceStatus.COMPLETED
          ? titles.length
          : order.status === MaintenanceStatus.IN_PROGRESS
            ? 2
            : 0;

      return [
        order.code,
        titles.map((title, index) => ({
          title,
          isCompleted: index < completedCount,
        })),
      ];
    }),
  );

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

  const companyAdminById = new Map([
    [metroCompany.id, metroAdmin],
    [rafaelCompany.id, rafaelAdmin],
  ]);

  for (const definition of equipmentDefinitions) {
    const equipment = equipmentByCode.get(definition.internalCode);
    const companyAdmin = companyAdminById.get(definition.companyId);

    if (!equipment || !companyAdmin) continue;

    await upsertAuditLog({
      action: AUDIT_ACTIONS.EQUIPMENT_CREATED,
      entity: AUDIT_ENTITIES.EQUIPMENT,
      entityId: equipment.id,
      userId: companyAdmin.id,
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
      userId: definition.createdById,
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
        userId: definition.assignedToId,
        newValue: {
          seed: true,
          code: definition.code,
          status: definition.status,
        },
      });
    }
  }

  for (const code of ['MTTO-MET-003', 'MTTO-RAF-003']) {
    const completedOrder = ordersByCode.get(code);
    const definition = orderDefinitions.find((order) => order.code === code);

    if (!completedOrder || !definition) continue;

    await upsertAuditLog({
      action: AUDIT_ACTIONS.REPORT_PDF_EXPORTED,
      entity: AUDIT_ENTITIES.REPORT,
      entityId: `maintenance-order-${completedOrder.id}`,
      userId: definition.createdById,
      newValue: {
        seed: true,
        report: 'maintenance-order-pdf',
        orderId: completedOrder.id,
        code: completedOrder.code,
      },
    });
  }

  const companyIds = [metroCompany.id, rafaelCompany.id];
  const demoEmails = userDefinitions.map((user) => user.email);
  const demoEquipmentCodes = equipmentDefinitions.map(
    (equipment) => equipment.internalCode,
  );
  const demoOrderCodes = orderDefinitions.map((order) => order.code);
  const counts = {
    companies: await prisma.company.count({
      where: { id: { in: companyIds } },
    }),
    sites: await prisma.site.count({
      where: { companyId: { in: companyIds } },
    }),
    areas: await prisma.area.count({
      where: { site: { companyId: { in: companyIds } } },
    }),
    users: await prisma.user.count({
      where: { email: { in: demoEmails } },
    }),
    equipment: await prisma.equipment.count({
      where: { internalCode: { in: demoEquipmentCodes } },
    }),
    orders: await prisma.maintenanceOrder.count({
      where: { code: { in: demoOrderCodes } },
    }),
    tasks: await prisma.maintenanceTask.count({
      where: { orderId: { in: demoOrderIds } },
    }),
    auditLogs: await prisma.auditLog.count({
      where: {
        OR: [
          {
            entityId: { in: [...equipmentByCode.values()].map(({ id }) => id) },
          },
          { entityId: { in: demoOrderIds } },
          {
            entityId: {
              in: demoOrderIds.map((id) => `maintenance-order-${id}`),
            },
          },
        ],
      },
    }),
  };

  console.log('Seed completed successfully.');
  console.log('Demo dataset:', counts);
  console.log(
    'Demo accounts are documented in docs/59-demo-seed-accounts-and-test-plan.md.',
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

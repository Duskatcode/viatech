import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";
import {
  EquipmentStatus,
  MaintenanceType,
  PrismaClient,
  UserRole,
} from "../src/generated/prisma/client";

config({ path: "../../.env" });
config({ path: ".env" });

const adapter = new PrismaPg(
  {
    connectionString: process.env.DATABASE_URL!,
  },
  {
    schema: "public",
  },
);

const prisma = new PrismaClient({ adapter });

async function main() {
  const defaultPassword = "Admin12345!";
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  const company = await prisma.company.upsert({
    where: { nit: "900000000-1" },
    update: {
      name: "Clínica Demo Biomédica",
      phone: "3000000000",
      email: "admin@clinicademo.com",
      address: "Medellín, Colombia",
      isActive: true,
    },
    create: {
      name: "Clínica Demo Biomédica",
      nit: "900000000-1",
      phone: "3000000000",
      email: "admin@clinicademo.com",
      address: "Medellín, Colombia",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@biomed.local" },
    update: {
      name: "Admin Demo",
      passwordHash,
      role: UserRole.ADMIN,
      companyId: company.id,
      isActive: true,
    },
    create: {
      name: "Admin Demo",
      email: "admin@biomed.local",
      passwordHash,
      role: UserRole.ADMIN,
      companyId: company.id,
    },
  });

  let site = await prisma.site.findFirst({
    where: {
      companyId: company.id,
      name: "Sede Principal",
    },
  });

  if (!site) {
    site = await prisma.site.create({
      data: {
        name: "Sede Principal",
        city: "Medellín",
        address: "Dirección demo",
        companyId: company.id,
      },
    });
  }

  let area = await prisma.area.findFirst({
    where: {
      siteId: site.id,
      name: "Urgencias",
    },
  });

  if (!area) {
    area = await prisma.area.create({
      data: {
        name: "Urgencias",
        floor: "1",
        description: "Área demo de urgencias",
        siteId: site.id,
      },
    });
  }

  const equipment = await prisma.equipment.upsert({
    where: {
      companyId_internalCode: {
        companyId: company.id,
        internalCode: "EQ-DEMO-001",
      },
    },
    update: {
      name: "Pulsioxímetro Adulto",
      brand: "DemoBrand",
      model: "PX-100",
      serialNumber: "SN-DEMO-001",
      equipmentType: "Monitorización",
      riskLevel: "IIA",
      status: EquipmentStatus.ACTIVE,
      siteId: site.id,
      areaId: area.id,
    },
    create: {
      internalCode: "EQ-DEMO-001",
      name: "Pulsioxímetro Adulto",
      brand: "DemoBrand",
      model: "PX-100",
      serialNumber: "SN-DEMO-001",
      equipmentType: "Monitorización",
      riskLevel: "IIA",
      status: EquipmentStatus.ACTIVE,
      companyId: company.id,
      siteId: site.id,
      areaId: area.id,
    },
  });

  const order = await prisma.maintenanceOrder.upsert({
    where: {
      code: "MTTO-DEMO-001",
    },
    update: {
      type: MaintenanceType.PREVENTIVE,
      description: "Mantenimiento preventivo demo",
      equipmentId: equipment.id,
      createdById: admin.id,
    },
    create: {
      code: "MTTO-DEMO-001",
      type: MaintenanceType.PREVENTIVE,
      description: "Mantenimiento preventivo demo",
      equipmentId: equipment.id,
      createdById: admin.id,
    },
  });

  await prisma.maintenanceTask.deleteMany({
    where: {
      orderId: order.id,
    },
  });

  await prisma.maintenanceTask.createMany({
    data: [
      {
        orderId: order.id,
        title: "Verificar estado físico",
      },
      {
        orderId: order.id,
        title: "Probar lectura de SpO2",
      },
      {
        orderId: order.id,
        title: "Registrar observaciones",
      },
    ],
  });

  console.log("Seed completed successfully.");
  console.log("Demo admin:");
  console.log("Email: admin@biomed.local");
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

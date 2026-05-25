import { Injectable, NotFoundException } from '@nestjs/common';

import type { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../database/prisma.service';
import {
  EquipmentStatus,
  MaintenanceStatus,
  Prisma,
  UserRole,
} from '../generated/prisma/client';
import { QueryEquipmentReportDto } from './dto/query-equipment-report.dto';
import { QueryMaintenanceReportDto } from './dto/query-maintenance-report.dto';
import { formatDate, toCsv } from './reports-csv.util';
import { buildReportWorkbook } from './reports-excel.util';
import { buildMaintenanceOrderPdf } from './reports-pdf.util';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(user: AuthUser) {
    const equipmentWhere = this.buildEquipmentCompanyScope(user);
    const maintenanceWhere = this.buildMaintenanceCompanyScope(user);

    const [
      totalEquipment,
      activeEquipment,
      inMaintenanceEquipment,
      outOfServiceEquipment,
      retiredEquipment,
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      cancelledOrders,
    ] = await Promise.all([
      this.prisma.equipment.count({ where: equipmentWhere }),
      this.prisma.equipment.count({
        where: { ...equipmentWhere, status: EquipmentStatus.ACTIVE },
      }),
      this.prisma.equipment.count({
        where: { ...equipmentWhere, status: EquipmentStatus.IN_MAINTENANCE },
      }),
      this.prisma.equipment.count({
        where: { ...equipmentWhere, status: EquipmentStatus.OUT_OF_SERVICE },
      }),
      this.prisma.equipment.count({
        where: { ...equipmentWhere, status: EquipmentStatus.RETIRED },
      }),
      this.prisma.maintenanceOrder.count({ where: maintenanceWhere }),
      this.prisma.maintenanceOrder.count({
        where: { ...maintenanceWhere, status: MaintenanceStatus.PENDING },
      }),
      this.prisma.maintenanceOrder.count({
        where: { ...maintenanceWhere, status: MaintenanceStatus.IN_PROGRESS },
      }),
      this.prisma.maintenanceOrder.count({
        where: { ...maintenanceWhere, status: MaintenanceStatus.COMPLETED },
      }),
      this.prisma.maintenanceOrder.count({
        where: { ...maintenanceWhere, status: MaintenanceStatus.CANCELLED },
      }),
    ]);

    return {
      equipment: {
        total: totalEquipment,
        active: activeEquipment,
        inMaintenance: inMaintenanceEquipment,
        outOfService: outOfServiceEquipment,
        retired: retiredEquipment,
      },
      maintenanceOrders: {
        total: totalOrders,
        pending: pendingOrders,
        inProgress: inProgressOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  findEquipment(user: AuthUser, query: QueryEquipmentReportDto) {
    return this.prisma.equipment.findMany({
      where: {
        ...this.buildEquipmentCompanyScope(user, query.companyId),
        ...this.buildEquipmentFilters(query),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            nit: true,
          },
        },
        site: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        area: {
          select: {
            id: true,
            name: true,
            floor: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async equipmentCsv(user: AuthUser, query: QueryEquipmentReportDto) {
    const equipment = await this.findEquipment(user, query);

    return toCsv(
      [
        'ID',
        'Empresa',
        'NIT',
        'Codigo interno',
        'Nombre',
        'Marca',
        'Modelo',
        'Serial',
        'Tipo',
        'Riesgo',
        'Estado',
        'Sede',
        'Ciudad',
        'Area',
        'Piso',
        'Fecha compra',
        'Fecha instalacion',
        'Garantia hasta',
        'Notas',
        'Creado',
        'Actualizado',
      ],
      equipment.map((item) => [
        item.id,
        item.company?.name,
        item.company?.nit,
        item.internalCode,
        item.name,
        item.brand,
        item.model,
        item.serialNumber,
        item.equipmentType,
        item.riskLevel,
        item.status,
        item.site?.name,
        item.site?.city,
        item.area?.name,
        item.area?.floor,
        formatDate(item.purchaseDate),
        formatDate(item.installationDate),
        formatDate(item.warrantyUntil),
        item.notes,
        formatDate(item.createdAt),
        formatDate(item.updatedAt),
      ]),
    );
  }


  async equipmentXlsx(user: AuthUser, query: QueryEquipmentReportDto) {
    const equipment = await this.findEquipment(user, query);

    return buildReportWorkbook({
      sheetName: 'Equipos',
      title: 'Reporte de equipos biomédicos',
      subtitle: `Total de equipos: ${equipment.length} · Generado: ${new Date().toISOString()}`,
      columns: [
        { header: 'ID', key: 'id', width: 28 },
        { header: 'Empresa', key: 'company', width: 28 },
        { header: 'NIT', key: 'nit', width: 18 },
        { header: 'Código interno', key: 'internalCode', width: 20 },
        { header: 'Nombre', key: 'name', width: 32 },
        { header: 'Marca', key: 'brand', width: 18 },
        { header: 'Modelo', key: 'model', width: 18 },
        { header: 'Serial', key: 'serialNumber', width: 22 },
        { header: 'Tipo', key: 'equipmentType', width: 24 },
        { header: 'Riesgo', key: 'riskLevel', width: 14 },
        { header: 'Estado', key: 'status', width: 18 },
        { header: 'Sede', key: 'site', width: 24 },
        { header: 'Ciudad', key: 'city', width: 18 },
        { header: 'Área', key: 'area', width: 24 },
        { header: 'Piso', key: 'floor', width: 10 },
        { header: 'Compra', key: 'purchaseDate', width: 24 },
        { header: 'Instalación', key: 'installationDate', width: 24 },
        { header: 'Garantía', key: 'warrantyUntil', width: 24 },
        { header: 'Notas', key: 'notes', width: 36 },
        { header: 'Creado', key: 'createdAt', width: 24 },
        { header: 'Actualizado', key: 'updatedAt', width: 24 },
      ],
      rows: equipment.map((item) => ({
        id: item.id,
        company: item.company?.name,
        nit: item.company?.nit,
        internalCode: item.internalCode,
        name: item.name,
        brand: item.brand,
        model: item.model,
        serialNumber: item.serialNumber,
        equipmentType: item.equipmentType,
        riskLevel: item.riskLevel,
        status: item.status,
        site: item.site?.name,
        city: item.site?.city,
        area: item.area?.name,
        floor: item.area?.floor,
        purchaseDate: formatDate(item.purchaseDate),
        installationDate: formatDate(item.installationDate),
        warrantyUntil: formatDate(item.warrantyUntil),
        notes: item.notes,
        createdAt: formatDate(item.createdAt),
        updatedAt: formatDate(item.updatedAt),
      })),
    });
  }

  findMaintenanceOrders(user: AuthUser, query: QueryMaintenanceReportDto) {
    return this.prisma.maintenanceOrder.findMany({
      where: {
        ...this.buildMaintenanceCompanyScope(user, query.companyId),
        ...this.buildMaintenanceFilters(query),
      },
      include: {
        equipment: {
          select: {
            id: true,
            internalCode: true,
            name: true,
            status: true,
            companyId: true,
            company: {
              select: {
                id: true,
                name: true,
                nit: true,
              },
            },
            site: {
              select: {
                id: true,
                name: true,
              },
            },
            area: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        tasks: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async maintenanceOrdersCsv(user: AuthUser, query: QueryMaintenanceReportDto) {
    const orders = await this.findMaintenanceOrders(user, query);

    return toCsv(
      [
        'ID',
        'Codigo orden',
        'Empresa',
        'NIT',
        'Codigo equipo',
        'Equipo',
        'Sede',
        'Area',
        'Tipo',
        'Estado',
        'Tecnico',
        'Tecnico email',
        'Creado por',
        'Fecha programada',
        'Inicio',
        'Finalizacion',
        'Diagnostico',
        'Acciones realizadas',
        'Recomendaciones',
        'Estado final equipo',
        'Tareas totales',
        'Tareas completadas',
        'Creado',
        'Actualizado',
      ],
      orders.map((order) => {
        const totalTasks = order.tasks.length;
        const completedTasks = order.tasks.filter((task) => task.isCompleted).length;

        return [
          order.id,
          order.code,
          order.equipment?.company?.name,
          order.equipment?.company?.nit,
          order.equipment?.internalCode,
          order.equipment?.name,
          order.equipment?.site?.name,
          order.equipment?.area?.name,
          order.type,
          order.status,
          order.assignedTo?.name,
          order.assignedTo?.email,
          order.createdBy?.name,
          formatDate(order.scheduledDate),
          formatDate(order.startedAt),
          formatDate(order.completedAt),
          order.diagnosis,
          order.actionsPerformed,
          order.recommendations,
          order.finalEquipmentStatus,
          totalTasks,
          completedTasks,
          formatDate(order.createdAt),
          formatDate(order.updatedAt),
        ];
      }),
    );
  }


  async maintenanceOrdersXlsx(user: AuthUser, query: QueryMaintenanceReportDto) {
    const orders = await this.findMaintenanceOrders(user, query);

    return buildReportWorkbook({
      sheetName: 'Mantenimientos',
      title: 'Reporte de órdenes de mantenimiento',
      subtitle: `Total de órdenes: ${orders.length} · Generado: ${new Date().toISOString()}`,
      columns: [
        { header: 'ID', key: 'id', width: 28 },
        { header: 'Código orden', key: 'code', width: 26 },
        { header: 'Empresa', key: 'company', width: 28 },
        { header: 'NIT', key: 'nit', width: 18 },
        { header: 'Código equipo', key: 'equipmentCode', width: 20 },
        { header: 'Equipo', key: 'equipmentName', width: 32 },
        { header: 'Sede', key: 'site', width: 24 },
        { header: 'Área', key: 'area', width: 24 },
        { header: 'Tipo', key: 'type', width: 16 },
        { header: 'Estado', key: 'status', width: 18 },
        { header: 'Técnico', key: 'assignedTo', width: 24 },
        { header: 'Email técnico', key: 'assignedToEmail', width: 28 },
        { header: 'Creado por', key: 'createdBy', width: 24 },
        { header: 'Programada', key: 'scheduledDate', width: 24 },
        { header: 'Inicio', key: 'startedAt', width: 24 },
        { header: 'Finalización', key: 'completedAt', width: 24 },
        { header: 'Diagnóstico', key: 'diagnosis', width: 36 },
        { header: 'Acciones', key: 'actionsPerformed', width: 42 },
        { header: 'Recomendaciones', key: 'recommendations', width: 42 },
        { header: 'Estado final equipo', key: 'finalEquipmentStatus', width: 20 },
        { header: 'Tareas totales', key: 'totalTasks', width: 16 },
        { header: 'Tareas completadas', key: 'completedTasks', width: 20 },
        { header: 'Creado', key: 'createdAt', width: 24 },
        { header: 'Actualizado', key: 'updatedAt', width: 24 },
      ],
      rows: orders.map((order) => {
        const totalTasks = order.tasks.length;
        const completedTasks = order.tasks.filter((task) => task.isCompleted).length;

        return {
          id: order.id,
          code: order.code,
          company: order.equipment?.company?.name,
          nit: order.equipment?.company?.nit,
          equipmentCode: order.equipment?.internalCode,
          equipmentName: order.equipment?.name,
          site: order.equipment?.site?.name,
          area: order.equipment?.area?.name,
          type: order.type,
          status: order.status,
          assignedTo: order.assignedTo?.name,
          assignedToEmail: order.assignedTo?.email,
          createdBy: order.createdBy?.name,
          scheduledDate: formatDate(order.scheduledDate),
          startedAt: formatDate(order.startedAt),
          completedAt: formatDate(order.completedAt),
          diagnosis: order.diagnosis,
          actionsPerformed: order.actionsPerformed,
          recommendations: order.recommendations,
          finalEquipmentStatus: order.finalEquipmentStatus,
          totalTasks,
          completedTasks,
          createdAt: formatDate(order.createdAt),
          updatedAt: formatDate(order.updatedAt),
        };
      }),
    });
  }


  async maintenanceOrderPdf(user: AuthUser, orderId: string) {
    const order = await this.prisma.maintenanceOrder.findFirst({
      where: {
        id: orderId,
        ...this.buildMaintenanceCompanyScope(user),
      },
      include: {
        equipment: {
          include: {
            company: {
              select: {
                name: true,
                nit: true,
              },
            },
            site: {
              select: {
                name: true,
                city: true,
              },
            },
            area: {
              select: {
                name: true,
                floor: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
        tasks: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Maintenance order not found');
    }

    return buildMaintenanceOrderPdf({ order });
  }

  private buildEquipmentCompanyScope(
    user: AuthUser,
    requestedCompanyId?: string,
  ): Prisma.EquipmentWhereInput {
    if (user.role === UserRole.SUPER_ADMIN) {
      return requestedCompanyId ? { companyId: requestedCompanyId } : {};
    }

    return {
      companyId: user.companyId ?? '',
    };
  }

  private buildMaintenanceCompanyScope(
    user: AuthUser,
    requestedCompanyId?: string,
  ): Prisma.MaintenanceOrderWhereInput {
    if (user.role === UserRole.SUPER_ADMIN) {
      return requestedCompanyId
        ? {
            equipment: {
              companyId: requestedCompanyId,
            },
          }
        : {};
    }

    return {
      equipment: {
        companyId: user.companyId ?? '',
      },
    };
  }

  private buildEquipmentFilters(
    query: QueryEquipmentReportDto,
  ): Prisma.EquipmentWhereInput {
    const where: Prisma.EquipmentWhereInput = {};

    if (query.siteId) {
      where.siteId = query.siteId;
    }

    if (query.areaId) {
      where.areaId = query.areaId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.createdFrom || query.createdTo) {
      where.createdAt = {
        gte: query.createdFrom ? new Date(`${query.createdFrom}T00:00:00`) : undefined,
        lte: query.createdTo ? new Date(`${query.createdTo}T23:59:59`) : undefined,
      };
    }

    if (query.search) {
      where.OR = [
        {
          internalCode: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          brand: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          model: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          serialNumber: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  private buildMaintenanceFilters(
    query: QueryMaintenanceReportDto,
  ): Prisma.MaintenanceOrderWhereInput {
    const where: Prisma.MaintenanceOrderWhereInput = {};

    if (query.equipmentId) {
      where.equipmentId = query.equipmentId;
    }

    if (query.assignedToId) {
      where.assignedToId = query.assignedToId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.createdFrom || query.createdTo) {
      where.createdAt = {
        gte: query.createdFrom ? new Date(`${query.createdFrom}T00:00:00`) : undefined,
        lte: query.createdTo ? new Date(`${query.createdTo}T23:59:59`) : undefined,
      };
    }

    if (query.search) {
      where.OR = [
        {
          code: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          equipment: {
            internalCode: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
        {
          equipment: {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
        {
          assignedTo: {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    return where;
  }
}

import { Injectable } from '@nestjs/common';

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

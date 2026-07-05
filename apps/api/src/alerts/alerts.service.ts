import { Injectable } from '@nestjs/common';

import type { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../database/prisma.service';
import {
  EquipmentStatus,
  MaintenanceStatus,
  Prisma,
} from '../generated/prisma/client';
import { UserRole } from '@biomed/shared';
import { QueryAlertsSummaryDto } from './dto/query-alerts-summary.dto';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(user: AuthUser, query: QueryAlertsSummaryDto) {
    const days = query.days ?? 30;

    const now = new Date();
    const until = new Date(now);
    until.setDate(until.getDate() + days);

    const equipmentScope = this.buildEquipmentScope(user);
    const maintenanceScope = this.buildMaintenanceScope(user);

    const [
      overdueOrders,
      upcomingOrders,
      inMaintenanceEquipment,
      outOfServiceEquipment,
      warrantyExpiringEquipment,
    ] = await Promise.all([
      this.prisma.maintenanceOrder.findMany({
        where: {
          ...maintenanceScope,
          scheduledDate: {
            lt: now,
          },
          status: {
            in: [MaintenanceStatus.PENDING, MaintenanceStatus.IN_PROGRESS],
          },
        },
        include: this.maintenanceInclude(),
        orderBy: {
          scheduledDate: 'asc',
        },
        take: 20,
      }),

      this.prisma.maintenanceOrder.findMany({
        where: {
          ...maintenanceScope,
          scheduledDate: {
            gte: now,
            lte: until,
          },
          status: MaintenanceStatus.PENDING,
        },
        include: this.maintenanceInclude(),
        orderBy: {
          scheduledDate: 'asc',
        },
        take: 20,
      }),

      this.prisma.equipment.findMany({
        where: {
          ...equipmentScope,
          status: EquipmentStatus.IN_MAINTENANCE,
        },
        include: this.equipmentInclude(),
        orderBy: {
          updatedAt: 'desc',
        },
        take: 20,
      }),

      this.prisma.equipment.findMany({
        where: {
          ...equipmentScope,
          status: EquipmentStatus.OUT_OF_SERVICE,
        },
        include: this.equipmentInclude(),
        orderBy: {
          updatedAt: 'desc',
        },
        take: 20,
      }),

      this.prisma.equipment.findMany({
        where: {
          ...equipmentScope,
          status: {
            not: EquipmentStatus.RETIRED,
          },
          warrantyUntil: {
            gte: now,
            lte: until,
          },
        },
        include: this.equipmentInclude(),
        orderBy: {
          warrantyUntil: 'asc',
        },
        take: 20,
      }),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      windowDays: days,
      counts: {
        overdueOrders: overdueOrders.length,
        upcomingOrders: upcomingOrders.length,
        inMaintenanceEquipment: inMaintenanceEquipment.length,
        outOfServiceEquipment: outOfServiceEquipment.length,
        warrantyExpiringEquipment: warrantyExpiringEquipment.length,
        total:
          overdueOrders.length +
          upcomingOrders.length +
          inMaintenanceEquipment.length +
          outOfServiceEquipment.length +
          warrantyExpiringEquipment.length,
      },
      overdueOrders,
      upcomingOrders,
      inMaintenanceEquipment,
      outOfServiceEquipment,
      warrantyExpiringEquipment,
    };
  }

  private buildEquipmentScope(user: AuthUser): Prisma.EquipmentWhereInput {
    if (user.role === UserRole.SUPER_ADMIN) {
      return {};
    }

    return {
      companyId: user.companyId ?? '',
    };
  }

  private buildMaintenanceScope(user: AuthUser): Prisma.MaintenanceOrderWhereInput {
    if (user.role === UserRole.SUPER_ADMIN) {
      return {};
    }

    return {
      equipment: {
        companyId: user.companyId ?? '',
      },
    };
  }

  private equipmentInclude() {
    return {
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
    };
  }

  private maintenanceInclude() {
    return {
      equipment: {
        select: {
          id: true,
          internalCode: true,
          name: true,
          status: true,
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
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    };
  }
}

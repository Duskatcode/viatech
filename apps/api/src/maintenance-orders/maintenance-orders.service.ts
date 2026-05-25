import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AUDIT_ACTIONS, AUDIT_ENTITIES } from '../audit-logs/audit-log.constants';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import type { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../database/prisma.service';
import {
  EquipmentStatus,
  MaintenanceStatus,
  Prisma,
  UserRole,
} from '../generated/prisma/client';
import { AssignMaintenanceOrderDto } from './dto/assign-maintenance-order.dto';
import { CancelMaintenanceOrderDto } from './dto/cancel-maintenance-order.dto';
import { CompleteMaintenanceOrderDto } from './dto/complete-maintenance-order.dto';
import { CreateMaintenanceOrderDto } from './dto/create-maintenance-order.dto';
import { CreateMaintenanceTaskDto } from './dto/create-maintenance-task.dto';
import { QueryMaintenanceOrdersDto } from './dto/query-maintenance-orders.dto';
import { UpdateMaintenanceOrderDto } from './dto/update-maintenance-order.dto';
import { UpdateMaintenanceTaskDto } from './dto/update-maintenance-task.dto';

@Injectable()
export class MaintenanceOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(user: AuthUser, dto: CreateMaintenanceOrderDto) {
    const equipment = await this.findEquipmentForAccess(user, dto.equipmentId);

    if (dto.assignedToId) {
      await this.assertAssignableUser(dto.assignedToId, equipment.companyId);
    }

    try {
      return await this.prisma.maintenanceOrder.create({
        data: {
          code: this.generateOrderCode(),
          type: dto.type,
          status: MaintenanceStatus.PENDING,
          scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
          description: dto.description,
          equipmentId: equipment.id,
          assignedToId: dto.assignedToId,
          createdById: user.id,
          tasks: dto.tasks?.length
            ? {
                create: dto.tasks.map((task) => ({
                  title: task.title,
                  description: task.description,
                })),
              }
            : undefined,
        },
        include: this.defaultInclude(),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll(user: AuthUser, query: QueryMaintenanceOrdersDto) {
    const where: Prisma.MaintenanceOrderWhereInput = {
      equipment: {
        companyId:
          user.role === UserRole.SUPER_ADMIN ? undefined : user.companyId ?? '',
      },
    };

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

    if (query.search) {
      where.OR = [
        {
          code: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return this.prisma.maintenanceOrder.findMany({
      where,
      include: this.defaultInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(user: AuthUser, id: string) {
    const order = await this.prisma.maintenanceOrder.findFirst({
      where: {
        id,
      },
      include: this.defaultInclude(),
    });

    if (!order) {
      throw new NotFoundException('Maintenance order not found');
    }

    this.assertCompanyAccess(user, order.equipment.companyId);

    return order;
  }

  async update(user: AuthUser, id: string, dto: UpdateMaintenanceOrderDto) {
    const order = await this.findOne(user, id);

    this.assertEditable(order.status);

    let equipmentId = order.equipmentId;
    let equipmentCompanyId = order.equipment.companyId;

    if (dto.equipmentId) {
      const equipment = await this.findEquipmentForAccess(user, dto.equipmentId);
      equipmentId = equipment.id;
      equipmentCompanyId = equipment.companyId;
    }

    if (dto.assignedToId) {
      await this.assertAssignableUser(dto.assignedToId, equipmentCompanyId);
    }

    return this.prisma.maintenanceOrder.update({
      where: {
        id,
      },
      data: {
        equipmentId,
        type: dto.type,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        description: dto.description,
        assignedToId: dto.assignedToId,
      },
      include: this.defaultInclude(),
    });
  }

  async assign(user: AuthUser, id: string, dto: AssignMaintenanceOrderDto) {
    const order = await this.findOne(user, id);

    this.assertEditable(order.status);

    await this.assertAssignableUser(dto.assignedToId, order.equipment.companyId);

    return this.prisma.maintenanceOrder.update({
      where: {
        id,
      },
      data: {
        assignedToId: dto.assignedToId,
      },
      include: this.defaultInclude(),
    });
  }

  async start(user: AuthUser, id: string) {
    const order = await this.findOne(user, id);

    if (order.status !== MaintenanceStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be started');
    }

    this.assertTechnicianCanWorkOnOrder(user, order.assignedToId);

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.maintenanceOrder.update({
        where: {
          id: order.id,
        },
        data: {
          status: MaintenanceStatus.IN_PROGRESS,
          startedAt: new Date(),
          assignedToId:
            order.assignedToId ??
            (user.role === UserRole.TECHNICIAN ? user.id : order.assignedToId),
        },
        include: this.defaultInclude(),
      });

      await tx.equipment.update({
        where: {
          id: order.equipmentId,
        },
        data: {
          status: EquipmentStatus.IN_MAINTENANCE,
        },
      });

      return updatedOrder;
    });
  }

  async complete(user: AuthUser, id: string, dto: CompleteMaintenanceOrderDto) {
    const order = await this.findOne(user, id);

    if (order.status !== MaintenanceStatus.IN_PROGRESS) {
      throw new BadRequestException('Only in-progress orders can be completed');
    }

    this.assertTechnicianCanWorkOnOrder(user, order.assignedToId);

    const finalEquipmentStatus = dto.finalEquipmentStatus ?? EquipmentStatus.ACTIVE;

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.maintenanceOrder.update({
        where: {
          id: order.id,
        },
        data: {
          status: MaintenanceStatus.COMPLETED,
          completedAt: new Date(),
          diagnosis: dto.diagnosis,
          actionsPerformed: dto.actionsPerformed,
          recommendations: dto.recommendations,
          finalEquipmentStatus,
        },
        include: this.defaultInclude(),
      });

      await tx.equipment.update({
        where: {
          id: order.equipmentId,
        },
        data: {
          status: finalEquipmentStatus,
        },
      });

      return updatedOrder;
    });
  }

  async cancel(user: AuthUser, id: string, dto: CancelMaintenanceOrderDto) {
    const order = await this.findOne(user, id);

    if (
      order.status === MaintenanceStatus.COMPLETED ||
      order.status === MaintenanceStatus.CANCELLED
    ) {
      throw new BadRequestException('Completed or cancelled orders cannot be cancelled');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.maintenanceOrder.update({
        where: {
          id: order.id,
        },
        data: {
          status: MaintenanceStatus.CANCELLED,
          recommendations: dto.reason
            ? `Cancellation reason: ${dto.reason}`
            : order.recommendations,
        },
        include: this.defaultInclude(),
      });

      if (order.status === MaintenanceStatus.IN_PROGRESS) {
        await tx.equipment.update({
          where: {
            id: order.equipmentId,
          },
          data: {
            status: EquipmentStatus.ACTIVE,
          },
        });
      }

      return updatedOrder;
    });
  }

  async addTask(user: AuthUser, orderId: string, dto: CreateMaintenanceTaskDto) {
    const order = await this.findOne(user, orderId);

    this.assertEditable(order.status);

    return this.prisma.maintenanceTask.create({
      data: {
        orderId: order.id,
        title: dto.title,
        description: dto.description,
      },
    });
  }

  async updateTask(
    user: AuthUser,
    orderId: string,
    taskId: string,
    dto: UpdateMaintenanceTaskDto,
  ) {
    const order = await this.findOne(user, orderId);

    this.assertEditable(order.status);

    const task = await this.prisma.maintenanceTask.findFirst({
      where: {
        id: taskId,
        orderId: order.id,
      },
    });

    if (!task) {
      throw new NotFoundException('Maintenance task not found');
    }

    return this.prisma.maintenanceTask.update({
      where: {
        id: task.id,
      },
      data: {
        title: dto.title,
        description: dto.description,
        isCompleted: dto.isCompleted,
        completedAt:
          dto.isCompleted === true
            ? new Date()
            : dto.isCompleted === false
              ? null
              : undefined,
      },
    });
  }

  private async findEquipmentForAccess(user: AuthUser, equipmentId: string) {
    const equipment = await this.prisma.equipment.findFirst({
      where: {
        id: equipmentId,
        status: {
          not: EquipmentStatus.RETIRED,
        },
      },
      select: {
        id: true,
        companyId: true,
      },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    this.assertCompanyAccess(user, equipment.companyId);

    return equipment;
  }

  private async assertAssignableUser(userId: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        isActive: true,
        companyId,
        role: {
          in: [UserRole.ADMIN, UserRole.TECHNICIAN],
        },
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Assigned user must be active and belong to the equipment company');
    }
  }

  private assertCompanyAccess(user: AuthUser, companyId: string) {
    if (user.role === UserRole.SUPER_ADMIN) {
      return;
    }

    if (!user.companyId || user.companyId !== companyId) {
      throw new ForbiddenException('You do not have access to this maintenance order');
    }
  }

  private assertEditable(status: MaintenanceStatus) {
    if (
      status === MaintenanceStatus.COMPLETED ||
      status === MaintenanceStatus.CANCELLED
    ) {
      throw new BadRequestException('Completed or cancelled orders cannot be edited');
    }
  }

  private assertTechnicianCanWorkOnOrder(
    user: AuthUser,
    assignedToId: string | null,
  ) {
    if (user.role !== UserRole.TECHNICIAN) {
      return;
    }

    if (assignedToId && assignedToId !== user.id) {
      throw new ForbiddenException('Technician can only work on assigned orders');
    }
  }

  private generateOrderCode() {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 14);

    const random = Math.random().toString(36).slice(2, 6).toUpperCase();

    return `MTTO-${timestamp}-${random}`;
  }

  private defaultInclude() {
    return {
      equipment: {
        select: {
          id: true,
          internalCode: true,
          name: true,
          status: true,
          companyId: true,
          siteId: true,
          areaId: true,
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
          createdAt: 'asc' as const,
        },
      },
      attachments: {
        orderBy: {
          createdAt: 'desc' as const,
        },
      },
    };
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Maintenance order code already exists');
    }

    throw error;
  }
}

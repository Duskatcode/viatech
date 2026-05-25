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
  Prisma,
  UserRole,
} from '../generated/prisma/client';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { QueryEquipmentDto } from './dto/query-equipment.dto';
import { UpdateEquipmentStatusDto } from './dto/update-equipment-status.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(user: AuthUser, dto: CreateEquipmentDto) {
    const companyId = this.resolveCompanyId(user, dto.companyId);

    await this.assertLocationBelongsToCompany({
      companyId,
      siteId: dto.siteId,
      areaId: dto.areaId,
    });

    try {
      return await this.prisma.equipment.create({
        data: {
          companyId,
          siteId: dto.siteId,
          areaId: dto.areaId,
          internalCode: dto.internalCode,
          name: dto.name,
          brand: dto.brand,
          model: dto.model,
          serialNumber: dto.serialNumber,
          equipmentType: dto.equipmentType,
          riskLevel: dto.riskLevel,
          status: dto.status ?? EquipmentStatus.ACTIVE,
          purchaseDate: dto.purchaseDate,
          installationDate: dto.installationDate,
          warrantyUntil: dto.warrantyUntil,
          notes: dto.notes,
        },
        include: this.defaultInclude(),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll(user: AuthUser, query: QueryEquipmentDto) {
    const where: Prisma.EquipmentWhereInput = {
      ...this.buildCompanyScope(user, query.companyId),
      ...this.buildFilters(query),
    };

    if (!query.status) {
      where.status = {
        not: EquipmentStatus.RETIRED,
      };
    }

    return this.prisma.equipment.findMany({
      where,
      include: this.defaultInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(user: AuthUser, id: string) {
    const equipment = await this.prisma.equipment.findFirst({
      where: {
        id,
        status: {
          not: EquipmentStatus.RETIRED,
        },
      },
      include: this.defaultInclude(),
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    this.assertCompanyAccess(user, equipment.companyId);

    return equipment;
  }

  async profile(user: AuthUser, id: string) {
    const equipment = await this.prisma.equipment.findFirst({
      where: {
        id,
        status: {
          not: EquipmentStatus.RETIRED,
        },
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
            address: true,
          },
        },
        area: {
          select: {
            id: true,
            name: true,
            floor: true,
            description: true,
          },
        },
        maintenanceOrders: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            tasks: true,
            attachments: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        attachments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    this.assertCompanyAccess(user, equipment.companyId);

    return equipment;
  }

  async update(user: AuthUser, id: string, dto: UpdateEquipmentDto) {
    const currentEquipment = await this.findOne(user, id);

    const companyId = this.resolveCompanyId(user, dto.companyId ?? currentEquipment.companyId);
    const siteId = dto.siteId ?? currentEquipment.siteId;
    const areaId = dto.areaId ?? currentEquipment.areaId;

    await this.assertLocationBelongsToCompany({
      companyId,
      siteId,
      areaId,
    });

    try {
      return await this.prisma.equipment.update({
        where: { id },
        data: {
          companyId,
          siteId,
          areaId,
          internalCode: dto.internalCode,
          name: dto.name,
          brand: dto.brand,
          model: dto.model,
          serialNumber: dto.serialNumber,
          equipmentType: dto.equipmentType,
          riskLevel: dto.riskLevel,
          status: dto.status,
          purchaseDate: dto.purchaseDate,
          installationDate: dto.installationDate,
          warrantyUntil: dto.warrantyUntil,
          notes: dto.notes,
        },
        include: this.defaultInclude(),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async updateStatus(user: AuthUser, id: string, dto: UpdateEquipmentStatusDto) {
    const equipment = await this.findOne(user, id);

    if (
      user.role !== UserRole.SUPER_ADMIN &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.TECHNICIAN
    ) {
      throw new ForbiddenException('You cannot update equipment status');
    }

    return this.prisma.equipment.update({
      where: {
        id: equipment.id,
      },
      data: {
        status: dto.status,
        notes: dto.notes ?? equipment.notes,
      },
      include: this.defaultInclude(),
    });
  }

  async remove(user: AuthUser, id: string) {
    const equipment = await this.findOne(user, id);

    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot retire equipment');
    }

    return this.prisma.equipment.update({
      where: {
        id: equipment.id,
      },
      data: {
        status: EquipmentStatus.RETIRED,
      },
      include: this.defaultInclude(),
    });
  }

  private resolveCompanyId(user: AuthUser, requestedCompanyId?: string): string {
    if (user.role === UserRole.SUPER_ADMIN) {
      if (!requestedCompanyId) {
        throw new BadRequestException('companyId is required for SUPER_ADMIN');
      }

      return requestedCompanyId;
    }

    if (!user.companyId) {
      throw new ForbiddenException('User has no company assigned');
    }

    return user.companyId;
  }

  private buildCompanyScope(
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

  private buildFilters(query: QueryEquipmentDto): Prisma.EquipmentWhereInput {
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

  private async assertLocationBelongsToCompany(params: {
    companyId: string;
    siteId: string;
    areaId: string;
  }) {
    const site = await this.prisma.site.findFirst({
      where: {
        id: params.siteId,
        companyId: params.companyId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!site) {
      throw new NotFoundException('Site not found for selected company');
    }

    const area = await this.prisma.area.findFirst({
      where: {
        id: params.areaId,
        siteId: params.siteId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!area) {
      throw new NotFoundException('Area not found for selected site');
    }
  }

  private assertCompanyAccess(user: AuthUser, companyId: string) {
    if (user.role === UserRole.SUPER_ADMIN) {
      return;
    }

    if (!user.companyId || user.companyId !== companyId) {
      throw new ForbiddenException('You do not have access to this equipment');
    }
  }

  private defaultInclude() {
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

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Equipment internal code already exists for this company');
    }

    throw error;
  }
}

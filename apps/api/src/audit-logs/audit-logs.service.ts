import { Injectable } from '@nestjs/common';

import type { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { UserRole } from '@vitatech/shared';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

interface CreateAuditLogInput {
  userId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
}

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAuditLogInput) {
    const data: Prisma.AuditLogUncheckedCreateInput = {
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      userId: input.userId ?? null,
    };

    const oldValue = this.toJson(input.oldValue);
    const newValue = this.toJson(input.newValue);

    if (oldValue !== undefined) {
      data.oldValue = oldValue;
    }

    if (newValue !== undefined) {
      data.newValue = newValue;
    }

    return this.prisma.auditLog.create({
      data,
    });
  }

  async safeCreate(input: CreateAuditLogInput) {
    try {
      return await this.create(input);
    } catch {
      return null;
    }
  }

  findAll(user: AuthUser, query: QueryAuditLogsDto) {
    const where: Prisma.AuditLogWhereInput = {
      ...this.buildScope(user),
      ...this.buildFilters(query),
    };

    return this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            companyId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });
  }

  private buildScope(user: AuthUser): Prisma.AuditLogWhereInput {
    if (user.role === UserRole.SUPER_ADMIN) {
      return {};
    }

    return {
      user: {
        companyId: user.companyId ?? '',
      },
    };
  }

  private buildFilters(query: QueryAuditLogsDto): Prisma.AuditLogWhereInput {
    const where: Prisma.AuditLogWhereInput = {};

    if (query.action) {
      where.action = {
        contains: query.action,
        mode: 'insensitive',
      };
    }

    if (query.entity) {
      where.entity = {
        contains: query.entity,
        mode: 'insensitive',
      };
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.from || query.to) {
      where.createdAt = {
        gte: query.from ? new Date(`${query.from}T00:00:00`) : undefined,
        lte: query.to ? new Date(`${query.to}T23:59:59`) : undefined,
      };
    }

    return where;
  }

  private toJson(value: unknown): Prisma.InputJsonValue | undefined {
    if (value === undefined) {
      return undefined;
    }

    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}

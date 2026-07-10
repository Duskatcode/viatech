import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@vitatech/shared';

import type { AuthUser } from '../auth/types/auth-user.type';
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITIES,
} from '../audit-logs/audit-log.constants';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../database/prisma.service';
import { UserRole as PrismaUserRole } from '../generated/prisma/client';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { QueryMembershipsDto } from './dto/query-memberships.dto';

/**
 * Roles que pueden ser vinculados a una empresa/sede via CompanyMembership.
 * ADMIN y SUPER_ADMIN se manejan por otro camino (users.service.ts), porque
 * su relacion con una empresa tiene una semantica distinta (administran una
 * empresa, no estan "asignados" a ella).
 */
const ASSIGNABLE_ROLES: PrismaUserRole[] = [
  PrismaUserRole.TECHNICIAN,
  PrismaUserRole.VIEWER,
];

@Injectable()
export class CompanyMembershipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * Pool global de usuarios asignables (TECHNICIAN/VIEWER), sin filtrar por
   * empresa: es intencional, para que un Admin pueda encontrar y vincular a
   * un tecnico que ya existe en el sistema (de cualquier empresa) en vez de
   * crear un duplicado.
   */
  async searchAssignableUsers(currentUser: AuthUser, search?: string) {
    this.assertCanManageMemberships(currentUser);

    const query = search?.trim();

    return this.prisma.user.findMany({
      where: {
        role: { in: ASSIGNABLE_ROLES },
        isActive: true,
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  async findAll(currentUser: AuthUser, query: QueryMembershipsDto) {
    const companyId = this.resolveCompanyIdForRead(
      currentUser,
      query.companyId,
    );

    return this.prisma.companyMembership.findMany({
      where: { companyId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        site: { select: { id: true, name: true } },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async create(currentUser: AuthUser, dto: CreateMembershipDto) {
    this.assertCanManageMemberships(currentUser);
    this.assertCompanyIsManageable(currentUser, dto.companyId);

    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!targetUser || !targetUser.isActive) {
      throw new NotFoundException('User not found');
    }

    if (!ASSIGNABLE_ROLES.includes(targetUser.role)) {
      throw new ForbiddenException(
        'Only TECHNICIAN or VIEWER users can be linked via memberships',
      );
    }

    if (dto.siteId) {
      const site = await this.prisma.site.findUnique({
        where: { id: dto.siteId },
      });

      if (!site || site.companyId !== dto.companyId) {
        throw new NotFoundException('Site not found for this company');
      }
    }

    const existing = await this.prisma.companyMembership.findFirst({
      where: {
        userId: dto.userId,
        companyId: dto.companyId,
        siteId: dto.siteId ?? null,
        status: 'ACTIVE',
      },
    });

    if (existing) {
      throw new ConflictException(
        'This user already has an active membership for this company/site',
      );
    }

    const membership = await this.prisma.companyMembership.create({
      data: {
        userId: dto.userId,
        companyId: dto.companyId,
        siteId: dto.siteId,
        assignedById: currentUser.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        site: { select: { id: true, name: true } },
      },
    });

    await this.auditLogsService.create({
      userId: currentUser.id,
      action: AUDIT_ACTIONS.MEMBERSHIP_CREATED,
      entity: AUDIT_ENTITIES.COMPANY_MEMBERSHIP,
      entityId: membership.id,
      newValue: {
        userId: dto.userId,
        companyId: dto.companyId,
        siteId: dto.siteId ?? null,
      },
    });

    return membership;
  }

  async revoke(currentUser: AuthUser, membershipId: string) {
    this.assertCanManageMemberships(currentUser);

    const membership = await this.prisma.companyMembership.findUnique({
      where: { id: membershipId },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    this.assertCompanyIsManageable(currentUser, membership.companyId);

    if (membership.status === 'INACTIVE') {
      return membership;
    }

    const updated = await this.prisma.companyMembership.update({
      where: { id: membershipId },
      data: { status: 'INACTIVE', revokedAt: new Date() },
    });

    await this.auditLogsService.create({
      userId: currentUser.id,
      action: AUDIT_ACTIONS.MEMBERSHIP_REVOKED,
      entity: AUDIT_ENTITIES.COMPANY_MEMBERSHIP,
      entityId: membership.id,
      oldValue: { status: membership.status },
      newValue: { status: 'INACTIVE' },
    });

    return updated;
  }

  private assertCanManageMemberships(currentUser: AuthUser) {
    if (
      currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  /**
   * ADMIN solo puede gestionar membresias de su propia empresa. SUPER_ADMIN
   * puede gestionar cualquiera (necesita pasar companyId explicitamente).
   */
  private assertCompanyIsManageable(currentUser: AuthUser, companyId: string) {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return;
    }

    if (currentUser.companyId !== companyId) {
      throw new ForbiddenException(
        'You can only manage memberships for your own company',
      );
    }
  }

  private resolveCompanyIdForRead(
    currentUser: AuthUser,
    requestedCompanyId?: string,
  ): string {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      if (!requestedCompanyId) {
        throw new ForbiddenException('companyId query param is required');
      }

      return requestedCompanyId;
    }

    if (currentUser.role !== UserRole.ADMIN || !currentUser.companyId) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return currentUser.companyId;
  }
}

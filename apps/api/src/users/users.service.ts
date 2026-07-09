import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import type { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../database/prisma.service';
import { Prisma, UserRole as PrismaUserRole } from '../generated/prisma/client';
import { UserRole } from '@vitatech/shared';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';

function toPrismaRole(role: UserRole): PrismaUserRole {
  return role as unknown as PrismaUserRole;
}

/**
 * Inverse of toPrismaRole(): converts a raw Prisma role value (e.g. read
 * via findManageableUser's `select: { role: true }`) into @vitatech/shared's
 * UserRole, so it can be mixed safely with DTO-provided role values.
 */
function toSharedRole(role: PrismaUserRole): UserRole {
  return role as unknown as UserRole;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Empresas a las que este usuario tiene una CompanyMembership ACTIVE.
   * Usado para poblar AuthUser.companyIds en login/refresh (y de forma
   * independiente en JwtAuthGuard, que consulta Prisma directamente por
   * cada request para que una revocacion sea efectiva de inmediato).
   */
  async getActiveCompanyIds(userId: string): Promise<string[]> {
    const memberships = await this.prisma.companyMembership.findMany({
      where: { userId, status: 'ACTIVE' },
      select: { companyId: true },
    });

    return [
      ...new Set(memberships.map((membership: { companyId: string }) => membership.companyId)),
    ];
  }

  findByEmailForAuth(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        refreshTokenHash: true,
        role: true,
        companyId: true,
        isActive: true,
      },
    });
  }

  findByIdForAuth(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        refreshTokenHash: true,
        role: true,
        companyId: true,
        isActive: true,
      },
    });
  }

  async findProfileById(id: string, currentUser?: AuthUser) {
    if (
      currentUser &&
      currentUser.role !== UserRole.SUPER_ADMIN &&
      (currentUser.role !== UserRole.ADMIN || !currentUser.companyId)
    ) {
      throw new NotFoundException('User not found');
    }

    const where =
      currentUser?.role === UserRole.ADMIN
        ? { id, companyId: currentUser.companyId as string }
        : { id };

    const user = await this.prisma.user.findFirst({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  listUsers(
    currentUserRole: UserRole,
    currentUserCompanyId: string | null,
    requestedCompanyId?: string,
  ) {
    if (
      currentUserRole !== UserRole.SUPER_ADMIN &&
      currentUserRole !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    if (currentUserRole !== UserRole.SUPER_ADMIN && !currentUserCompanyId) {
      throw new ForbiddenException('User has no company assigned');
    }

    const where =
      currentUserRole === UserRole.SUPER_ADMIN
        ? requestedCompanyId
          ? { companyId: requestedCompanyId }
          : {}
        : {
            companyId: currentUserCompanyId as string,
          };

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(currentUser: AuthUser, dto: CreateUserDto) {
    this.assertCanManageUsers(currentUser);
    this.assertRoleCanBeAssigned(currentUser, dto.role);

    const companyId = await this.resolveCompanyIdForWrite(
      currentUser,
      dto.companyId,
      dto.role,
    );
    const passwordHash = await bcrypt.hash(dto.password, 12);

    try {
      return await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email.toLowerCase(),
          passwordHash,
          role: toPrismaRole(dto.role),
          companyId,
          isActive: true,
        },
        select: this.publicSelect(),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(currentUser: AuthUser, id: string, dto: UpdateUserDto) {
    const target = await this.findManageableUser(currentUser, id);
    const role = dto.role ?? toSharedRole(target.role);

    if (dto.role) {
      this.assertRoleCanBeAssigned(currentUser, dto.role);
    }

    const companyId = await this.resolveCompanyIdForUpdate(
      currentUser,
      target.companyId,
      dto.companyId,
      role,
    );
    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 12)
      : undefined;

    try {
      return await this.prisma.user.update({
        where: { id: target.id },
        data: {
          name: dto.name,
          email: dto.email?.toLowerCase(),
          passwordHash,
          role: toPrismaRole(role),
          companyId,
          isActive: dto.isActive,
          refreshTokenHash: dto.isActive === false ? null : undefined,
        },
        select: this.publicSelect(),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async updateRole(currentUser: AuthUser, id: string, dto: UpdateUserRoleDto) {
    const target = await this.findManageableUser(currentUser, id);
    this.assertRoleCanBeAssigned(currentUser, dto.role);

    if (dto.role !== UserRole.SUPER_ADMIN && !target.companyId) {
      throw new BadRequestException(
        'companyId is required for non-SUPER_ADMIN users',
      );
    }

    return this.prisma.user.update({
      where: { id: target.id },
      data: {
        role: toPrismaRole(dto.role),
      },
      select: this.publicSelect(),
    });
  }

  async updateStatus(
    currentUser: AuthUser,
    id: string,
    dto: UpdateUserStatusDto,
  ) {
    const target = await this.findManageableUser(currentUser, id);

    return this.prisma.user.update({
      where: { id: target.id },
      data: {
        isActive: dto.isActive,
        refreshTokenHash: dto.isActive ? undefined : null,
      },
      select: this.publicSelect(),
    });
  }

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  private async findManageableUser(currentUser: AuthUser, id: string) {
    this.assertCanManageUsers(currentUser);

    const target = await this.prisma.user.findFirst({
      where:
        currentUser.role === UserRole.SUPER_ADMIN
          ? { id }
          : {
              id,
              companyId: currentUser.companyId ?? '',
              role: {
                in: [PrismaUserRole.TECHNICIAN, PrismaUserRole.VIEWER],
              },
            },
      select: {
        id: true,
        role: true,
        companyId: true,
      },
    });

    if (!target) {
      throw new NotFoundException('User not found');
    }

    return target;
  }

  private assertCanManageUsers(currentUser: AuthUser) {
    if (
      currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You cannot manage users');
    }

    if (currentUser.role === UserRole.ADMIN && !currentUser.companyId) {
      throw new ForbiddenException('User has no company assigned');
    }
  }

  private assertRoleCanBeAssigned(currentUser: AuthUser, role: UserRole) {
    if (role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'SUPER_ADMIN cannot be created or assigned through this API',
      );
    }

    if (
      currentUser.role === UserRole.ADMIN &&
      role !== UserRole.TECHNICIAN &&
      role !== UserRole.VIEWER
    ) {
      throw new ForbiddenException(
        'ADMIN can only manage TECHNICIAN and VIEWER users',
      );
    }
  }

  private async resolveCompanyIdForWrite(
    currentUser: AuthUser,
    requestedCompanyId: string | undefined,
    role: UserRole,
  ) {
    const companyId =
      currentUser.role === UserRole.SUPER_ADMIN
        ? requestedCompanyId
        : currentUser.companyId;

    if (role !== UserRole.SUPER_ADMIN && !companyId) {
      throw new BadRequestException(
        'companyId is required for non-SUPER_ADMIN users',
      );
    }

    if (
      currentUser.role === UserRole.ADMIN &&
      requestedCompanyId &&
      requestedCompanyId !== currentUser.companyId
    ) {
      throw new ForbiddenException(
        'ADMIN cannot assign users to another company',
      );
    }

    await this.assertCompanyExists(companyId as string);

    return companyId as string;
  }

  private async resolveCompanyIdForUpdate(
    currentUser: AuthUser,
    currentCompanyId: string | null,
    requestedCompanyId: string | undefined,
    role: UserRole,
  ) {
    if (currentUser.role === UserRole.ADMIN) {
      if (requestedCompanyId && requestedCompanyId !== currentUser.companyId) {
        throw new ForbiddenException(
          'ADMIN cannot assign users to another company',
        );
      }

      return currentUser.companyId as string;
    }

    const companyId = requestedCompanyId ?? currentCompanyId;

    if (role !== UserRole.SUPER_ADMIN && !companyId) {
      throw new BadRequestException(
        'companyId is required for non-SUPER_ADMIN users',
      );
    }

    if (companyId) {
      await this.assertCompanyExists(companyId);
    }

    return companyId;
  }

  private async assertCompanyExists(companyId: string) {
    const company = await this.prisma.company.findFirst({
      where: {
        id: companyId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }
  }

  private publicSelect() {
    return {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    } as const;
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('User email already exists');
    }

    throw error;
  }
}

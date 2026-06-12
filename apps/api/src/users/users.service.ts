import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

  listUsers(currentUserRole: UserRole, currentUserCompanyId: string | null) {
    if (currentUserRole !== UserRole.SUPER_ADMIN && !currentUserCompanyId) {
      throw new ForbiddenException('User has no company assigned');
    }

    const where =
      currentUserRole === UserRole.SUPER_ADMIN
        ? {}
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

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }
}

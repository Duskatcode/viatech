import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { AuthUser } from '../auth/types/auth-user.type';
import {
  buildUserCompanyFilter,
  userHasCompanyAccess,
} from '../common/utils/company-scope.util';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@vitatech/shared';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateSiteDto) {
    const companyId = this.resolveCompanyId(user, dto.companyId);

    await this.assertCompanyExists(companyId);

    return this.prisma.site.create({
      data: {
        companyId,
        name: dto.name,
        city: dto.city,
        address: dto.address,
      },
    });
  }

  findAll(user: AuthUser) {
    return this.prisma.site.findMany({
      where:
        user.role === UserRole.SUPER_ADMIN
          ? { isActive: true }
          : {
              companyId: buildUserCompanyFilter(user),
              isActive: true,
            },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            nit: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(user: AuthUser, id: string) {
    const site = await this.prisma.site.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            nit: true,
          },
        },
      },
    });

    if (!site) {
      throw new NotFoundException('Site not found');
    }

    this.assertCompanyAccess(user, site.companyId);

    return site;
  }

  async update(user: AuthUser, id: string, dto: UpdateSiteDto) {
    const site = await this.findOne(user, id);

    let companyId = site.companyId;

    if (dto.companyId) {
      companyId = this.resolveCompanyId(user, dto.companyId);
      await this.assertCompanyExists(companyId);
    }

    return this.prisma.site.update({
      where: { id },
      data: {
        companyId,
        name: dto.name,
        city: dto.city,
        address: dto.address,
      },
    });
  }

  async remove(user: AuthUser, id: string) {
    await this.findOne(user, id);

    return this.prisma.site.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  private resolveCompanyId(
    user: AuthUser,
    requestedCompanyId?: string,
  ): string {
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

  private assertCompanyAccess(user: AuthUser, companyId: string) {
    if (!userHasCompanyAccess(user, companyId)) {
      throw new ForbiddenException('You do not have access to this site');
    }
  }
}

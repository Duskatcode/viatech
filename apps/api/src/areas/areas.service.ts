import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@vitatech/shared';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateAreaDto) {
    const site = await this.findSiteForAccess(user, dto.siteId);

    return this.prisma.area.create({
      data: {
        siteId: site.id,
        name: dto.name,
        floor: dto.floor,
        description: dto.description,
      },
    });
  }

  findAll(user: AuthUser) {
    return this.prisma.area.findMany({
      where:
        user.role === UserRole.SUPER_ADMIN
          ? { isActive: true }
          : {
              site: {
                companyId: user.companyId ?? '',
              },
              isActive: true,
            },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            companyId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(user: AuthUser, id: string) {
    const area = await this.prisma.area.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            companyId: true,
          },
        },
      },
    });

    if (!area) {
      throw new NotFoundException('Area not found');
    }

    this.assertCompanyAccess(user, area.site.companyId);

    return area;
  }

  async update(user: AuthUser, id: string, dto: UpdateAreaDto) {
    const area = await this.findOne(user, id);

    let siteId = area.siteId;

    if (dto.siteId) {
      const site = await this.findSiteForAccess(user, dto.siteId);
      siteId = site.id;
    }

    return this.prisma.area.update({
      where: { id },
      data: {
        siteId,
        name: dto.name,
        floor: dto.floor,
        description: dto.description,
      },
    });
  }

  async remove(user: AuthUser, id: string) {
    await this.findOne(user, id);

    return this.prisma.area.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  private async findSiteForAccess(user: AuthUser, siteId: string) {
    const site = await this.prisma.site.findFirst({
      where: {
        id: siteId,
        isActive: true,
      },
      select: {
        id: true,
        companyId: true,
      },
    });

    if (!site) {
      throw new NotFoundException('Site not found');
    }

    this.assertCompanyAccess(user, site.companyId);

    return site;
  }

  private assertCompanyAccess(user: AuthUser, companyId: string) {
    if (user.role === UserRole.SUPER_ADMIN) {
      return;
    }

    if (!user.companyId || user.companyId !== companyId) {
      throw new ForbiddenException('You do not have access to this area');
    }
  }
}

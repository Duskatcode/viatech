import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { UserRole } from '@biomed/shared';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    try {
      return await this.prisma.company.create({
        data: dto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll(user: AuthUser) {
    return this.prisma.company.findMany({
      where:
        user.role === UserRole.SUPER_ADMIN
          ? { isActive: true }
          : {
              id: user.companyId ?? '',
              isActive: true,
            },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(user: AuthUser, id: string) {
    const company = await this.prisma.company.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    this.assertCompanyAccess(user, company.id);

    return company;
  }

  async update(user: AuthUser, id: string, dto: UpdateCompanyDto) {
    await this.findOne(user, id);

    try {
      return await this.prisma.company.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    const company = await this.prisma.company.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.company.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  private assertCompanyAccess(user: AuthUser, companyId: string) {
    if (user.role === UserRole.SUPER_ADMIN) {
      return;
    }

    if (!user.companyId || user.companyId !== companyId) {
      throw new ForbiddenException('You do not have access to this company');
    }
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Company unique field already exists');
    }

    throw error;
  }
}

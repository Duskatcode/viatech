jest.mock('../generated/prisma/client', () => ({
  PrismaClient: class PrismaClient {},
  UserRole: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    TECHNICIAN: 'TECHNICIAN',
    VIEWER: 'VIEWER',
  },
}));

import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

import type { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../database/prisma.service';
import { CompanyMembershipsService } from './company-memberships.service';

describe('CompanyMembershipsService RBAC', () => {
  const companyAId = 'company-a';
  const companyBId = 'company-b';

  const currentUser = (
    role: AuthUser['role'],
    companyId: string | null,
  ): AuthUser => ({
    id: `${role.toLowerCase()}-user`,
    name: `${role} Demo`,
    email: `${role.toLowerCase()}@vitatech.local`,
    role,
    companyId,
    companyIds: [],
  });

  const technician = {
    id: 'tech-1',
    name: 'Demo Technician',
    email: 'tech@vitatech.local',
    role: 'TECHNICIAN',
    companyId: null,
    isActive: true,
  };

  const admin = {
    id: 'admin-1',
    name: 'Demo Admin',
    email: 'admin@vitatech.local',
    role: 'ADMIN',
    companyId: companyAId,
    isActive: true,
  };

  const createService = () => {
    const prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      site: {
        findUnique: jest.fn(),
      },
      companyMembership: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    const auditLogsService = {
      create: jest.fn().mockResolvedValue(undefined),
    };
    const service = new CompanyMembershipsService(
      prisma as unknown as PrismaService,
      auditLogsService as never,
    );

    return { prisma, service, auditLogsService };
  };

  it('prevents TECHNICIAN and VIEWER from managing memberships', async () => {
    const { service } = createService();

    await expect(
      service.create(currentUser('TECHNICIAN' as never, companyAId), {
        userId: 'tech-2',
        companyId: companyAId,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    await expect(
      service.searchAssignableUsers(currentUser('VIEWER' as never, companyAId)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('prevents ADMIN from creating a membership for another company', async () => {
    const { service } = createService();

    await expect(
      service.create(currentUser('ADMIN' as never, companyAId), {
        userId: 'tech-1',
        companyId: companyBId,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects linking a user whose role is not TECHNICIAN/VIEWER', async () => {
    const { prisma, service } = createService();
    prisma.user.findUnique.mockResolvedValue(admin);

    await expect(
      service.create(currentUser('ADMIN' as never, companyAId), {
        userId: admin.id,
        companyId: companyAId,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects a site that does not belong to the target company', async () => {
    const { prisma, service } = createService();
    prisma.user.findUnique.mockResolvedValue(technician);
    prisma.site.findUnique.mockResolvedValue({ id: 'site-1', companyId: companyBId });

    await expect(
      service.create(currentUser('ADMIN' as never, companyAId), {
        userId: technician.id,
        companyId: companyAId,
        siteId: 'site-1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a duplicate active membership for the same user/company/site', async () => {
    const { prisma, service } = createService();
    prisma.user.findUnique.mockResolvedValue(technician);
    prisma.companyMembership.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create(currentUser('ADMIN' as never, companyAId), {
        userId: technician.id,
        companyId: companyAId,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('allows ADMIN to create a membership for a TECHNICIAN in their own company', async () => {
    const { prisma, service, auditLogsService } = createService();
    prisma.user.findUnique.mockResolvedValue(technician);
    prisma.companyMembership.findFirst.mockResolvedValue(null);
    prisma.companyMembership.create.mockResolvedValue({
      id: 'membership-1',
      userId: technician.id,
      companyId: companyAId,
      siteId: null,
      status: 'ACTIVE',
    });

    const result = await service.create(
      currentUser('ADMIN' as never, companyAId),
      { userId: technician.id, companyId: companyAId },
    );

    expect(result.id).toBe('membership-1');
    expect(prisma.companyMembership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: technician.id,
          companyId: companyAId,
          assignedById: `admin-user`,
        }),
      }),
    );
    expect(auditLogsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'MEMBERSHIP_CREATED' }),
    );
  });

  it('allows SUPER_ADMIN to create a membership for any company', async () => {
    const { prisma, service } = createService();
    prisma.user.findUnique.mockResolvedValue(technician);
    prisma.companyMembership.findFirst.mockResolvedValue(null);
    prisma.companyMembership.create.mockResolvedValue({
      id: 'membership-2',
      userId: technician.id,
      companyId: companyBId,
      siteId: null,
      status: 'ACTIVE',
    });

    await expect(
      service.create(currentUser('SUPER_ADMIN' as never, null), {
        userId: technician.id,
        companyId: companyBId,
      }),
    ).resolves.toMatchObject({ id: 'membership-2' });
  });

  it('prevents ADMIN from revoking a membership of another company', async () => {
    const { prisma, service } = createService();
    prisma.companyMembership.findUnique.mockResolvedValue({
      id: 'membership-3',
      companyId: companyBId,
      status: 'ACTIVE',
    });

    await expect(
      service.revoke(currentUser('ADMIN' as never, companyAId), 'membership-3'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('requires companyId in the query for SUPER_ADMIN listings', async () => {
    const { service } = createService();

    await expect(
      service.findAll(currentUser('SUPER_ADMIN' as never, null), {}),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('scopes ADMIN membership listings to their own company regardless of query', async () => {
    const { prisma, service } = createService();
    prisma.companyMembership.findMany.mockResolvedValue([]);

    await service.findAll(currentUser('ADMIN' as never, companyAId), {
      companyId: companyBId,
    });

    expect(prisma.companyMembership.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: companyAId } }),
    );
  });
});

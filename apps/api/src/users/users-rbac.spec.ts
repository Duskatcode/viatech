jest.mock('../generated/prisma/client', () => {
  class PrismaClientKnownRequestError extends Error {
    code: string;

    constructor(message: string, options: { code: string }) {
      super(message);
      this.code = options.code;
    }
  }

  return {
    PrismaClient: class PrismaClient {},
    Prisma: { PrismaClientKnownRequestError },
    UserRole: {
      SUPER_ADMIN: 'SUPER_ADMIN',
      ADMIN: 'ADMIN',
      TECHNICIAN: 'TECHNICIAN',
      VIEWER: 'VIEWER',
    },
  };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

import { ConflictException, ForbiddenException } from '@nestjs/common';

import { Prisma, UserRole } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { AuthUser } from '../auth/types/auth-user.type';
import { UsersService } from './users.service';

describe('UsersService RBAC', () => {
  const companyAId = 'company-a';
  const companyBId = 'company-b';

  const currentUser = (role: UserRole, companyId: string | null): AuthUser => ({
    id: `${role.toLowerCase()}-user`,
    name: `${role} Demo`,
    email: `${role.toLowerCase()}@biomed.local`,
    role,
    companyId,
  });

  const publicUser = {
    id: 'user-1',
    email: 'user@biomed.local',
    name: 'Demo User',
    role: UserRole.TECHNICIAN,
    companyId: companyAId,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createService = () => {
    const prisma = {
      company: {
        findFirst: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    const service = new UsersService(prisma as unknown as PrismaService);

    return { prisma, service };
  };

  it('allows SUPER_ADMIN to list all users', async () => {
    const { prisma, service } = createService();
    prisma.user.findMany.mockResolvedValue([publicUser]);

    await expect(
      service.listUsers(UserRole.SUPER_ADMIN, null),
    ).resolves.toEqual([publicUser]);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it('limits ADMIN user listings to their company', async () => {
    const { prisma, service } = createService();
    prisma.user.findMany.mockResolvedValue([publicUser]);

    await service.listUsers(UserRole.ADMIN, companyAId, companyBId);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: companyAId } }),
    );
  });

  it('prevents ADMIN from creating ADMIN users', async () => {
    const { service } = createService();

    await expect(
      service.create(currentUser(UserRole.ADMIN, companyAId), {
        name: 'Company Admin',
        email: 'admin2@biomed.local',
        password: 'Admin12345!',
        role: UserRole.ADMIN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows ADMIN to create TECHNICIAN users in their company', async () => {
    const { prisma, service } = createService();
    prisma.company.findFirst.mockResolvedValue({ id: companyAId });
    prisma.user.create.mockResolvedValue(publicUser);

    await expect(
      service.create(currentUser(UserRole.ADMIN, companyAId), {
        name: 'Demo Technician',
        email: 'tech@biomed.local',
        password: 'Tech12345!',
        role: UserRole.TECHNICIAN,
      }),
    ).resolves.toEqual(publicUser);

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          companyId: companyAId,
          passwordHash: 'hashed-password',
          role: UserRole.TECHNICIAN,
        }),
      }),
    );
  });

  it('allows ADMIN to create VIEWER users in their company', async () => {
    const { prisma, service } = createService();
    const viewer = { ...publicUser, role: UserRole.VIEWER };
    prisma.company.findFirst.mockResolvedValue({ id: companyAId });
    prisma.user.create.mockResolvedValue(viewer);

    await expect(
      service.create(currentUser(UserRole.ADMIN, companyAId), {
        name: 'Demo Viewer',
        email: 'viewer@biomed.local',
        password: 'Viewer12345!',
        role: UserRole.VIEWER,
      }),
    ).resolves.toEqual(viewer);
  });

  it('prevents ADMIN from assigning another company', async () => {
    const { service } = createService();

    await expect(
      service.create(currentUser(UserRole.ADMIN, companyAId), {
        name: 'External Technician',
        email: 'external@biomed.local',
        password: 'Tech12345!',
        role: UserRole.TECHNICIAN,
        companyId: companyBId,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('prevents TECHNICIAN from creating users', async () => {
    const { service } = createService();

    await expect(
      service.create(currentUser(UserRole.TECHNICIAN, companyAId), {
        name: 'Demo Viewer',
        email: 'viewer@biomed.local',
        password: 'Viewer12345!',
        role: UserRole.VIEWER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('prevents VIEWER from creating users', async () => {
    const { service } = createService();

    await expect(
      service.create(currentUser(UserRole.VIEWER, companyAId), {
        name: 'Demo Technician',
        email: 'tech@biomed.local',
        password: 'Tech12345!',
        role: UserRole.TECHNICIAN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('never selects password hashes for management responses', async () => {
    const { prisma, service } = createService();
    prisma.company.findFirst.mockResolvedValue({ id: companyAId });
    prisma.user.create.mockResolvedValue(publicUser);

    const result = await service.create(
      currentUser(UserRole.ADMIN, companyAId),
      {
        name: 'Demo Technician',
        email: 'tech@biomed.local',
        password: 'Tech12345!',
        role: UserRole.TECHNICIAN,
      },
    );

    const createArguments = prisma.user.create.mock.calls[0][0];
    expect(createArguments.select.passwordHash).toBeUndefined();
    expect(createArguments.select.refreshTokenHash).toBeUndefined();
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('refreshTokenHash');
  });

  it('returns conflict when the email already exists', async () => {
    const { prisma, service } = createService();
    prisma.company.findFirst.mockResolvedValue({ id: companyAId });
    prisma.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Duplicate email', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.create(currentUser(UserRole.ADMIN, companyAId), {
        name: 'Duplicate Technician',
        email: 'duplicate@biomed.local',
        password: 'Tech12345!',
        role: UserRole.TECHNICIAN,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/unbound-method, @typescript-eslint/no-floating-promises */
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

jest.mock('./generated/prisma/client', () => ({
  PrismaClient: class PrismaClient {},
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {},
  },
  UserRole: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    TECHNICIAN: 'TECHNICIAN',
    VIEWER: 'VIEWER',
  },
  EquipmentStatus: {
    ACTIVE: 'ACTIVE',
    IN_MAINTENANCE: 'IN_MAINTENANCE',
    OUT_OF_SERVICE: 'OUT_OF_SERVICE',
    RETIRED: 'RETIRED',
  },
  MaintenanceStatus: {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },
  MaintenanceType: {
    PREVENTIVE: 'PREVENTIVE',
    CORRECTIVE: 'CORRECTIVE',
  },
  AttachmentType: {
    PHOTO: 'PHOTO',
    PDF: 'PDF',
    DOCUMENT: 'DOCUMENT',
    SIGNATURE: 'SIGNATURE',
    OTHER: 'OTHER',
  },
}));

import { AttachmentsController } from './attachments/attachments.controller';
import { AttachmentsService } from './attachments/attachments.service';
import { AuditLogsController } from './audit-logs/audit-logs.controller';
import { AuditLogsService } from './audit-logs/audit-logs.service';
import type { AuthUser } from './auth/types/auth-user.type';
import { ROLES_KEY } from './common/decorators/roles.decorator';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { CompaniesController } from './companies/companies.controller';
import { PrismaService } from './database/prisma.service';
import { EquipmentController } from './equipment/equipment.controller';
import { EquipmentService } from './equipment/equipment.service';
import { MaintenanceStatus, UserRole } from './generated/prisma/client';
import { MaintenanceOrdersController } from './maintenance-orders/maintenance-orders.controller';
import { MaintenanceOrdersService } from './maintenance-orders/maintenance-orders.service';
import { ReportsService } from './reports/reports.service';
import { UsersService } from './users/users.service';

function authUser(
  role: UserRole,
  companyId: string | null,
  id = 'user-a',
  companyIds: string[] = companyId ? [companyId] : [],
): AuthUser {
  return {
    id,
    name: 'Test User',
    email: 'test@example.com',
    role,
    companyId,
    companyIds,
  };
}

describe('RBAC and tenant isolation', () => {
  it('refreshes role and company from the database instead of trusting JWT claims', async () => {
    const request: {
      headers: { authorization: string };
      user?: AuthUser;
    } = {
      headers: {
        authorization: 'Bearer access-token',
      },
    };
    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 'user-a',
        email: 'old@example.com',
        role: UserRole.SUPER_ADMIN,
        companyId: null,
      }),
    };
    const configService = {
      get: jest.fn().mockReturnValue('access-secret'),
    };
    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'user-a',
          name: 'Current Admin',
          email: 'admin-a@example.com',
          role: UserRole.ADMIN,
          companyId: 'company-a',
        }),
      },
      companyMembership: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    const guard = new JwtAuthGuard(
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
      prisma as unknown as PrismaService,
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toMatchObject({
      role: UserRole.ADMIN,
      companyId: 'company-a',
      email: 'admin-a@example.com',
    });
  });

  it('rejects valid tokens for inactive or missing users', async () => {
    const guard = new JwtAuthGuard(
      {
        verifyAsync: jest.fn().mockResolvedValue({
          sub: 'inactive-user',
        }),
      } as unknown as JwtService,
      {
        get: jest.fn().mockReturnValue('access-secret'),
      } as unknown as ConfigService,
      {
        user: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
      } as unknown as PrismaService,
    );
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer access-token',
          },
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('does not allow an ADMIN without companyId to list all users', () => {
    const service = new UsersService({
      user: {
        findMany: jest.fn(),
      },
    } as unknown as PrismaService);

    expect(() => service.listUsers(UserRole.ADMIN, null)).toThrow(
      ForbiddenException,
    );
  });

  it('scopes ADMIN user lists to their own company', () => {
    const findMany = jest.fn();
    const service = new UsersService({
      user: {
        findMany,
      },
    } as unknown as PrismaService);

    service.listUsers(UserRole.ADMIN, 'company-a');

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          companyId: 'company-a',
        },
      }),
    );
  });

  it('rejects direct equipment access across companies', async () => {
    const service = new EquipmentService(
      {
        equipment: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'equipment-b',
            companyId: 'company-b',
          }),
        },
      } as unknown as PrismaService,
      {} as never,
    );

    await expect(
      service.findOne(authUser(UserRole.ADMIN, 'company-a'), 'equipment-b'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a technician linked to two companies (via CompanyMembership) to access equipment from either one', async () => {
    const technicianWithTwoCompanies = authUser(
      UserRole.TECHNICIAN,
      null,
      'technician-multi',
      ['company-a', 'company-b'],
    );

    const serviceForCompanyA = new EquipmentService(
      {
        equipment: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'equipment-a',
            companyId: 'company-a',
          }),
        },
      } as unknown as PrismaService,
      {} as never,
    );

    const serviceForCompanyB = new EquipmentService(
      {
        equipment: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'equipment-b',
            companyId: 'company-b',
          }),
        },
      } as unknown as PrismaService,
      {} as never,
    );

    await expect(
      serviceForCompanyA.findOne(technicianWithTwoCompanies, 'equipment-a'),
    ).resolves.toMatchObject({ id: 'equipment-a' });

    await expect(
      serviceForCompanyB.findOne(technicianWithTwoCompanies, 'equipment-b'),
    ).resolves.toMatchObject({ id: 'equipment-b' });
  });

  it('rejects a technician from a company they are not linked to, even with other active memberships', async () => {
    const technicianWithOneCompany = authUser(
      UserRole.TECHNICIAN,
      null,
      'technician-multi',
      ['company-a'],
    );

    const service = new EquipmentService(
      {
        equipment: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'equipment-c',
            companyId: 'company-c',
          }),
        },
      } as unknown as PrismaService,
      {} as never,
    );

    await expect(
      service.findOne(technicianWithOneCompany, 'equipment-c'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('scopes a technician equipment listing to the union of all their linked companies', () => {
    const findMany = jest.fn();
    const service = new EquipmentService(
      { equipment: { findMany } } as unknown as PrismaService,
      {} as never,
    );

    const technicianWithTwoCompanies = authUser(
      UserRole.TECHNICIAN,
      null,
      'technician-multi',
      ['company-a', 'company-b'],
    );

    service.findAll(technicianWithTwoCompanies, {});

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          companyId: { in: ['company-a', 'company-b'] },
        }),
      }),
    );
  });

  it('rejects direct order access assigned to another technician', async () => {
    const service = new MaintenanceOrdersService(
      {
        maintenanceOrder: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'order-a',
            assignedToId: 'technician-b',
            status: MaintenanceStatus.IN_PROGRESS,
            equipment: {
              companyId: 'company-a',
            },
          }),
        },
      } as unknown as PrismaService,
      {} as never,
    );

    await expect(
      service.findOne(
        authUser(UserRole.TECHNICIAN, 'company-a', 'technician-a'),
        'order-a',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('limits technician order lists to assigned or unassigned pending orders', () => {
    const findMany = jest.fn();
    const service = new MaintenanceOrdersService(
      {
        maintenanceOrder: {
          findMany,
        },
      } as unknown as PrismaService,
      {} as never,
    );

    service.findAll(
      authUser(UserRole.TECHNICIAN, 'company-a', 'technician-a'),
      {},
    );

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          equipment: {
            companyId: { in: ['company-a'] },
          },
          OR: [
            {
              assignedToId: 'technician-a',
            },
            {
              assignedToId: null,
              status: MaintenanceStatus.PENDING,
            },
          ],
        }),
      }),
    );
  });

  it('rejects direct attachment access across companies', async () => {
    const service = new AttachmentsService(
      {
        attachment: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'attachment-b',
            url: 'storage/attachments/file.pdf',
            equipment: {
              companyId: 'company-b',
            },
            order: null,
          }),
        },
      } as unknown as PrismaService,
      {} as never,
      {
        get: jest.fn(),
      } as unknown as ConfigService,
    );

    await expect(
      service.getDownloadStream(
        authUser(UserRole.ADMIN, 'company-a'),
        'attachment-b',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects technician uploads to orders assigned to another technician', async () => {
    const service = new AttachmentsService(
      {
        maintenanceOrder: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'order-a',
            assignedToId: 'technician-b',
            status: MaintenanceStatus.IN_PROGRESS,
            equipment: {
              companyId: 'company-a',
            },
          }),
        },
      } as unknown as PrismaService,
      {} as never,
      {
        get: jest.fn(),
      } as unknown as ConfigService,
    );

    await expect(
      service.uploadForMaintenanceOrder('order-a', {
        user: authUser(UserRole.TECHNICIAN, 'company-a', 'technician-a'),
        file: {} as Express.Multer.File,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('ignores another companyId requested by an ADMIN in reports', () => {
    const findMany = jest.fn();
    const service = new ReportsService(
      {
        equipment: {
          findMany,
        },
      } as unknown as PrismaService,
      {} as never,
    );

    service.findEquipment(authUser(UserRole.ADMIN, 'company-a'), {
      companyId: 'company-b',
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          companyId: 'company-a',
        }),
      }),
    );
  });

  it('keeps audit queries scoped to the current company', () => {
    const findMany = jest.fn();
    const service = new AuditLogsService({
      auditLog: {
        findMany,
      },
    } as unknown as PrismaService);

    service.findAll(authUser(UserRole.VIEWER, 'company-a'), {
      userId: 'user-b',
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          user: {
            companyId: { in: ['company-a'] },
          },
          userId: 'user-b',
        }),
      }),
    );
  });

  it('exposes only the intended roles on sensitive endpoints', () => {
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        MaintenanceOrdersController.prototype.create,
      ),
    ).toEqual([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        EquipmentController.prototype.updateStatus,
      ),
    ).toEqual([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
    expect(
      Reflect.getMetadata(ROLES_KEY, CompaniesController.prototype.update),
    ).toEqual([UserRole.SUPER_ADMIN]);
    expect(
      Reflect.getMetadata(ROLES_KEY, AttachmentsController.prototype.remove),
    ).toEqual([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
    expect(
      Reflect.getMetadata(ROLES_KEY, AuditLogsController.prototype.findAll),
    ).toEqual([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VIEWER]);
  });
});

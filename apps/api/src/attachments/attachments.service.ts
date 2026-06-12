import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

import {
  AUDIT_ACTIONS,
  AUDIT_ENTITIES,
} from '../audit-logs/audit-log.constants';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import type { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../database/prisma.service';
import {
  AttachmentType,
  MaintenanceStatus,
  UserRole,
} from '../generated/prisma/client';
import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  ATTACHMENTS_STORAGE_DIR,
  MAX_ATTACHMENT_SIZE_BYTES,
} from './attachments.constants';

interface CreateAttachmentInput {
  user: AuthUser;
  file: Express.Multer.File;
  type?: string;
}

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly configService: ConfigService,
  ) {}

  async listByEquipment(user: AuthUser, equipmentId: string) {
    await this.ensureEquipmentAccess(user, equipmentId);

    return this.prisma.attachment.findMany({
      where: {
        equipmentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async listByMaintenanceOrder(user: AuthUser, orderId: string) {
    await this.ensureMaintenanceOrderAccess(user, orderId);

    return this.prisma.attachment.findMany({
      where: {
        orderId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async uploadForEquipment(equipmentId: string, input: CreateAttachmentInput) {
    await this.ensureEquipmentAccess(input.user, equipmentId);

    const storedFile = await this.storeFile(input.file);

    const attachment = await this.prisma.attachment.create({
      data: {
        type: this.resolveAttachmentType(input.type),
        filename: storedFile.filename,
        originalName: input.file.originalname,
        mimeType: input.file.mimetype,
        size: input.file.size,
        url: storedFile.relativePath,
        equipmentId,
      },
    });

    await this.auditLogsService.create({
      userId: input.user.id,
      action: AUDIT_ACTIONS.ATTACHMENT_UPLOADED,
      entity: AUDIT_ENTITIES.ATTACHMENT,
      entityId: attachment.id,
      newValue: {
        ownerType: 'equipment',
        ownerId: equipmentId,
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        size: attachment.size,
      },
    });

    return attachment;
  }

  async uploadForMaintenanceOrder(
    orderId: string,
    input: CreateAttachmentInput,
  ) {
    await this.ensureMaintenanceOrderAccess(input.user, orderId, true);

    const storedFile = await this.storeFile(input.file);

    const attachment = await this.prisma.attachment.create({
      data: {
        type: this.resolveAttachmentType(input.type),
        filename: storedFile.filename,
        originalName: input.file.originalname,
        mimeType: input.file.mimetype,
        size: input.file.size,
        url: storedFile.relativePath,
        orderId,
      },
    });

    await this.auditLogsService.create({
      userId: input.user.id,
      action: AUDIT_ACTIONS.ATTACHMENT_UPLOADED,
      entity: AUDIT_ENTITIES.ATTACHMENT,
      entityId: attachment.id,
      newValue: {
        ownerType: 'maintenance-order',
        ownerId: orderId,
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        size: attachment.size,
      },
    });

    return attachment;
  }

  async getDownloadStream(user: AuthUser, attachmentId: string) {
    const attachment = await this.findAccessibleAttachment(user, attachmentId);

    const absolutePath = this.resolveSafePath(attachment.url);

    return {
      attachment,
      stream: createReadStream(absolutePath),
    };
  }

  async remove(user: AuthUser, attachmentId: string) {
    const attachment = await this.findAccessibleAttachment(user, attachmentId);

    await this.prisma.attachment.delete({
      where: {
        id: attachment.id,
      },
    });

    await this.auditLogsService.create({
      userId: user.id,
      action: AUDIT_ACTIONS.ATTACHMENT_DELETED,
      entity: AUDIT_ENTITIES.ATTACHMENT,
      entityId: attachment.id,
      oldValue: {
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        size: attachment.size,
        equipmentId: attachment.equipmentId,
        orderId: attachment.orderId,
      },
    });

    const absolutePath = this.resolveSafePath(attachment.url);

    await unlink(absolutePath).catch(() => undefined);

    return attachment;
  }

  private async storeFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Attachment file is required');
    }

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      throw new BadRequestException('Attachment exceeds max size of 10MB');
    }

    if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }

    const storageDir = this.getStorageDir();
    await mkdir(storageDir, { recursive: true });

    const extension = this.getSafeExtension(file.originalname);
    const filename = `${randomUUID()}${extension}`;
    const absolutePath = resolve(storageDir, filename);

    await writeFile(absolutePath, file.buffer);

    return {
      filename,
      relativePath: `${ATTACHMENTS_STORAGE_DIR}/${filename}`,
    };
  }

  private resolveAttachmentType(type?: string) {
    if (!type) {
      return AttachmentType.OTHER;
    }

    const values = Object.values(AttachmentType) as string[];

    if (values.includes(type)) {
      return type as AttachmentType;
    }

    return AttachmentType.OTHER;
  }

  private getSafeExtension(originalName: string) {
    const normalized = originalName.toLowerCase();
    const dotIndex = normalized.lastIndexOf('.');

    if (dotIndex === -1) {
      return '';
    }

    const extension = normalized.slice(dotIndex);

    if (!/^\.[a-z0-9]+$/.test(extension)) {
      return '';
    }

    return extension;
  }

  private resolveSafePath(relativePath: string) {
    const logicalRoot = resolve(process.cwd(), ATTACHMENTS_STORAGE_DIR);
    const logicalPath = resolve(process.cwd(), relativePath);

    if (
      logicalPath !== logicalRoot &&
      !logicalPath.startsWith(`${logicalRoot}${sep}`)
    ) {
      throw new ForbiddenException('Invalid attachment path');
    }

    const storageRoot = this.getStorageDir();
    const absolutePath = resolve(
      storageRoot,
      relative(logicalRoot, logicalPath),
    );

    if (
      absolutePath !== storageRoot &&
      !absolutePath.startsWith(`${storageRoot}${sep}`)
    ) {
      throw new ForbiddenException('Invalid attachment path');
    }

    return absolutePath;
  }

  private getStorageDir() {
    const configuredDir =
      this.configService.get<string>('storage.attachmentsDir') ??
      ATTACHMENTS_STORAGE_DIR;

    return resolve(process.cwd(), configuredDir);
  }

  private async findAccessibleAttachment(user: AuthUser, attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: {
        id: attachmentId,
      },
      include: {
        equipment: {
          select: {
            companyId: true,
          },
        },
        order: {
          include: {
            equipment: {
              select: {
                companyId: true,
              },
            },
          },
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return attachment;
    }

    const equipmentCompanyId = attachment.equipment?.companyId;
    const orderCompanyId = attachment.order?.equipment.companyId;

    if (
      user.companyId &&
      (equipmentCompanyId === user.companyId ||
        orderCompanyId === user.companyId)
    ) {
      return attachment;
    }

    throw new ForbiddenException('You cannot access this attachment');
  }

  private async ensureEquipmentAccess(user: AuthUser, equipmentId: string) {
    const equipment = await this.prisma.equipment.findUnique({
      where: {
        id: equipmentId,
      },
      select: {
        id: true,
        companyId: true,
      },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return equipment;
    }

    if (user.companyId === equipment.companyId) {
      return equipment;
    }

    throw new ForbiddenException('You cannot access this equipment');
  }

  private async ensureMaintenanceOrderAccess(
    user: AuthUser,
    orderId: string,
    requireWorkAccess = false,
  ) {
    const order = await this.prisma.maintenanceOrder.findUnique({
      where: {
        id: orderId,
      },
      include: {
        equipment: {
          select: {
            companyId: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Maintenance order not found');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return order;
    }

    if (user.companyId !== order.equipment.companyId) {
      throw new ForbiddenException('You cannot access this maintenance order');
    }

    if (
      requireWorkAccess &&
      user.role === UserRole.TECHNICIAN &&
      order.assignedToId !== user.id &&
      !(
        order.assignedToId === null &&
        order.status === MaintenanceStatus.PENDING
      )
    ) {
      throw new ForbiddenException(
        'Technician can only upload attachments to assigned or unassigned pending orders',
      );
    }

    return order;
  }
}

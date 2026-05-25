import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

import type { AuthUser } from '../auth/types/auth-user.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../generated/prisma/client';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { AttachmentsService } from './attachments.service';

const READ_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.TECHNICIAN,
  UserRole.VIEWER,
];

const WRITE_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.TECHNICIAN,
];

@ApiTags('attachments')
@ApiBearerAuth()
@Controller('attachments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get('equipment/:equipmentId')
  @Roles(...READ_ROLES)
  @ApiOkResponse({
    description: 'List equipment attachments.',
  })
  listEquipmentAttachments(
    @CurrentUser() user: AuthUser,
    @Param('equipmentId') equipmentId: string,
  ) {
    return this.attachmentsService.listByEquipment(user, equipmentId);
  }

  @Get('maintenance-orders/:orderId')
  @Roles(...READ_ROLES)
  @ApiOkResponse({
    description: 'List maintenance order attachments.',
  })
  listMaintenanceOrderAttachments(
    @CurrentUser() user: AuthUser,
    @Param('orderId') orderId: string,
  ) {
    return this.attachmentsService.listByMaintenanceOrder(user, orderId);
  }

  @Post('equipment/:equipmentId')
  @Roles(...WRITE_ROLES)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          example: 'HOJA_DE_VIDA',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  uploadEquipmentAttachment(
    @CurrentUser() user: AuthUser,
    @Param('equipmentId') equipmentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateAttachmentDto,
  ) {
    return this.attachmentsService.uploadForEquipment(equipmentId, {
      user,
      file,
      type: body.type,
    });
  }

  @Post('maintenance-orders/:orderId')
  @Roles(...WRITE_ROLES)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          example: 'EVIDENCIA',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  uploadMaintenanceOrderAttachment(
    @CurrentUser() user: AuthUser,
    @Param('orderId') orderId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateAttachmentDto,
  ) {
    return this.attachmentsService.uploadForMaintenanceOrder(orderId, {
      user,
      file,
      type: body.type,
    });
  }

  @Get(':id/download')
  @Roles(...READ_ROLES)
  @Header('Cache-Control', 'private, max-age=300')
  async download(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    const { attachment, stream } =
      await this.attachmentsService.getDownloadStream(user, id);

    response.setHeader('Content-Type', attachment.mimeType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(attachment.originalName)}"`,
    );

    stream.pipe(response);
  }

  @Delete(':id')
  @Roles(...WRITE_ROLES)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.attachmentsService.remove(user, id);
  }
}

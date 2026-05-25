import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';

import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';

@Module({
  imports: [JwtModule.register({}), AuditLogsModule],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}

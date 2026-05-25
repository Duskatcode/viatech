import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [JwtModule.register({}), AuditLogsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}

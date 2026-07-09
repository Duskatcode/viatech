import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { CompanyMembershipsController } from './company-memberships.controller';
import { CompanyMembershipsService } from './company-memberships.service';

@Module({
  imports: [JwtModule.register({}), AuditLogsModule],
  controllers: [CompanyMembershipsController],
  providers: [CompanyMembershipsService],
  exports: [CompanyMembershipsService],
})
export class CompanyMembershipsModule {}

import { Module } from '@nestjs/common';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { JwtModule } from '@nestjs/jwt';

import { MaintenanceOrdersController } from './maintenance-orders.controller';
import { MaintenanceOrdersService } from './maintenance-orders.service';

@Module({
  imports: [AuditLogsModule, JwtModule.register({})],
  controllers: [MaintenanceOrdersController],
  providers: [MaintenanceOrdersService],
  exports: [MaintenanceOrdersService],
})
export class MaintenanceOrdersModule {}

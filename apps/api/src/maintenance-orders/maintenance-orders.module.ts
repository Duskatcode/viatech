import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { MaintenanceOrdersController } from './maintenance-orders.controller';
import { MaintenanceOrdersService } from './maintenance-orders.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [MaintenanceOrdersController],
  providers: [MaintenanceOrdersService],
  exports: [MaintenanceOrdersService],
})
export class MaintenanceOrdersModule {}

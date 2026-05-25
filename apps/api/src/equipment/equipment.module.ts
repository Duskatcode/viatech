import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}

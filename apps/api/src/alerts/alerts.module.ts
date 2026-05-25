import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}

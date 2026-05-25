import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AreasController } from './areas.controller';
import { AreasService } from './areas.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AreasController],
  providers: [AreasService],
  exports: [AreasService],
})
export class AreasModule {}

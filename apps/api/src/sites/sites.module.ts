import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}

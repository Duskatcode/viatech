import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}

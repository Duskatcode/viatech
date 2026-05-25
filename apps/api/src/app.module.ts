import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AreasModule } from './areas/areas.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { appConfig } from './config/app.config';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { EquipmentModule } from './equipment/equipment.module';
import { HealthModule } from './health/health.module';
import { MaintenanceOrdersModule } from './maintenance-orders/maintenance-orders.module';
import { ReportsModule } from './reports/reports.module';
import { SitesModule } from './sites/sites.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '../../.env.local', '../../.env'],
      load: [appConfig],
      validate: validateEnv,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    SitesModule,
    AreasModule,
    EquipmentModule,
    MaintenanceOrdersModule,
    ReportsModule,
    HealthModule,
  ],
})
export class AppModule {}

import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import type { AuthUser } from '../auth/types/auth-user.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../generated/prisma/client';
import { QueryEquipmentReportDto } from './dto/query-equipment-report.dto';
import { QueryMaintenanceReportDto } from './dto/query-maintenance-report.dto';
import { ReportsService } from './reports.service';
import { withUtf8Bom } from './reports-csv.util';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.VIEWER)
  @ApiOkResponse({
    description: 'Reports summary.',
  })
  summary(@CurrentUser() user: AuthUser) {
    return this.reportsService.summary(user);
  }

  @Get('equipment')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.VIEWER)
  @ApiOkResponse({
    description: 'Equipment report as JSON.',
  })
  equipment(@CurrentUser() user: AuthUser, @Query() query: QueryEquipmentReportDto) {
    return this.reportsService.findEquipment(user, query);
  }

  @Get('equipment.csv')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.VIEWER)
  async equipmentCsv(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryEquipmentReportDto,
    @Res() response: Response,
  ) {
    const csv = await this.reportsService.equipmentCsv(user, query);

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="equipment-report.csv"',
    );

    response.send(withUtf8Bom(csv));
  }

  @Get('maintenance-orders')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.VIEWER)
  @ApiOkResponse({
    description: 'Maintenance orders report as JSON.',
  })
  maintenanceOrders(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryMaintenanceReportDto,
  ) {
    return this.reportsService.findMaintenanceOrders(user, query);
  }

  @Get('maintenance-orders.csv')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.VIEWER)
  async maintenanceOrdersCsv(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryMaintenanceReportDto,
    @Res() response: Response,
  ) {
    const csv = await this.reportsService.maintenanceOrdersCsv(user, query);

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="maintenance-orders-report.csv"',
    );

    response.send(withUtf8Bom(csv));
  }
}

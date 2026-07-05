import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import type { AuthUser } from '../auth/types/auth-user.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@biomed/shared';
import { QueryEquipmentReportDto } from './dto/query-equipment-report.dto';
import { QueryMaintenanceReportDto } from './dto/query-maintenance-report.dto';
import { withUtf8Bom } from './reports-csv.util';
import { ReportsService } from './reports.service';

const REPORT_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.TECHNICIAN,
  UserRole.VIEWER,
];

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @Roles(...REPORT_ROLES)
  @ApiOkResponse({
    description: 'Reports summary.',
  })
  summary(@CurrentUser() user: AuthUser) {
    return this.reportsService.summary(user);
  }

  @Get('equipment')
  @Roles(...REPORT_ROLES)
  @ApiOkResponse({
    description: 'Equipment report as JSON.',
  })
  equipment(@CurrentUser() user: AuthUser, @Query() query: QueryEquipmentReportDto) {
    return this.reportsService.findEquipment(user, query);
  }

  @Get('equipment.csv')
  @Roles(...REPORT_ROLES)
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

  @Get('equipment.xlsx')
  @Roles(...REPORT_ROLES)
  async equipmentXlsx(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryEquipmentReportDto,
    @Res() response: Response,
  ) {
    const workbook = await this.reportsService.equipmentXlsx(user, query);

    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="equipment-report.xlsx"',
    );

    response.send(workbook);
  }


  @Get('maintenance-orders/:id.pdf')
  @Roles(...REPORT_ROLES)
  async maintenanceOrderPdf(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    const pdf = await this.reportsService.maintenanceOrderPdf(user, id);

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="maintenance-order-${id}.pdf"`,
    );

    response.send(pdf);
  }

  @Get('maintenance-orders')
  @Roles(...REPORT_ROLES)
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
  @Roles(...REPORT_ROLES)
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

  @Get('maintenance-orders.xlsx')
  @Roles(...REPORT_ROLES)
  async maintenanceOrdersXlsx(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryMaintenanceReportDto,
    @Res() response: Response,
  ) {
    const workbook = await this.reportsService.maintenanceOrdersXlsx(user, query);

    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="maintenance-orders-report.xlsx"',
    );

    response.send(workbook);
  }
}

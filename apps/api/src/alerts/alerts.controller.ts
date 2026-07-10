import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import type { AuthUser } from '../auth/types/auth-user.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@vitatech/shared';
import { AlertsService } from './alerts.service';
import { QueryAlertsSummaryDto } from './dto/query-alerts-summary.dto';

const ALERT_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.TECHNICIAN,
  UserRole.VIEWER,
];

@ApiTags('alerts')
@ApiBearerAuth()
@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get('summary')
  @Roles(...ALERT_ROLES)
  @ApiOkResponse({
    description: 'Operational alerts summary.',
  })
  summary(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryAlertsSummaryDto,
  ) {
    return this.alertsService.summary(user, query);
  }
}

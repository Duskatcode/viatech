import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import type { AuthUser } from '../auth/types/auth-user.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../generated/prisma/client';
import { AssignMaintenanceOrderDto } from './dto/assign-maintenance-order.dto';
import { CancelMaintenanceOrderDto } from './dto/cancel-maintenance-order.dto';
import { CompleteMaintenanceOrderDto } from './dto/complete-maintenance-order.dto';
import { CreateMaintenanceOrderDto } from './dto/create-maintenance-order.dto';
import { CreateMaintenanceTaskDto } from './dto/create-maintenance-task.dto';
import { QueryMaintenanceOrdersDto } from './dto/query-maintenance-orders.dto';
import { UpdateMaintenanceOrderDto } from './dto/update-maintenance-order.dto';
import { UpdateMaintenanceTaskDto } from './dto/update-maintenance-task.dto';
import { MaintenanceOrdersService } from './maintenance-orders.service';

@ApiTags('maintenance-orders')
@ApiBearerAuth()
@Controller('maintenance-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceOrdersController {
  constructor(
    private readonly maintenanceOrdersService: MaintenanceOrdersService,
  ) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Create maintenance order.',
  })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateMaintenanceOrderDto,
  ) {
    return this.maintenanceOrdersService.create(user, dto);
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.TECHNICIAN,
    UserRole.VIEWER,
  )
  @ApiOkResponse({
    description: 'List maintenance orders.',
  })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryMaintenanceOrdersDto,
  ) {
    return this.maintenanceOrdersService.findAll(user, query);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.TECHNICIAN,
    UserRole.VIEWER,
  )
  @ApiOkResponse({
    description: 'Get maintenance order by id.',
  })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.maintenanceOrdersService.findOne(user, id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Update maintenance order.',
  })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceOrderDto,
  ) {
    return this.maintenanceOrdersService.update(user, id, dto);
  }

  @Patch(':id/assign')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Assign maintenance order.',
  })
  assign(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: AssignMaintenanceOrderDto,
  ) {
    return this.maintenanceOrdersService.assign(user, id, dto);
  }

  @Patch(':id/start')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TECHNICIAN)
  @ApiOkResponse({
    description: 'Start maintenance order.',
  })
  start(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.maintenanceOrdersService.start(user, id);
  }

  @Patch(':id/complete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TECHNICIAN)
  @ApiOkResponse({
    description: 'Complete maintenance order.',
  })
  complete(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CompleteMaintenanceOrderDto,
  ) {
    return this.maintenanceOrdersService.complete(user, id, dto);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Cancel maintenance order.',
  })
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CancelMaintenanceOrderDto,
  ) {
    return this.maintenanceOrdersService.cancel(user, id, dto);
  }

  @Post(':id/tasks')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TECHNICIAN)
  @ApiOkResponse({
    description: 'Add maintenance task.',
  })
  addTask(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateMaintenanceTaskDto,
  ) {
    return this.maintenanceOrdersService.addTask(user, id, dto);
  }

  @Patch(':id/tasks/:taskId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TECHNICIAN)
  @ApiOkResponse({
    description: 'Update maintenance task.',
  })
  updateTask(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateMaintenanceTaskDto,
  ) {
    return this.maintenanceOrdersService.updateTask(user, id, taskId, dto);
  }
}

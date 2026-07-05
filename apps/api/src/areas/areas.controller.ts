import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import type { AuthUser } from '../auth/types/auth-user.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@biomed/shared';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@ApiTags('areas')
@ApiBearerAuth()
@Controller('areas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Create area.',
  })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAreaDto) {
    return this.areasService.create(user, dto);
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.TECHNICIAN,
    UserRole.VIEWER,
  )
  @ApiOkResponse({
    description: 'List areas.',
  })
  findAll(@CurrentUser() user: AuthUser) {
    return this.areasService.findAll(user);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.TECHNICIAN,
    UserRole.VIEWER,
  )
  @ApiOkResponse({
    description: 'Get area by id.',
  })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.areasService.findOne(user, id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Update area.',
  })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateAreaDto,
  ) {
    return this.areasService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Soft delete area.',
  })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.areasService.remove(user, id);
  }
}

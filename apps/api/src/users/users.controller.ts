import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../generated/prisma/client';
import type { AuthUser } from '../auth/types/auth-user.type';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({
    description: 'Current user profile.',
  })
  me(@CurrentUser() user: AuthUser) {
    return this.usersService.findProfileById(user.id);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOkResponse({
    description: 'List users.',
  })
  list(@CurrentUser() user: AuthUser) {
    return this.usersService.listUsers(user.role, user.companyId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Get user by id.',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findProfileById(id);
  }
}

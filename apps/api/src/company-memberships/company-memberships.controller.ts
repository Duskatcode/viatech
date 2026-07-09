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
import { UserRole } from '@vitatech/shared';

import type { AuthUser } from '../auth/types/auth-user.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CompanyMembershipsService } from './company-memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { QueryMembershipsDto } from './dto/query-memberships.dto';
import { SearchAssignableUsersDto } from './dto/search-assignable-users.dto';

const MEMBERSHIP_MANAGER_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

@ApiTags('company-memberships')
@ApiBearerAuth()
@Controller('company-memberships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyMembershipsController {
  constructor(
    private readonly companyMembershipsService: CompanyMembershipsService,
  ) {}

  @Get('search-users')
  @Roles(...MEMBERSHIP_MANAGER_ROLES)
  @ApiOkResponse({
    description:
      'Pool global de usuarios TECHNICIAN/VIEWER que pueden vincularse a una empresa.',
  })
  searchUsers(
    @CurrentUser() user: AuthUser,
    @Query() query: SearchAssignableUsersDto,
  ) {
    return this.companyMembershipsService.searchAssignableUsers(
      user,
      query.search,
    );
  }

  @Get()
  @Roles(...MEMBERSHIP_MANAGER_ROLES)
  @ApiOkResponse({ description: 'Membresias de una empresa.' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryMembershipsDto) {
    return this.companyMembershipsService.findAll(user, query);
  }

  @Post()
  @Roles(...MEMBERSHIP_MANAGER_ROLES)
  @ApiOkResponse({ description: 'Vincula un usuario a una empresa/sede.' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateMembershipDto) {
    return this.companyMembershipsService.create(user, dto);
  }

  @Patch(':id/revoke')
  @Roles(...MEMBERSHIP_MANAGER_ROLES)
  @ApiOkResponse({ description: 'Revoca (desactiva) una membresia.' })
  revoke(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.companyMembershipsService.revoke(user, id);
  }
}

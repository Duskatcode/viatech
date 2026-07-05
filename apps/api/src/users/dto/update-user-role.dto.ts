import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { UserRole } from '@biomed/shared';

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: UserRole,
    example: UserRole.VIEWER,
  })
  @IsEnum(UserRole)
  role!: UserRole;
}

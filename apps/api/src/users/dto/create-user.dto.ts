import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { UserRole } from '@biomed/shared';

export class CreateUserDto {
  @ApiProperty({
    example: 'Técnico Biomédico',
  })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({
    example: 'tecnico@biomed.local',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Admin12345!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.TECHNICIAN,
  })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiPropertyOptional({
    description:
      'Required for SUPER_ADMIN when creating ADMIN, TECHNICIAN or VIEWER. ADMIN is always scoped to their own company.',
  })
  @IsOptional()
  @IsString()
  companyId?: string;
}

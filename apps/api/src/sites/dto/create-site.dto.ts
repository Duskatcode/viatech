import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSiteDto {
  @ApiPropertyOptional({
    description: 'Required for SUPER_ADMIN. Ignored for ADMIN.',
  })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiProperty({
    example: 'Sede Principal',
  })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({
    example: 'Medellín',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'Dirección demo',
  })
  @IsOptional()
  @IsString()
  address?: string;
}

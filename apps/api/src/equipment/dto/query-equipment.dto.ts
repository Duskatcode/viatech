import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { EquipmentStatus } from '../../generated/prisma/client';

export class QueryEquipmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  siteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  areaId?: string;

  @ApiPropertyOptional({
    enum: EquipmentStatus,
  })
  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;

  @ApiPropertyOptional({
    description: 'Search by internal code, name, brand, model or serial number.',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { EquipmentStatus } from '../../generated/prisma/client';

export class CreateEquipmentDto {
  @ApiPropertyOptional({
    description: 'Required for SUPER_ADMIN. Ignored for ADMIN.',
  })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiProperty()
  @IsString()
  siteId!: string;

  @ApiProperty()
  @IsString()
  areaId!: string;

  @ApiProperty({
    example: 'EQ-001',
  })
  @IsString()
  @MinLength(2)
  internalCode!: string;

  @ApiProperty({
    example: 'Pulsioxímetro Adulto',
  })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({
    example: 'Mindray',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    example: 'PM-60',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    example: 'SN-123456',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: 'Monitorización',
  })
  @IsOptional()
  @IsString()
  equipmentType?: string;

  @ApiPropertyOptional({
    example: 'IIA',
  })
  @IsOptional()
  @IsString()
  riskLevel?: string;

  @ApiPropertyOptional({
    enum: EquipmentStatus,
    example: EquipmentStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;

  @ApiPropertyOptional({
    example: '2026-01-15',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-01-20',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2027-01-20',
  })
  @IsOptional()
  @IsDateString()
  warrantyUntil?: string;

  @ApiPropertyOptional({
    example: 'Equipo ubicado en área crítica.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

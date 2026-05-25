import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { EquipmentStatus } from '../../generated/prisma/client';

export class UpdateEquipmentStatusDto {
  @ApiProperty({
    enum: EquipmentStatus,
    example: EquipmentStatus.IN_MAINTENANCE,
  })
  @IsEnum(EquipmentStatus)
  status!: EquipmentStatus;

  @ApiPropertyOptional({
    example: 'Cambio de estado por mantenimiento técnico.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

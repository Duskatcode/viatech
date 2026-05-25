import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { EquipmentStatus } from '../../generated/prisma/client';

export class CompleteMaintenanceOrderDto {
  @ApiPropertyOptional({
    example: 'Equipo en buen estado general.',
  })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({
    example: 'Se realizó limpieza, prueba funcional y verificación de batería.',
  })
  @IsOptional()
  @IsString()
  actionsPerformed?: string;

  @ApiPropertyOptional({
    example: 'Realizar nueva revisión en 6 meses.',
  })
  @IsOptional()
  @IsString()
  recommendations?: string;

  @ApiPropertyOptional({
    enum: EquipmentStatus,
    example: EquipmentStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(EquipmentStatus)
  finalEquipmentStatus?: EquipmentStatus;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelMaintenanceOrderDto {
  @ApiPropertyOptional({
    example: 'Orden cancelada por duplicidad.',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

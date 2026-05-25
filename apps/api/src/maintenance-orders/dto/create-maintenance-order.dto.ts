import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { MaintenanceType } from '../../generated/prisma/client';
import { CreateMaintenanceTaskDto } from './create-maintenance-task.dto';

export class CreateMaintenanceOrderDto {
  @ApiPropertyOptional({
    example: 'MTTO-2026-001',
    description: 'If omitted, the API generates a code.',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  code?: string;

  @ApiProperty()
  @IsString()
  equipmentId!: string;

  @ApiProperty({
    enum: MaintenanceType,
    example: MaintenanceType.PREVENTIVE,
  })
  @IsEnum(MaintenanceType)
  type!: MaintenanceType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional({
    example: '2026-06-01T14:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({
    example: 'Mantenimiento preventivo trimestral.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: [CreateMaintenanceTaskDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaintenanceTaskDto)
  tasks?: CreateMaintenanceTaskDto[];
}

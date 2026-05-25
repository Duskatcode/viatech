import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateMaintenanceTaskDto {
  @ApiPropertyOptional({
    example: 'Verificar estado físico',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @ApiPropertyOptional({
    example: 'Revisar carcasa, pantalla, botones y conectores.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMaintenanceTaskDto {
  @ApiProperty({
    example: 'Verificar estado físico',
  })
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiPropertyOptional({
    example: 'Revisar carcasa, pantalla, botones y conectores.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

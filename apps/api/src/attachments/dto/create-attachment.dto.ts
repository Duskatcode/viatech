import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAttachmentDto {
  @ApiPropertyOptional({
    example: 'Hoja de vida del equipo',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  type?: string;
}

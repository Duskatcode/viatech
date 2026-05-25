import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAreaDto {
  @ApiProperty()
  @IsString()
  siteId!: string;

  @ApiProperty({
    example: 'Urgencias',
  })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({
    example: '1',
  })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiPropertyOptional({
    example: 'Área de urgencias',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

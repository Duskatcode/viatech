import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    example: 'Clínica Demo Biomédica',
  })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({
    example: '900000000-1',
  })
  @IsOptional()
  @IsString()
  nit?: string;

  @ApiPropertyOptional({
    example: '3000000000',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'admin@clinicademo.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'Medellín, Colombia',
  })
  @IsOptional()
  @IsString()
  address?: string;
}

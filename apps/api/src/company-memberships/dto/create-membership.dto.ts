import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMembershipDto {
  @ApiProperty({
    example: 'cmxyz123',
    description: 'ID del usuario (TECHNICIAN o VIEWER) a vincular.',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    example: 'cmabc456',
    description: 'Empresa a la que se vincula el usuario.',
  })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiPropertyOptional({
    example: 'cmsite789',
    description:
      'Sede especifica dentro de la empresa. Si se omite, la membresia aplica a toda la empresa.',
  })
  @IsOptional()
  @IsString()
  siteId?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryMembershipsDto {
  @ApiPropertyOptional({
    example: 'cmabc456',
    description:
      'Filtra por empresa. Obligatorio en la practica para ADMIN (solo puede ver la suya); opcional para SUPER_ADMIN.',
  })
  @IsOptional()
  @IsString()
  companyId?: string;
}

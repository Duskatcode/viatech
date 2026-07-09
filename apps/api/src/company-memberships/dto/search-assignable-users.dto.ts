import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchAssignableUsersDto {
  @ApiPropertyOptional({
    example: 'ana',
    description: 'Busca por nombre o email, sin distinguir empresa.',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryUsersDto {
  @ApiPropertyOptional({
    description: 'Available only to SUPER_ADMIN.',
  })
  @IsOptional()
  @IsString()
  companyId?: string;
}

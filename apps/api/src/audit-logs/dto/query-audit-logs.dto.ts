import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class QueryAuditLogsDto {
  @ApiPropertyOptional({
    example: 'ATTACHMENT_UPLOADED',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    example: 'Attachment',
  })
  @IsOptional()
  @IsString()
  entity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class QueryAlertsSummaryDto {
  @ApiPropertyOptional({
    example: 30,
    description:
      'Window in days for upcoming maintenance and expiring warranties.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number;
}

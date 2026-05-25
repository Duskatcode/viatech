import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignMaintenanceOrderDto {
  @ApiProperty()
  @IsString()
  assignedToId!: string;
}

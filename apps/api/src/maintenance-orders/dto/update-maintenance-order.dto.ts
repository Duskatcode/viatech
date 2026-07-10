import { PartialType } from '@nestjs/swagger';

import { CreateMaintenanceOrderDto } from './create-maintenance-order.dto';

export class UpdateMaintenanceOrderDto extends PartialType(
  CreateMaintenanceOrderDto,
) {}

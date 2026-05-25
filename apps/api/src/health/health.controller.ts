import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { HealthService } from './health.service';
import type { HealthResponse } from './health.types';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({
    description: 'API health status.',
    schema: {
      example: {
        status: 'ok',
        service: 'Biomed Maintenance API',
        version: '0.0.1',
        uptime: 12.34,
        timestamp: '2026-05-24T22:00:00.000Z',
      },
    },
  })
  check(): HealthResponse {
    return this.healthService.check();
  }
}

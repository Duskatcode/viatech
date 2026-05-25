import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { HealthResponse } from './health.types';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  check(): HealthResponse {
    return {
      status: 'ok',
      service: this.configService.get<string>('app.name') ?? 'Biomed Maintenance API',
      version: this.configService.get<string>('app.version') ?? '0.0.1',
      uptime: Number(process.uptime().toFixed(2)),
      timestamp: new Date().toISOString(),
    };
  }
}

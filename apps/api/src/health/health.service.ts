import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../database/prisma.service';
import type { DatabaseHealthResponse, HealthResponse } from './health.types';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  check(): HealthResponse {
    return {
      status: 'ok',
      service: this.configService.get<string>('app.name') ?? 'Biomed Maintenance API',
      version: this.configService.get<string>('app.version') ?? '0.0.1',
      uptime: Number(process.uptime().toFixed(2)),
      timestamp: new Date().toISOString(),
    };
  }

  async checkDatabase(): Promise<DatabaseHealthResponse> {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      database: 'reachable',
      timestamp: new Date().toISOString(),
    };
  }
}

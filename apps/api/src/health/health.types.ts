export interface HealthResponse {
  status: 'ok';
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
}

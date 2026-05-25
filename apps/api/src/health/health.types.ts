export interface HealthResponse {
  status: 'ok';
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
}

export interface DatabaseHealthResponse {
  status: 'ok';
  database: 'reachable';
  timestamp: string;
}

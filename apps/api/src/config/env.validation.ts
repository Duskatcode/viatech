type NodeEnv = 'development' | 'test' | 'production';

interface ValidatedEnv {
  NODE_ENV: NodeEnv;
  API_PORT: number;
  API_PREFIX: string;
  SWAGGER_PATH: string;
  FRONTEND_ORIGIN: string;
  APP_NAME: string;
  APP_VERSION: string;
  DATABASE_URL: string;
}

function parseNumber(value: unknown, fallback: number): number {
  const parsed = Number(value ?? fallback);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return parsed;
}

function parseNodeEnv(value: unknown): NodeEnv {
  const env = String(value ?? 'development');

  if (env === 'development' || env === 'test' || env === 'production') {
    return env;
  }

  throw new Error(`Invalid NODE_ENV: ${env}`);
}

export function validateEnv(config: Record<string, unknown>): ValidatedEnv {
  const databaseUrl = String(config.DATABASE_URL ?? '');

  if (!databaseUrl.trim()) {
    throw new Error('DATABASE_URL is required');
  }

  const validatedConfig: ValidatedEnv = {
    NODE_ENV: parseNodeEnv(config.NODE_ENV),
    API_PORT: parseNumber(config.API_PORT, 3000),
    API_PREFIX: String(config.API_PREFIX ?? 'api/v1'),
    SWAGGER_PATH: String(config.SWAGGER_PATH ?? 'api/docs'),
    FRONTEND_ORIGIN: String(config.FRONTEND_ORIGIN ?? 'http://localhost:5173'),
    APP_NAME: String(config.APP_NAME ?? 'Biomed Maintenance API'),
    APP_VERSION: String(config.APP_VERSION ?? '0.0.1'),
    DATABASE_URL: databaseUrl,
  };

  if (validatedConfig.API_PORT <= 0) {
    throw new Error('API_PORT must be greater than 0');
  }

  if (!validatedConfig.API_PREFIX.trim()) {
    throw new Error('API_PREFIX is required');
  }

  if (!validatedConfig.SWAGGER_PATH.trim()) {
    throw new Error('SWAGGER_PATH is required');
  }

  return validatedConfig;
}

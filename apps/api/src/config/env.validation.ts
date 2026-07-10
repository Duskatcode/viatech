type NodeEnv = 'development' | 'test' | 'production';

interface ValidatedEnv {
  NODE_ENV: NodeEnv;
  API_PORT: number;
  API_PREFIX: string;
  SWAGGER_PATH: string;
  CORS_ORIGINS: string;
  APP_NAME: string;
  APP_VERSION: string;
  ATTACHMENTS_STORAGE_DIR: string;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN_SECONDS: number;
  JWT_REFRESH_EXPIRES_IN_SECONDS: number;
}

function parseNumber(value: unknown, fallback: number): number {
  const parsed = Number(value ?? fallback);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return parsed;
}

function safeString(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return fallback;
}

function parseNodeEnv(value: unknown): NodeEnv {
  const env = safeString(value, 'development');

  if (env === 'development' || env === 'test' || env === 'production') {
    return env;
  }

  throw new Error(`Invalid NODE_ENV: ${env}`);
}

function requiredString(config: Record<string, unknown>, key: string): string {
  const value = safeString(config[key]);

  if (!value.trim()) {
    throw new Error(`${key} is required`);
  }

  return value;
}

function parseCorsOrigins(value: unknown): string {
  const origins = safeString(value, 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error('CORS_ORIGINS must include at least one origin');
  }

  if (origins.includes('*')) {
    throw new Error(
      'CORS_ORIGINS cannot include "*" when credentials are enabled',
    );
  }

  return origins.join(',');
}

export function validateEnv(config: Record<string, unknown>): ValidatedEnv {
  const validatedConfig: ValidatedEnv = {
    NODE_ENV: parseNodeEnv(config.NODE_ENV),
    API_PORT: parseNumber(config.PORT ?? config.API_PORT, 3000),
    API_PREFIX: safeString(config.API_PREFIX, 'api/v1'),
    SWAGGER_PATH: safeString(config.SWAGGER_PATH, 'api/docs'),
    CORS_ORIGINS: parseCorsOrigins(
      config.CORS_ORIGINS ?? config.FRONTEND_ORIGIN,
    ),
    APP_NAME: safeString(config.APP_NAME, 'Vitatech Maintenance API'),
    APP_VERSION: safeString(config.APP_VERSION, '0.0.1'),
    ATTACHMENTS_STORAGE_DIR: safeString(
      config.ATTACHMENTS_STORAGE_DIR,
      'storage/attachments',
    ),
    DATABASE_URL: requiredString(config, 'DATABASE_URL'),
    JWT_ACCESS_SECRET: requiredString(config, 'JWT_ACCESS_SECRET'),
    JWT_REFRESH_SECRET: requiredString(config, 'JWT_REFRESH_SECRET'),
    JWT_ACCESS_EXPIRES_IN_SECONDS: parseNumber(
      config.JWT_ACCESS_EXPIRES_IN_SECONDS,
      900,
    ),
    JWT_REFRESH_EXPIRES_IN_SECONDS: parseNumber(
      config.JWT_REFRESH_EXPIRES_IN_SECONDS,
      604800,
    ),
  };

  if (validatedConfig.API_PORT <= 0) {
    throw new Error('PORT or API_PORT must be greater than 0');
  }

  if (validatedConfig.JWT_ACCESS_EXPIRES_IN_SECONDS <= 0) {
    throw new Error('JWT_ACCESS_EXPIRES_IN_SECONDS must be greater than 0');
  }

  if (validatedConfig.JWT_REFRESH_EXPIRES_IN_SECONDS <= 0) {
    throw new Error('JWT_REFRESH_EXPIRES_IN_SECONDS must be greater than 0');
  }

  return validatedConfig;
}

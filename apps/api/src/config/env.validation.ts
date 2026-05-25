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

function parseNodeEnv(value: unknown): NodeEnv {
  const env = String(value ?? 'development');

  if (env === 'development' || env === 'test' || env === 'production') {
    return env;
  }

  throw new Error(`Invalid NODE_ENV: ${env}`);
}

function requiredString(config: Record<string, unknown>, key: string): string {
  const value = String(config[key] ?? '');

  if (!value.trim()) {
    throw new Error(`${key} is required`);
  }

  return value;
}

export function validateEnv(config: Record<string, unknown>): ValidatedEnv {
  const validatedConfig: ValidatedEnv = {
    NODE_ENV: parseNodeEnv(config.NODE_ENV),
    API_PORT: parseNumber(config.API_PORT, 3000),
    API_PREFIX: String(config.API_PREFIX ?? 'api/v1'),
    SWAGGER_PATH: String(config.SWAGGER_PATH ?? 'api/docs'),
    FRONTEND_ORIGIN: String(config.FRONTEND_ORIGIN ?? 'http://localhost:5173'),
    APP_NAME: String(config.APP_NAME ?? 'Biomed Maintenance API'),
    APP_VERSION: String(config.APP_VERSION ?? '0.0.1'),
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
    throw new Error('API_PORT must be greater than 0');
  }

  if (validatedConfig.JWT_ACCESS_EXPIRES_IN_SECONDS <= 0) {
    throw new Error('JWT_ACCESS_EXPIRES_IN_SECONDS must be greater than 0');
  }

  if (validatedConfig.JWT_REFRESH_EXPIRES_IN_SECONDS <= 0) {
    throw new Error('JWT_REFRESH_EXPIRES_IN_SECONDS must be greater than 0');
  }

  return validatedConfig;
}

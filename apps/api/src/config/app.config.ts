function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value ?? fallback);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return parsed;
}

export const appConfig = () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    name: process.env.APP_NAME ?? 'Biomed Maintenance API',
    version: process.env.APP_VERSION ?? '0.0.1',
    port: parseNumber(process.env.API_PORT, 3000),
    apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  },
  swagger: {
    path: process.env.SWAGGER_PATH ?? 'api/docs',
  },
  cors: {
    frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
});

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import {
  DEFAULT_API_PORT,
  DEFAULT_API_PREFIX,
  DEFAULT_SWAGGER_PATH,
} from './common/constants/api.constants';

function parseCorsOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port') ?? DEFAULT_API_PORT;
  const apiPrefix = configService.get<string>('app.apiPrefix') ?? DEFAULT_API_PREFIX;
  const swaggerPath =
    configService.get<string>('swagger.path') ?? DEFAULT_SWAGGER_PATH;
  const frontendOrigin =
    configService.get<string>('cors.frontendOrigin') ?? 'http://localhost:5173';
  const appName =
    configService.get<string>('app.name') ?? 'Biomed Maintenance API';
  const appVersion = configService.get<string>('app.version') ?? '0.0.1';

  app.use(helmet());

  app.enableCors({
    origin: parseCorsOrigins(frontendOrigin),
    credentials: true,
  });

  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const enableSwagger = configService.get<string>('ENABLE_SWAGGER') === 'true';

  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(appName)
      .setDescription('API for biomedical equipment maintenance management.')
      .setVersion(appVersion)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(port);

  console.log(`API running on http://localhost:${port}/${apiPrefix}`);

  if (enableSwagger) {
    console.log(`Swagger running on http://localhost:${port}/${swaggerPath}`);
  }
}

bootstrap();

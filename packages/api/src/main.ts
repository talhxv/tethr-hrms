import 'reflect-metadata';
import 'dotenv/config';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { DomainExceptionFilter } from './common/errors/domain-exception.filter';
import { ConfigService } from './core/config/config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Dev-permissive CORS so the Vite SPA (:5173) can call the API (:3000).
  app.enableCors({ origin: true, credentials: true });

  // Validate every boundary input; strip unknown fields; reject extras.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  // Map domain errors to the right transport response.
  app.useGlobalFilters(new DomainExceptionFilter());

  const config = app.get(ConfigService);
  const port = config.get('PORT');
  await app.listen(port);
  Logger.log(`HRMS API ready at http://localhost:${port}/graphql`, 'Bootstrap');
}

void bootstrap();

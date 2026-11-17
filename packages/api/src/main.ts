import 'reflect-metadata';
import 'dotenv/config';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';

import { AppModule } from './app.module';
import { DomainExceptionFilter } from './common/errors/domain-exception.filter';
import { ConfigService } from './core/config/config.service';

// Data-URL image uploads (employee photos, invoice branding) run well past
// Express's default 100kb body limit, so the default parser is disabled and
// replaced with one sized for a base64 image (see the 600_000-char caps on
// those inputs).
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ extended: true, limit: '2mb' }));

  // Run onModuleDestroy on SIGTERM/SIGINT so the shared PDF browser is closed
  // gracefully instead of being orphaned on redeploy.
  app.enableShutdownHooks();

  const config = app.get(ConfigService);

  // CORS: an explicit allowlist when CORS_ORIGINS is set (required in
  // production, enforced by the config schema); development without it stays
  // permissive so the Vite SPA (:5173) can call the API (:3000).
  const allowedOrigins = config.get('CORS_ORIGINS');
  app.enableCors({ origin: allowedOrigins ?? true, credentials: true });

  // Behind the hosting proxy (Render) the socket address is the proxy's, which
  // would put every user in one rate-limit bucket. Trust exactly one hop so
  // req.ip is the caller's address.
  if (config.get('NODE_ENV') === 'production') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  // Validate every boundary input; strip unknown fields; reject extras.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  // Map domain errors to the right transport response.
  app.useGlobalFilters(new DomainExceptionFilter());

  const port = config.get('PORT');
  await app.listen(port);
  Logger.log(
    `HRMS API ready at http://localhost:${port}/graphql (Node ${process.version})`,
    'Bootstrap',
  );
}

void bootstrap();

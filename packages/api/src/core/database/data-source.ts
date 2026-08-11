import 'reflect-metadata';
import 'dotenv/config';
import { join } from 'node:path';

import { DataSource, type DataSourceOptions } from 'typeorm';

import { loadConfig, type AppConfig } from '../config/config.schema';

// Forward-slash globs work on every platform (raw __dirname has back-slashes on
// Windows, which the glob matcher mishandles).
const toGlob = (...segments: string[]): string => join(...segments).replace(/\\/g, '/');

export const buildDataSourceOptions = (config: AppConfig = loadConfig()): DataSourceOptions => ({
  type: 'postgres',
  host: config.DATABASE_HOST,
  port: config.DATABASE_PORT,
  username: config.DATABASE_USER,
  password: config.DATABASE_PASSWORD,
  database: config.DATABASE_NAME,
  synchronize: config.DATABASE_SYNCHRONIZE,
  logging: config.DATABASE_LOGGING,
  ssl: config.DATABASE_SSL ? { rejectUnauthorized: false } : false,
  entities: [`${toGlob(__dirname, '..', '..')}/**/*.entity.{ts,js}`],
  migrations: [`${toGlob(__dirname, 'migrations')}/*.{ts,js}`],
});

// Standalone DataSource for the TypeORM CLI (migration:generate / migration:run).
// The Nest application builds its own options from ConfigService in
// DatabaseModule and uses autoLoadEntities instead of these globs.
export const AppDataSource = new DataSource(buildDataSourceOptions());

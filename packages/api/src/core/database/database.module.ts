import { Global, Module } from '@nestjs/common';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';

import { ConfigService } from '../config/config.service';

// Owns the database connection. Entities register themselves via
// TypeOrmModule.forFeature in their own modules (autoLoadEntities picks them up),
// so this module never imports a domain entity — keeping the two-bucket rule.
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST'),
        port: config.get('DATABASE_PORT'),
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        synchronize: config.get('DATABASE_SYNCHRONIZE'),
        logging: config.get('DATABASE_LOGGING'),
        ssl: config.get('DATABASE_SSL') ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
        migrationsRun: false,
      }),
    }),
  ],
})
export class DatabaseModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../config/database.config';

/**
 * Database Module
 * 
 * Configures TypeORM with PostgreSQL connection, including:
 * - Connection pooling for efficient resource management
 * - Retry logic for handling transient connection failures
 * - Environment-based configuration
 * 
 * Requirements: 10.1, 10.5
 */
@Module({
  imports: [
    ConfigModule.forFeature(databaseConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        
        return {
          ...dbConfig,
          // Retry connection on startup
          retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '5', 10),
          retryDelay: parseInt(process.env.DB_RETRY_DELAY || '3000', 10),
          autoLoadEntities: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}

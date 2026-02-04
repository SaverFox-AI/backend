import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export default registerAs(
  'database',
  (): DataSourceOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'saverfox',
    password: process.env.DB_PASSWORD || 'saverfox_password',
    database: process.env.DB_DATABASE || 'saverfox_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: false, // Always use migrations in production
    logging: process.env.NODE_ENV === 'development',
    
    // Connection pooling configuration
    extra: {
      // Maximum number of clients in the pool
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      // Minimum number of clients in the pool
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      // Maximum time (ms) a client can be idle before being closed
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      // Maximum time (ms) to wait for a connection from the pool
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
      // Number of times to retry connecting
      max_retries: parseInt(process.env.DB_MAX_RETRIES || '3', 10),
    },
    
    // Retry logic configuration
    maxQueryExecutionTime: parseInt(process.env.DB_MAX_QUERY_TIME || '5000', 10),
  }),
);

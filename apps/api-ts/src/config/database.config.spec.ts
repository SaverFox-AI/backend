import databaseConfig from './database.config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

describe('Database Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return default configuration when no environment variables are set', () => {
    const config = databaseConfig() as PostgresConnectionOptions;
    
    expect(config.type).toBe('postgres');
    expect(config.host).toBe('localhost');
    expect(config.port).toBe(5432);
    expect(config.username).toBe('saverfox');
    expect(config.database).toBe('saverfox_db');
    expect(config.synchronize).toBe(false);
  });

  it('should use environment variables when provided', () => {
    process.env.DB_HOST = 'testhost';
    process.env.DB_PORT = '5433';
    process.env.DB_USERNAME = 'testuser';
    process.env.DB_PASSWORD = 'testpass';
    process.env.DB_DATABASE = 'testdb';
    
    const config = databaseConfig() as PostgresConnectionOptions;
    
    expect(config.host).toBe('testhost');
    expect(config.port).toBe(5433);
    expect(config.username).toBe('testuser');
    expect(config.password).toBe('testpass');
    expect(config.database).toBe('testdb');
  });

  it('should configure connection pooling with default values', () => {
    const config = databaseConfig();
    
    expect(config.extra).toBeDefined();
    expect(config.extra.max).toBe(10);
    expect(config.extra.min).toBe(2);
    expect(config.extra.idleTimeoutMillis).toBe(30000);
    expect(config.extra.connectionTimeoutMillis).toBe(2000);
    expect(config.extra.max_retries).toBe(3);
  });

  it('should configure connection pooling with custom values', () => {
    process.env.DB_POOL_MAX = '20';
    process.env.DB_POOL_MIN = '5';
    process.env.DB_IDLE_TIMEOUT = '60000';
    process.env.DB_CONNECTION_TIMEOUT = '5000';
    process.env.DB_MAX_RETRIES = '5';
    
    const config = databaseConfig();
    
    expect(config.extra.max).toBe(20);
    expect(config.extra.min).toBe(5);
    expect(config.extra.idleTimeoutMillis).toBe(60000);
    expect(config.extra.connectionTimeoutMillis).toBe(5000);
    expect(config.extra.max_retries).toBe(5);
  });

  it('should configure retry logic with default values', () => {
    const config = databaseConfig();
    
    expect(config.maxQueryExecutionTime).toBe(5000);
  });

  it('should configure retry logic with custom values', () => {
    process.env.DB_MAX_QUERY_TIME = '10000';
    
    const config = databaseConfig();
    
    expect(config.maxQueryExecutionTime).toBe(10000);
  });

  it('should enable logging in development mode', () => {
    process.env.NODE_ENV = 'development';
    
    const config = databaseConfig();
    
    expect(config.logging).toBe(true);
  });

  it('should disable logging in production mode', () => {
    process.env.NODE_ENV = 'production';
    
    const config = databaseConfig();
    
    expect(config.logging).toBe(false);
  });

  it('should always disable synchronize for safety', () => {
    const config = databaseConfig();
    
    // synchronize should always be false to prevent accidental schema changes
    expect(config.synchronize).toBe(false);
  });
});

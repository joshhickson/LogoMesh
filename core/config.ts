import dotenv from 'dotenv';
import path from 'path';

export interface Config {
  NODE_ENV: string;
  PORT: number;
  API_BASE_PATH: string;
  DATABASE_URL: string;
  DB_PATH: string;
  JWT_SECRET: string;
  PLUGIN_DIR: string;
  LOG_LEVEL: string;
  DEFAULT_LLM_EXECUTOR: string;
  ULS_DIMENSION: number;
  REACT_APP_API_URL: string;
}

export function createConfig(): Config {
  // Load environment variables from .env file
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });

  const config: Config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
    API_BASE_PATH: process.env.API_BASE_PATH || '/api/v1',
    DATABASE_URL: process.env.DATABASE_URL || '',
    DB_PATH: process.env.DB_PATH || './data/logomesh.sqlite3',
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-and-long-random-string-that-is-at-least-32-characters',
    PLUGIN_DIR: process.env.PLUGIN_DIR || './plugins',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    DEFAULT_LLM_EXECUTOR: process.env.DEFAULT_LLM_EXECUTOR || 'MockLLMExecutor',
    ULS_DIMENSION: process.env.ULS_DIMENSION ? parseInt(process.env.ULS_DIMENSION, 10) : 768,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1',
  };

  // Validate essential configuration
  if (config.NODE_ENV !== 'test' && (!config.JWT_SECRET || config.JWT_SECRET === 'your-super-secret-and-long-random-string-that-is-at-least-32-characters')) {
    console.warn(
      'WARNING: JWT_SECRET is not set or is using the default insecure value. Please set a strong, random secret in your .env file for production.'
    );
  }

  if (!config.DATABASE_URL && !config.DB_PATH) {
      throw new Error('Database configuration is missing. Please set either DATABASE_URL or DB_PATH in your .env file.');
  }

  return Object.freeze(config);
}

// Export a default config instance for convenience in the main app
const config = createConfig();
export default config;

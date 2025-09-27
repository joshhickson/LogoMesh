import path from 'path';
import { secretsService } from './services/secretsService';

// Define the shape of the application's configuration
interface AppConfig {
  nodeEnv: string;
  server: {
    port: number;
    apiBasePath: string;
  };
  database: {
    path: string;
    url?: string;
  };
  plugins: {
    directory: string;
  };
  logging: {
    level: 'info' | 'debug' | 'warn' | 'error';
  };
  llm: {
    defaultExecutor: string;
    ollamaDefaultModel: string;
  };
  vtc: {
    ulsDimension: number;
  };
  frontend: {
    apiUrl: string;
    databaseUrl?: string;
  };
  jwt: {
    secret: string;
  };
}

// Read and parse environment variables with defaults using the secretsService
const config: AppConfig = {
  nodeEnv: secretsService.get('NODE_ENV') || 'development',
  server: {
    port: parseInt(secretsService.get('PORT') || '3001', 10),
    apiBasePath: secretsService.get('API_BASE_PATH') || '/api/v1',
  },
  database: {
    path: secretsService.get('DB_PATH') || path.join(__dirname, '..', '..', 'data', 'logomesh.sqlite3'),
    ...(secretsService.get('DATABASE_URL') && { url: secretsService.get('DATABASE_URL') }),
  },
  plugins: {
    directory: secretsService.get('PLUGIN_DIR') || './plugins',
  },
  logging: {
    level: (secretsService.get('LOG_LEVEL') as 'info' | 'debug' | 'warn' | 'error') || 'info',
  },
  llm: {
    defaultExecutor: secretsService.get('DEFAULT_LLM_EXECUTOR') || 'MockLLMExecutor',
    ollamaDefaultModel: secretsService.get('OLLAMA_DEFAULT_MODEL') || 'llama2',
  },
  vtc: {
    ulsDimension: parseInt(secretsService.get('ULS_DIMENSION') || '768', 10),
  },
  frontend: {
    apiUrl: secretsService.get('REACT_APP_API_URL') || 'http://localhost:3001/api/v1',
    ...(secretsService.get('REACT_APP_DATABASE_URL') && { databaseUrl: secretsService.get('REACT_APP_DATABASE_URL') }),
  },
  jwt: {
    secret: secretsService.get('JWT_SECRET', true) || 'changeme',
  },
};

export default config;

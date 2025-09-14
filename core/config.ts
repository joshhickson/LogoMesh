import path from 'path';

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
}

// Read and parse environment variables with defaults
const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    apiBasePath: process.env.API_BASE_PATH || '/api/v1',
  },
  database: {
    path: process.env.DB_PATH || path.join(__dirname, '..', '..', '..', 'data', 'logomesh.sqlite3'),
    ...(process.env.DATABASE_URL && { url: process.env.DATABASE_URL }),
  },
  plugins: {
    directory: process.env.PLUGIN_DIR || './plugins',
  },
  logging: {
    level: (process.env.LOG_LEVEL as 'info' | 'debug' | 'warn' | 'error') || 'info',
  },
  llm: {
    defaultExecutor: process.env.DEFAULT_LLM_EXECUTOR || 'MockLLMExecutor',
    ollamaDefaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'llama2',
  },
  vtc: {
    ulsDimension: parseInt(process.env.ULS_DIMENSION || '768', 10),
  },
  frontend: {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1',
    ...(process.env.REACT_APP_DATABASE_URL && { databaseUrl: process.env.REACT_APP_DATABASE_URL }),
  },
};

export default config;

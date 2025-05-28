
import express from 'express';
import cors from 'cors';
import path from 'path';
import { initializeDatabase } from '../../core/db/initDb';

// Import logger from core utilities - using relative path since we're in server context
const loggerPath = path.resolve(__dirname, '../../src/core/utils/logger');
let logger: any;

try {
  logger = require(loggerPath);
} catch (error) {
  // Fallback console logging if core logger is not available
  logger = {
    info: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.log
  };
}

// Import LLM routes
import llmRoutes from './routes/llmRoutes';

const app = express();
const PORT = process.env.PORT || 3001;
const API_BASE_PATH = process.env.API_BASE_PATH || '/api/v1';
const DB_PATH = process.env.DB_PATH || './data/logomesh.sqlite3';
const PLUGIN_DIR = process.env.PLUGIN_DIR || './plugins';

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get(`${API_BASE_PATH}/health`, (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount LLM routes
app.use(API_BASE_PATH, llmRoutes);

// Bootstrap function
async function bootstrap() {
  try {
    // Bootstrap logging
    logger.info('=== LogoMesh Backend Server Starting ===');
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Port: ${PORT}`);
    logger.info(`API Base Path: ${API_BASE_PATH}`);
    logger.info(`DB Path: ${DB_PATH}`);
    logger.info(`Plugin Directory: ${PLUGIN_DIR}`);

    // Initialize database
    logger.info('Initializing database...');
    await initializeDatabase();
    logger.info('Database initialization complete');

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on http://0.0.0.0:${PORT}`);
      logger.info(`Health check available at: http://0.0.0.0:${PORT}${API_BASE_PATH}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
bootstrap();

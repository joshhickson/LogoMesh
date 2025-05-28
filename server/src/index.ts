
import express from 'express';
import cors from 'cors';
import path from 'path';

// Import logger and database initialization from core
import { logger } from '../../core/utils/logger';
import { initializeDatabase } from '../../core/db/initDb';

// Import routes
import llmRoutes from './routes/llmRoutes';

const app = express();
const PORT = process.env.PORT || 3001;
const API_BASE_PATH = process.env.API_BASE_PATH || '/api/v1';

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get(`${API_BASE_PATH}/health`, (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
app.use(`${API_BASE_PATH}/llm`, llmRoutes);

// Bootstrap logging
function logBootstrapInfo() {
  const environment = process.env.NODE_ENV || 'development';
  const dbPath = process.env.DB_PATH || './data/logomesh.sqlite3';
  const pluginDir = process.env.PLUGIN_DIR || './plugins';
  
  logger.log(`[BOOTSTRAP] Environment: ${environment}`);
  logger.log(`[BOOTSTRAP] Server starting on port: ${PORT}`);
  logger.log(`[BOOTSTRAP] API Base Path: ${API_BASE_PATH}`);
  logger.log(`[BOOTSTRAP] Database Path: ${dbPath}`);
  logger.log(`[BOOTSTRAP] Plugin Directory: ${pluginDir}`);
}

// Async startup function
async function startServer() {
  try {
    // Initialize database before starting server
    await initializeDatabase();
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      logBootstrapInfo();
      logger.log(`[SERVER] Express server listening on http://0.0.0.0:${PORT}`);
      logger.log(`[SERVER] Health check available at: http://0.0.0.0:${PORT}${API_BASE_PATH}/health`);
    });
  } catch (error) {
    logger.error(`[SERVER] Failed to start server: ${error}`);
    process.exit(1);
  }
}

// Start the server
startServer();

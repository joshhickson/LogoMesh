The code mounts the LLM routes in the server.
```

```replit_final_file
import express from 'express';
import cors from 'cors';
import path from 'path';
import { initializeDatabase } from '../../core/db/initDb';
import { logger } from '../../src/core/utils/logger';
import { SQLiteStorageAdapter } from '../../core/storage/sqliteAdapter';
import { IdeaManager } from '../../src/core/IdeaManager';
import { PortabilityService } from '../../core/services/portabilityService';
import { LLMTaskRunner } from '../../core/llm/LLMTaskRunner';
import { OllamaExecutor } from '../../core/llm/OllamaExecutor';
import thoughtRoutes from './routes/thoughtRoutes';
import portabilityRoutes from './routes/portabilityRoutes';
import llmRoutes from './routes/llmRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Core Services Setup
async function setupServices() {
  // Database path
  const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../data/logomesh.sqlite3');
  logger.info(`Using database path: ${dbPath}`);

  // Initialize storage adapter
  const storageAdapter = new SQLiteStorageAdapter(dbPath);

  // Initialize core services
  const ideaManager = new IdeaManager(storageAdapter);
  const portabilityService = new PortabilityService(storageAdapter);
  const llmExecutor = new OllamaExecutor();
  const llmTaskRunner = new LLMTaskRunner(llmExecutor);

  // Make services available to routes via app.locals
  app.locals.ideaManager = ideaManager;
  app.locals.portabilityService = portabilityService;
  app.locals.llmTaskRunner = llmTaskRunner;
  app.locals.storageAdapter = storageAdapter;

  logger.info('Core services initialized successfully');

  return { ideaManager, portabilityService, llmTaskRunner, storageAdapter };
}

// Mount routes
app.use('/api/v1/thoughts', thoughtRoutes);
app.use('/api/v1', portabilityRoutes);
app.use('/api/v1/llm', llmRoutes);
app.use('/api/v1/export', portabilityRoutes);
app.use('/api/v1/import', portabilityRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: !!app.locals.storageAdapter,
      ideaManager: !!app.locals.ideaManager,
      llmTaskRunner: !!app.locals.llmTaskRunner
    }
  });
});

async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();
    logger.info('Database initialized successfully');

    // Setup core services
    await setupServices();

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Health check available at http://localhost:${PORT}/api/v1/health`);
      logger.info(`API base URL: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
import express from 'express';
import cors from 'cors';
import { initializeDatabase } from '../../core/db/initDb';
import { SQLiteStorageAdapter } from '../../core/storage/sqliteAdapter';
import { IdeaManager } from '../../src/core/IdeaManager';
import { logger } from '../../src/core/utils/logger';
import llmRoutes from './routes/llmRoutes';
import thoughtRoutes from './routes/thoughtRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize core services
const dbPath = process.env.DB_PATH || './server/data/logomesh.sqlite3';

// Initialize database and services
async function initializeServer() {
  try {
    await initializeDatabase();
    logger.info('Database initialized successfully');

    const sqliteAdapter = new SQLiteStorageAdapter(dbPath);
    await sqliteAdapter.initialize();
    logger.info('Storage adapter initialized');

    const ideaManager = new IdeaManager(sqliteAdapter);
    return { ideaManager, sqliteAdapter };
  } catch (error) {
    logger.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

// Initialize services (will be awaited before starting server)
const services = initializeServer();

// Routes
app.use('/api/v1/llm', llmRoutes);
app.use('/api/v1/thoughts', thoughtRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'ThoughtWeb API Server', version: '1.0.0' });
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// Start server after initialization
services.then(({ ideaManager }) => {
  // Make services available to routes
  app.locals.ideaManager = ideaManager;
  app.locals.logger = logger;

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Database path: ${dbPath}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Plugin directory: ${process.env.PLUGIN_DIR || 'N/A'}`);
  });
}).catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
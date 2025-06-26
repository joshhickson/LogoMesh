import express from 'express';
import cors from 'cors';
import path from 'path';
import * as fs from 'fs';

// For now, let's create a simplified version that doesn't depend on core modules
const logger = {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  debug: (...args: any[]) => console.debug('[DEBUG]', ...args),
};
import thoughtRoutes from './routes/thoughtRoutes';
import llmRoutes from './routes/llmRoutes';
import orchestratorRoutes from './routes/orchestratorRoutes';
import portabilityRoutes from './routes/portabilityRoutes';
import adminRoutes from './routes/adminRoutes';
import taskRoutes, { initializeTaskEngine } from './routes/taskRoutes';
import { EventBus } from '../../core/services/eventBus';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10); // Ensure PORT is a number
const apiBasePath = '/api/v1'; // Define the base path

// Middleware
app.use(cors());
app.use(express.json());

// User authentication middleware
app.use((req, res, next) => {
  // Extract Replit user info from headers
  const userId = req.headers['x-replit-user-id'] as string;
  const userName = req.headers['x-replit-user-name'] as string;
  const userRoles = req.headers['x-replit-user-roles'] as string;

  // Add user info to request for authenticated routes
  req.user = {
    id: userId || 'anonymous',
    name: userName || 'Anonymous User',
    roles: userRoles || '',
    isAuthenticated: !!userId
  };

  next();
});

// Core Services Setup (simplified for now)
async function setupServices() {
  // For now, just setup basic services
  logger.info('Basic services initialized successfully');
  return {};
}

// Initialize TaskEngine with EventBus
const eventBus = new EventBus();
initializeTaskEngine(eventBus);

// Mount routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/thoughts', thoughtRoutes);
app.use('/api/v1/llm', llmRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/portability', portabilityRoutes);
app.use('/api/v1/orchestrator', orchestratorRoutes);
app.use('/api/v1/tasks', taskRoutes);

// Health check
app.get(`${apiBasePath}/health`, (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '0.1.0'
  });
});

async function startServer() {
  try {
    // Setup core services
    await setupServices();

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Health check available at http://localhost:${PORT}${apiBasePath}/health`);
      logger.info(`API base URL: http://localhost:${PORT}${apiBasePath}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
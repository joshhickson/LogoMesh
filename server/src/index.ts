import express from 'express';
import cors from 'cors';
// import path from 'path'; // Removed unused
// import * as fs from 'fs'; // Removed unused

import { logger } from '../../core/utils/logger'; // Use core logger

import thoughtRoutes from './routes/thoughtRoutes';
import llmRoutes from './routes/llmRoutes';
import orchestratorRoutes from './routes/orchestratorRoutes';
import portabilityRoutes from './routes/portabilityRoutes';
import adminRoutes from './routes/adminRoutes';
import taskRoutes, { initializeTaskEngine } from './routes/taskRoutes';
import { EventBus } from '../../core/services/eventBus';
import userRoutes from './routes/userRoutes';
import type { Request, Response, NextFunction, Router, RequestHandler } from 'express'; // Import Router and RequestHandler

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const apiBasePath = '/api/v1'; // Define the base path

// Middleware
app.use(cors());
app.use(express.json());

// User authentication middleware
// AuthenticatedRequest definition is now global via express.d.ts
app.use((req: Request, _res: Response, next: NextFunction) => { // res -> _res
  // Extract Replit user info from headers
  // Note: req.user will be typed by express.d.ts augmentation
  const replitUserId = req.headers['x-replit-user-id'] as string;
  const replitUserName = req.headers['x-replit-user-name'] as string;
  const replitUserRoles = req.headers['x-replit-user-roles'] as string; // Renamed to avoid conflict

  // Add user info to request for authenticated routes
  // Ensure this matches AuthUserForRequest structure
  req.user = {
    id: replitUserId || 'anonymous',
    name: replitUserName || 'Anonymous User',
    roles: replitUserRoles || '', // Assign as string
    isAuthenticated: !!replitUserId
  };

  next();
});

// Core Services Setup (simplified for now) - This function is unused.
// async function setupServices() {
//   // For now, just setup basic services
//   logger.info('Basic services initialized successfully');
//   return {};
// }

import { PostgresAdapter } from './db/postgresAdapter';
import { IdeaManager } from '../../core/IdeaManager';
import { PortabilityService } from '../../core/services/portabilityService';
import { MeshGraphEngine } from '../../core/services/meshGraphEngine';
import { OllamaEmbeddingProvider } from '../../core/embeddings/OllamaEmbeddingProvider';

// Initialize TaskEngine with EventBus
const eventBus = new EventBus(); // Keep eventBus global for now if taskEngine init is outside startServer
// initializeTaskEngine(eventBus); // Moved to startServer

// Mount routes before service init, services will be attached to app.locals in startServer
// This means routes should be robust to services not being immediately available if hit too early,
// or server should only start listening after services are ready.
app.use('/api/v1/user', userRoutes as Router);
app.use('/api/v1/thoughts', thoughtRoutes as Router);
app.use('/api/v1/llm', llmRoutes as Router);
app.use('/api/v1/admin', adminRoutes as Router);
app.use('/api/v1/portability', portabilityRoutes as Router);
app.use('/api/v1/orchestrator', orchestratorRoutes as Router);
app.use('/api/v1/tasks', taskRoutes as Router);

// Import security middleware
import { createApiRateLimiter, createAuthRateLimiter } from '../../core/middleware/rateLimiter';

// Setup rate limiters
const apiRateLimit = createApiRateLimiter();
const authRateLimit = createAuthRateLimiter();

// Apply rate limiting
app.use('/api/v1', apiRateLimit.middleware() as RequestHandler);
app.use('/api/v1/auth', authRateLimit.middleware() as RequestHandler);


// Health check
app.get(`${apiBasePath}/health`, (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '0.2.0'
  });
});

// Comprehensive status endpoint
app.get(`${apiBasePath}/status`, (req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  try {
    // Check database connection
    // const dbStatus = await storageAdapter.healthCheck();
    
    // Check EventBus status
    const eventBusStats = eventBus.getRegisteredEvents();
    
    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      system: {
        uptime: Math.floor(uptime),
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024)
        },
        cpu: process.cpuUsage()
      },
      services: {
        database: 'connected', // TODO: Implement actual health check
        eventBus: {
          status: 'active',
          registeredEvents: eventBusStats.length
        },
        plugins: {
          status: 'ready',
          loaded: 0 // TODO: Get from PluginHost
        }
      },
      metrics: {
        queueLag: 0, // TODO: Implement from TaskEngine
        activeConnections: 0 // TODO: Track active connections
      }
    });
  } catch (error) {
    logger.error('Status check failed:', error);
    res.status(503).json({
      status: 'degraded',
      error: 'Service health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

async function startServer() {
  try {
    // Initialize Storage Adapter
    const storageAdapter = new PostgresAdapter();
    await storageAdapter.initialize();
    logger.info('Storage adapter initialized successfully.');

    // Initialize Embedding Provider
    const embeddingProvider = new OllamaEmbeddingProvider('nomic-embed-text');
    logger.info('Embedding provider initialized.');

    // Initialize MeshGraphEngine with dependencies
    const meshGraphEngine = new MeshGraphEngine(storageAdapter, embeddingProvider);
    app.locals.meshGraphEngine = meshGraphEngine;
    logger.info('MeshGraphEngine initialized and attached to app.locals.');

    // Initialize IdeaManager with the initialized adapter
    const ideaManager = new IdeaManager(storageAdapter);
    app.locals.ideaManager = ideaManager;
    logger.info('IdeaManager initialized and attached to app.locals.');

    // Initialize PortabilityService
    const portabilityService = new PortabilityService(storageAdapter);
    app.locals.portabilityService = portabilityService;
    logger.info('PortabilityService initialized and attached to app.locals.');

    // Initialize TaskEngine
    initializeTaskEngine(eventBus);
    app.locals.eventBus = eventBus;

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
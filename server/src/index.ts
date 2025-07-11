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
import { Request, Response, NextFunction, Router } from 'express'; // Import Router

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

import { PostgresAdapter } from './db/postgresAdapter'; // Import adapter
import { IdeaManager } from '../../core/IdeaManager'; // Import IdeaManager
import { PortabilityService } from '../../core/services/portabilityService'; // Import PortabilityService

// Initialize TaskEngine with EventBus
const eventBus = new EventBus(); // Keep eventBus global for now if taskEngine init is outside startServer
// initializeTaskEngine(eventBus); // Moved to startServer

// Mount routes before service init, services will be attached to app.locals in startServer
// This means routes should be robust to services not being immediately available if hit too early,
// or server should only start listening after services are ready.
// @ts-ignore TS2769: Express router type compatibility issue with app.use
app.use('/api/v1/user', userRoutes);
// @ts-ignore TS2769: Express router type compatibility issue with app.use
app.use('/api/v1/thoughts', thoughtRoutes);
// @ts-ignore TS2769: Express router type compatibility issue with app.use
app.use('/api/v1/llm', llmRoutes);
// @ts-ignore TS2769: Express router type compatibility issue with app.use
app.use('/api/v1/admin', adminRoutes);
// @ts-ignore TS2769: Express router type compatibility issue with app.use
app.use('/api/v1/portability', portabilityRoutes);
// @ts-ignore TS2769: Express router type compatibility issue with app.use
app.use('/api/v1/orchestrator', orchestratorRoutes);
// @ts-ignore TS2769: Express router type compatibility issue with app.use
app.use('/api/v1/tasks', taskRoutes);

// Import security middleware
import { createApiRateLimiter, createAuthRateLimiter } from '../../core/middleware/rateLimiter';
import { AuthService } from '../../core/services/authService';

// Setup rate limiters
const apiRateLimit = createApiRateLimiter();
const authRateLimit = createAuthRateLimiter();

// Apply rate limiting
// @ts-ignore TS2769: Express middleware type compatibility issue
app.use('/api/v1', apiRateLimit.middleware());
// @ts-ignore TS2769: Express middleware type compatibility issue
app.use('/api/v1/auth', authRateLimit.middleware());

// Setup authentication service
const _authService = new AuthService({ // Prefixed with _
  jwtSecret: process.env.JWT_SECRET || 'changeme-in-production',
  jwtExpiration: '24h'
});

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
    await storageAdapter.initialize(); // Initialize the database connection and schema
    logger.info('Storage adapter initialized successfully.');

    // Initialize IdeaManager with the initialized adapter
    const ideaManager = new IdeaManager(storageAdapter);
    app.locals.ideaManager = ideaManager;
    logger.info('IdeaManager initialized and attached to app.locals.');

    // Initialize PortabilityService
    const portabilityService = new PortabilityService(storageAdapter); // Assuming it takes a StorageAdapter
    app.locals.portabilityService = portabilityService;
    logger.info('PortabilityService initialized and attached to app.locals.');

    // Initialize TaskEngine (if its init is async or depends on other async services)
    // For now, assuming initializeTaskEngine is synchronous or self-contained for its dependencies
    initializeTaskEngine(eventBus);
    app.locals.eventBus = eventBus; // Make EventBus available if needed by routes directly

    // Old setupServices can be removed or integrated if it did more
    // await setupServices();

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
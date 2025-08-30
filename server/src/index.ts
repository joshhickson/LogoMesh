import express from 'express';
import cors from 'cors';
import { createConfig, Config } from '../../core/config';

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
// All route setup and middleware attachment that doesn't depend on async services
// can be done here, outside the main setup/start functions.
// This makes the app object more configurable before it starts listening.
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
app.use('/api/v1/user', userRoutes as Router);
app.use('/api/v1/thoughts', thoughtRoutes as Router);
app.use('/api/v1/llm', llmRoutes as Router);
app.use('/api/v1/admin', adminRoutes as Router);
app.use('/api/v1/portability', portabilityRoutes as Router);
app.use('/api/v1/orchestrator', orchestratorRoutes as Router);
app.use('/api/v1/tasks', taskRoutes as Router);

// Import security middleware
import { createApiRateLimiter, createAuthRateLimiter } from '../../core/middleware/rateLimiter';
import { AuthService } from '../../core/services/authService';

// Setup rate limiters
const apiRateLimit = createApiRateLimiter();
const authRateLimit = createAuthRateLimiter();

// Apply rate limiting
app.use('/api/v1', apiRateLimit.middleware() as RequestHandler);
app.use('/api/v1/auth', authRateLimit.middleware() as RequestHandler);

import { StorageAdapter } from '../../contracts/storageAdapter';

// This function sets up all the services and returns the configured app
export async function setupApp(config: Config, storageAdapter?: StorageAdapter) {
  const apiBasePath = config.API_BASE_PATH;

  // Setup authentication service
  const authService = new AuthService({
    jwtSecret: config.JWT_SECRET,
    jwtExpiration: '24h'
  });
  app.locals.authService = authService;

  // Health check
  app.get(`${apiBasePath}/health`, (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      version: '0.2.0'
    });
  });

  // Comprehensive status endpoint
  app.get(`${apiBasePath}/status`, (req: Request, res: Response) => {
    // ... (status endpoint implementation remains the same)
  });


  if (!storageAdapter) {
    storageAdapter = new PostgresAdapter({ databaseUrl: config.DATABASE_URL });
    await storageAdapter.initialize();
    logger.info('Storage adapter initialized successfully.');
  }

  const ideaManager = new IdeaManager(storageAdapter);
  app.locals.ideaManager = ideaManager;
  logger.info('IdeaManager initialized and attached to app.locals.');

  const portabilityService = new PortabilityService(storageAdapter);
  app.locals.portabilityService = portabilityService;
  logger.info('PortabilityService initialized and attached to app.locals.');

  initializeTaskEngine(eventBus);
  app.locals.eventBus = eventBus;

  return app;
}

async function startServer() {
  try {
    const config = createConfig();
    const configuredApp = await setupApp(config);
    configuredApp.listen(config.PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${config.PORT}`);
      logger.info(`Health check available at http://localhost:${config.PORT}${config.API_BASE_PATH}/health`);
      logger.info(`API base URL: http://localhost:${config.PORT}${config.API_BASE_PATH}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

export { app };
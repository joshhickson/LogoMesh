import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { logger } from '@core/utils/logger'; // Assuming this path alias works
import { SQLiteStorageAdapter } from '../../src/core/storage/sqliteAdapter'; // Relative path
import { IdeaManager } from '../../src/core/IdeaManager'; // Relative path
import { initializeDatabase } from '@core/db/initDb'; // Existing DB init, review if needed
import llmRoutes from './routes/llmRoutes'; // Import the LLM routes
import thoughtRoutes from './routes/thoughtRoutes'; // Import thought routes

// Load environment variables if using a library like dotenv,
// otherwise, ensure they are available in the execution environment.
// For example, if you have a .env file in the server/ directory:
// import dotenv from 'dotenv';
// dotenv.config({ path: './.env' }); // Specify path if .env is in server/

const app: Express = express();
const port = process.env.PORT || 3001;
const apiBasePath = process.env.API_BASE_PATH || '/api/v1';

// Instantiate services
// DB_PATH will be relative to where the server process is run.
// If running `node dist/index.js` from `server/` dir, './data/...' is `server/data/...`
const dbPath = process.env.DB_PATH || './data/logomesh.sqlite3'; 
const sqliteAdapter = new SQLiteStorageAdapter(dbPath);
const ideaManager = new IdeaManager(sqliteAdapter, logger); // Pass logger to IdeaManager

// Make services available to route handlers via app.locals
app.locals.ideaManager = ideaManager;
app.locals.logger = logger; // Make logger available directly if routes need it

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// Health check route
app.get(`${apiBasePath}/health`, (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    message: "Server is running smoothly."
  });
});

// Placeholder for other routes
// app.use(`${apiBasePath}/llm`, llmRoutes); // This line will be replaced by the actual mounting

// Mount LLM routes
app.use(`${apiBasePath}/llm`, llmRoutes);

// Mount Thought routes
app.use(`${apiBasePath}/thoughts`, thoughtRoutes);

// Basic error handling middleware (optional for now, can be expanded)
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
async function startServer() {
  logger.info('[Server Startup] Initializing LogoMesh Backend...');
  logger.info(`[Server Startup] Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`[Server Startup] Port: ${port}`);
  logger.info(`[Server Startup] Database Path: ${dbPath}`); // Use the resolved dbPath
  logger.info(`[Server Startup] Plugin Directory: ${process.env.PLUGIN_DIR || 'Default: ./plugins'}`);
  logger.info(`[Server Startup] Log Level: ${process.env.LOG_LEVEL || 'info'}`);

  try {
    // The SQLiteStorageAdapter's constructor already calls initializeSchema.
    // The existing initializeDatabase() might be for a different purpose or legacy.
    // For now, we'll keep it, but this might need review.
    // If it's for the same SQLite DB, ensure it's idempotent or remove if adapter handles all.
    logger.info('[Server Startup] Initializing database (legacy initDb)...');
    await initializeDatabase(); 
    logger.info('[Server Startup] Legacy database initialization complete.');
    
    // Note: SQLiteStorageAdapter already initializes its schema in its constructor.
    // No explicit call to ideaManager or sqliteAdapter to initialize schema is needed here.
    logger.info('[Server Startup] SQLiteStorageAdapter and IdeaManager instantiated.');
    logger.info('[Server Startup] Services (ideaManager, logger) are available via app.locals.');


    app.listen(port, () => {
      // console.log replaced by logger below, but we can keep one for direct console visibility if needed
      // console.log(`[Server]: LogoMesh backend server is running at http://localhost:${port}`);
      logger.info(`[Server]: LogoMesh backend server is running at http://localhost:${port}`);
      logger.info(`[Server]: API base path is ${apiBasePath}`);
      logger.info(`[Server]: Health check available at http://localhost:${port}${apiBasePath}/health`);
    });
  } catch (error) {
    logger.error('[Server Startup] Failed to initialize database or start server:', error);
    process.exit(1); // Exit if DB initialization fails
  }
}

startServer(); // Call the async function to start the server

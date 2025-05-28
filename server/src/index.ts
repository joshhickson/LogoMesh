import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { logger } from '@core/utils/logger';
import { initializeDatabase } from '@core/db/initDb';
import llmRoutes from './routes/llmRoutes'; // Import the LLM routes

// Load environment variables if using a library like dotenv,
// otherwise, ensure they are available in the execution environment.
// For example, if you have a .env file in the server/ directory:
// import dotenv from 'dotenv';
// dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;
const apiBasePath = process.env.API_BASE_PATH || '/api/v1';

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
// app.use(`${apiBasePath}/thoughts`, thoughtRoutes); 
// app.use(`${apiBasePath}/llm`, llmRoutes); // This line will be replaced by the actual mounting

// Mount LLM routes
app.use(`${apiBasePath}/llm`, llmRoutes);

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
  logger.info(`[Server Startup] Database Path: ${process.env.DB_PATH || 'Default: ./data/logomesh.sqlite3'}`);
  logger.info(`[Server Startup] Plugin Directory: ${process.env.PLUGIN_DIR || 'Default: ./plugins'}`);
  logger.info(`[Server Startup] Log Level: ${process.env.LOG_LEVEL || 'info'}`);

  try {
    logger.info('[Server Startup] Initializing database...');
    await initializeDatabase(); // Call before listening
    logger.info('[Server Startup] Database initialization complete.');

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

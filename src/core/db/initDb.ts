import sqlite3 from 'sqlite3';
import { promises as fsPromises } from 'fs';
import path from 'path';
// Adjust import if necessary - assuming logger is correctly aliased or relative path needed
// For server/src/index.ts, '@core/utils/logger' works due to tsconfig paths.
// For core/db/initDb.ts, a relative path might be more robust if not using tsconfig-paths for execution.
// However, if this code is compiled and run from `dist`, paths aliasing should work.
// Let's stick to the aliased path as it's common in TS projects.
import { logger } from '@core/utils/logger';

export async function initializeDatabase(): Promise<void> {
  // Default to project_root/logomesh.sqlite3 if DB_PATH is not set.
  // process.cwd() should give the root of the project where the server is started.
  const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'logomesh.sqlite3');
  const dbDir = path.dirname(dbPath);

  logger.info(`[DB Init] Target database path: ${dbPath}`);

  try {
    logger.info(`[DB Init] Ensuring directory exists: ${dbDir}`);
    await fsPromises.mkdir(dbDir, { recursive: true });
    logger.info(`[DB Init] Directory ensured: ${dbDir}`);

    // sqlite3.Database constructor callback is for post-open actions or errors.
    // The actual connection opening is synchronous for basic cases or uses a Promise if wrapped.
    // For simplicity, we'll handle connection errors in the callback.
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('[DB Init] Error encountered while connecting to SQLite database:', err.message);
        // This error will be for the db instance creation,
        // The actual promise rejection for initializeDatabase should happen in the main try/catch.
        // To make this error propagate to the main catch, we would need to wrap db creation in a Promise.
        // For now, this log is crucial. The function will likely fail later if connection is bad.
      } else {
        logger.info('[DB Init] Successfully connected to SQLite database.');
      }
    });

    // Define schemaPath relative to project root.
    // __dirname would point to core/db if this file is run directly, or dist/core/db after compilation.
    // Using process.cwd() assumes the script is run from the project root.
    const schemaPath = path.resolve(process.cwd(), 'src', 'core', 'db', 'schema.sql');
    logger.info(`[DB Init] Attempting to read schema from: ${schemaPath}`);
    
    const schema = await fsPromises.readFile(schemaPath, 'utf-8');
    logger.info('[DB Init] Schema file read successfully.');
    
    // db.exec executes all SQL statements in the string.
    // Ensure schema.sql uses "CREATE TABLE IF NOT EXISTS" for idempotency.
    await new Promise<void>((resolve, reject) => {
      db.exec(schema, (err) => {
        if (err) {
          logger.error('[DB Init] Error executing schema SQL:', err.message);
          reject(err);
        } else {
          logger.info('[DB Init] Database schema applied successfully.');
          resolve();
        }
      });
    });

    // Close the database connection.
    await new Promise<void>((resolve, reject) => {
      db.close((err) => {
        if (err) {
          logger.error('[DB Init] Error closing the database connection:', err.message);
          reject(err);
        } else {
          logger.info('[DB Init] Database connection closed successfully.');
          resolve();
        }
      });
    });

    logger.info(`[DB Init] Database initialization process completed for ${dbPath}.`);

  } catch (error: any) { // Specify 'any' or 'unknown' for error type
    logger.error('[DB Init] Critical error during database initialization:', error.message || error);
    // Re-throw the error to be caught by the server startup sequence
    throw error;
  }
}

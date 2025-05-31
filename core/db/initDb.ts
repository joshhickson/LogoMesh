
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

// Import logger - try multiple paths to handle different execution contexts
let logger: any;
try {
  // Try from server context
  logger = require('../../src/core/utils/logger').logger;
} catch {
  try {
    // Try from core context  
    logger = require('../utils/logger').logger;
  } catch {
    try {
      // Try direct path from server
      logger = require('../../core/utils/logger').logger;
    } catch {
      // Fallback console logging
      logger = {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.log,
        log: console.log
      };
    }
  }
}

export async function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Determine database path based on environment
      const defaultPath = process.cwd().includes('/server') ? 
        './data/logomesh.sqlite3' : 
        './server/data/logomesh.sqlite3';
      const dbPath = process.env.DB_PATH || path.resolve(defaultPath);
      
      // Ensure data directory exists
      const dataDir = path.dirname(dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        logger.info(`Created data directory: ${dataDir}`);
      }

      logger.info(`Connecting to database at: ${dbPath}`);

      // Connect to SQLite database
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          logger.error('Error opening database:', err);
          reject(err);
          return;
        }
        logger.info('Connected to SQLite database');
      });

      // Read schema file
      const schemaPath = path.resolve(__dirname, 'schema.sql');
      if (!fs.existsSync(schemaPath)) {
        const error = new Error(`Schema file not found at: ${schemaPath}`);
        logger.error(error.message);
        reject(error);
        return;
      }

      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      logger.info('Loaded database schema');

      // Execute schema creation
      db.exec(schemaSQL, (err) => {
        if (err) {
          logger.error('Error creating database schema:', err);
          db.close();
          reject(err);
          return;
        }

        logger.info('Database schema created successfully');

        // Close database connection
        db.close((err) => {
          if (err) {
            logger.error('Error closing database:', err);
            reject(err);
            return;
          }
          logger.info('Database initialization complete');
          resolve();
        });
      });

    } catch (error) {
      logger.error('Unexpected error during database initialization:', error);
      reject(error);
    }
  });
}

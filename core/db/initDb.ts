import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';

/**
 * Initialize the SQLite database with the required schema
 */
export async function initializeDatabase(dbPath = './server/data/logomesh.sqlite3'): Promise<void> {
  // Ensure the directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    logger.info(`Created database directory: ${dbDir}`);
  }

  return new Promise((resolve, reject) => {
    try {
      logger.info(`Connecting to database at: ${dbPath}`);

      // Connect to SQLite database
      const db = new sqlite3.Database(dbPath, (err: any) => { // Added : any
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
      db.exec(schemaSQL, (err: any) => { // Added : any
        if (err) {
          logger.error('Error creating database schema:', err);
          db.close();
          reject(err);
          return;
        }

        logger.info('Database schema created successfully');

        // Close database connection
        db.close((err: any) => { // Added : any
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
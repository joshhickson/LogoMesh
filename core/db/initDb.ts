
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export async function initializeDatabase(): Promise<void> {
  const dbPath = process.env.DB_PATH || './data/logomesh.sqlite3';
  
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    logger.log(`[DB] Created data directory: ${dataDir}`);
  }

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error(`[DB] Failed to connect to database: ${err.message}`);
        reject(err);
        return;
      }
      
      logger.log(`[DB] Connected to SQLite database at: ${dbPath}`);
      
      // Read and execute schema
      const schemaPath = path.join(__dirname, 'schema.sql');
      
      if (!fs.existsSync(schemaPath)) {
        const error = new Error(`Schema file not found at: ${schemaPath}`);
        logger.error(`[DB] ${error.message}`);
        reject(error);
        return;
      }
      
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      db.exec(schema, (err) => {
        if (err) {
          logger.error(`[DB] Failed to execute schema: ${err.message}`);
          reject(err);
          return;
        }
        
        logger.log('[DB] Database schema initialized successfully');
        
        db.close((err) => {
          if (err) {
            logger.error(`[DB] Error closing database: ${err.message}`);
            reject(err);
            return;
          }
          
          logger.log('[DB] Database connection closed');
          resolve();
        });
      });
    });
  });
}

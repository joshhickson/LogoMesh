import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';

/**
 * =============================================================================
 * DATABASE INITIALIZATION FOR LOGOMESH
 * =============================================================================
 * This file handles the initial setup of the database schema.
 *
 * ARCHITECTURE OVERVIEW:
 * LogoMesh uses a hybrid "polyglot persistence" architecture to handle
 * diverse data types and query needs efficiently. The full stack includes:
 *
 * 1.  **PostgreSQL (with pgvector):** The primary relational database for core
 *     data like thoughts, segments, and users. The pgvector extension enables
 *     efficient storage and querying of vector embeddings for semantic search.
 *
 * 2.  **Elasticsearch:** A powerful search engine used for full-text search
 *     across the entire corpus of thoughts and documents.
 *
 * 3.  **Neo4j:** A native graph database used to store and query the
 *     Knowledge Graph, modeling relationships between entities like people,
 *     places, and concepts.
 *
 * 4.  **SQLite:** A file-based database used for simple, local-only, or
 *     development setups where the full stack is not required. The logic
 *     below currently initializes a SQLite database.
 * =============================================================================
 */


/**
 * Initialize the SQLite database with the required schema
 */
export async function initializeDatabase(dbPath = './server/data/logomesh.sqlite3'): Promise<void> {
  // TODO: Add connection and initialization logic for PostgreSQL, Elasticsearch, and Neo4j.
  // This function will be expanded to a "connectToDataServices" function that
  // establishes connections to all components of the hybrid architecture.
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
      const db = new sqlite3.Database(dbPath, (err: Error | null) => { // any -> Error | null
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
      db.exec(schemaSQL, (err: Error | null) => { // any -> Error | null
        if (err) {
          logger.error('Error creating database schema:', err);
          db.close();
          reject(err);
          return;
        }

        logger.info('Database schema created successfully');

        // Close database connection
        db.close((err: Error | null) => { // any -> Error | null
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
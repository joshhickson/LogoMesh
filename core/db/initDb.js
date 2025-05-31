"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Import logger - try multiple paths to handle different execution contexts
let logger;
try {
    // Try from server context
    logger = require('../../src/core/utils/logger').logger;
}
catch {
    try {
        // Try from core context  
        logger = require('../utils/logger').logger;
    }
    catch {
        try {
            // Try direct path from server
            logger = require('../../core/utils/logger').logger;
        }
        catch {
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
async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        try {
            // Determine database path based on environment
            const defaultPath = process.cwd().includes('/server') ?
                './data/logomesh.sqlite3' :
                './server/data/logomesh.sqlite3';
            const dbPath = process.env.DB_PATH || path_1.default.resolve(defaultPath);
            // Ensure data directory exists
            const dataDir = path_1.default.dirname(dbPath);
            if (!fs_1.default.existsSync(dataDir)) {
                fs_1.default.mkdirSync(dataDir, { recursive: true });
                logger.info(`Created data directory: ${dataDir}`);
            }
            logger.info(`Connecting to database at: ${dbPath}`);
            // Connect to SQLite database
            const db = new sqlite3_1.default.Database(dbPath, (err) => {
                if (err) {
                    logger.error('Error opening database:', err);
                    reject(err);
                    return;
                }
                logger.info('Connected to SQLite database');
            });
            // Read schema file
            const schemaPath = path_1.default.resolve(__dirname, 'schema.sql');
            if (!fs_1.default.existsSync(schemaPath)) {
                const error = new Error(`Schema file not found at: ${schemaPath}`);
                logger.error(error.message);
                reject(error);
                return;
            }
            const schemaSQL = fs_1.default.readFileSync(schemaPath, 'utf8');
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
        }
        catch (error) {
            logger.error('Unexpected error during database initialization:', error);
            reject(error);
        }
    });
}
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=initDb.js.map
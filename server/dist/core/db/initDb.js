"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = void 0;
const sqlite3 = __importStar(require("sqlite3"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../utils/logger");
/**
 * Initialize the SQLite database with the required schema
 */
async function initializeDatabase(dbPath = './server/data/logomesh.sqlite3') {
    // Ensure the directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        logger_1.logger.info(`Created database directory: ${dbDir}`);
    }
    return new Promise((resolve, reject) => {
        try {
            logger_1.logger.info(`Connecting to database at: ${dbPath}`);
            // Connect to SQLite database
            const db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    logger_1.logger.error('Error opening database:', err);
                    reject(err);
                    return;
                }
                logger_1.logger.info('Connected to SQLite database');
            });
            // Read schema file
            const schemaPath = path.resolve(__dirname, 'schema.sql');
            if (!fs.existsSync(schemaPath)) {
                const error = new Error(`Schema file not found at: ${schemaPath}`);
                logger_1.logger.error(error.message);
                reject(error);
                return;
            }
            const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
            logger_1.logger.info('Loaded database schema');
            // Execute schema creation
            db.exec(schemaSQL, (err) => {
                if (err) {
                    logger_1.logger.error('Error creating database schema:', err);
                    db.close();
                    reject(err);
                    return;
                }
                logger_1.logger.info('Database schema created successfully');
                // Close database connection
                db.close((err) => {
                    if (err) {
                        logger_1.logger.error('Error closing database:', err);
                        reject(err);
                        return;
                    }
                    logger_1.logger.info('Database initialization complete');
                    resolve();
                });
            });
        }
        catch (error) {
            logger_1.logger.error('Unexpected error during database initialization:', error);
            reject(error);
        }
    });
}
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=initDb.js.map
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs")); // Use standard fs for sync methods used below
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../../core/utils/logger"); // Corrected path
const router = express_1.default.Router();
// Health check for admin services
router.get('/health', (req, res) => {
    res.json({ service: 'admin', status: 'healthy', timestamp: new Date().toISOString() });
});
/**
 * POST /api/v1/admin/backup
 * Creates a timestamped backup of the SQLite database
 */
router.post('/backup', async (req, res) => {
    try {
        // Prefer DB_PATH from environment, fallback to default within server/data
        const dbPath = process.env.DB_PATH || path_1.default.resolve(__dirname, '../../../data/logomesh.sqlite3');
        const backupDir = path_1.default.resolve(__dirname, '../../../backups'); // Store backups in /app/server/backups
        // Ensure backup directory exists
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
            logger_1.logger.info(`[AdminRoutes] Created backup directory: ${backupDir}`);
        }
        // Check if database file exists
        if (!fs.existsSync(dbPath)) {
            logger_1.logger.error(`[AdminRoutes] Database file not found at: ${dbPath}`);
            return res.status(404).json({
                error: 'Database file not found',
                path: dbPath
            });
        }
        // Create timestamped backup filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFilename = `logomesh_backup_${timestamp}.sqlite3`;
        const backupPath = path_1.default.join(backupDir, backupFilename);
        // Copy database file to backup location
        fs.copyFileSync(dbPath, backupPath); // Using sync version as per existing dominant pattern
        logger_1.logger.info(`[AdminRoutes] Database backup created: ${backupPath}`);
        res.status(200).json({
            success: true,
            message: 'Database backup created successfully',
            backupFile: backupFilename,
            backupPath: backupPath,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('[AdminRoutes] Error creating database backup:', error);
        res.status(500).json({
            error: 'Failed to create database backup',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * GET /api/v1/admin/backups
 * Lists all available backup files
 */
router.get('/backups', async (req, res) => {
    try {
        const backupDir = path_1.default.resolve(__dirname, '../../../backups');
        if (!fs.existsSync(backupDir)) {
            logger_1.logger.info('[AdminRoutes] Backup directory does not exist, returning empty list.');
            return res.status(200).json({ backups: [] });
        }
        const files = fs.readdirSync(backupDir) // Using sync version
            .filter(file => file.endsWith('.sqlite3'))
            .map(file => {
            const filePath = path_1.default.join(backupDir, file);
            const stats = fs.statSync(filePath); // Using sync version
            return {
                filename: file,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            };
        })
            .sort((a, b) => b.created.getTime() - a.created.getTime());
        res.status(200).json({ backups: files });
    }
    catch (error) {
        logger_1.logger.error('[AdminRoutes] Error listing backups:', error);
        res.status(500).json({
            error: 'Failed to list backups',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Save error logs endpoint
router.post('/save-errors', (req, res) => {
    try {
        const errorData = req.body;
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const logFile = path_1.default.join(process.cwd(), 'error_exports', 'runtime_errors', `errors_${timestamp}.jsonl`);
        // Ensure directory exists
        const logDir = path_1.default.dirname(logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        // Append error as JSON line
        const logLine = JSON.stringify(errorData) + '\n';
        fs.appendFileSync(logFile, logLine);
        res.status(200).json({ success: true, message: 'Error logged successfully' });
    }
    catch (error) {
        console.error('Failed to save error:', error);
        res.status(500).json({ success: false, message: 'Failed to save error' });
    }
});
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../../src/core/utils/logger");
const router = express_1.default.Router();
// Health check for admin services
router.get('/health', (req, res) => {
    res.json({ service: 'admin', status: 'healthy' });
});
// POST /api/v1/admin/backup - Create database backup
router.post('/backup', async (req, res) => {
    try {
        const dbPath = process.env.DB_PATH || './server/data/logomesh.sqlite3';
        const backupDir = path_1.default.resolve('./server/backups');
        // Ensure backup directory exists
        await fs_1.promises.mkdir(backupDir, { recursive: true });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path_1.default.join(backupDir, `logomesh-backup-${timestamp}.sqlite3`);
        // Copy database file
        await fs_1.promises.copyFile(dbPath, backupPath);
        logger_1.logger.info(`Database backup created: ${backupPath}`);
        res.json({
            message: 'Backup created successfully',
            backupPath,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating backup:', error);
        res.status(500).json({ error: 'Failed to create backup' });
    }
});
exports.default = router;
const router = express_1.default.Router();
// Ensure backups directory exists
async function ensureBackupsDirectory() {
    const backupsDir = path_1.default.join(__dirname, '../../backups');
    try {
        await fs_1.promises.access(backupsDir);
    }
    catch {
        await fs_1.promises.mkdir(backupsDir, { recursive: true });
    }
    return backupsDir;
}
// POST /api/v1/admin/backup
router.post('/backup', async (req, res) => {
    try {
        logger_1.logger.info('[AdminRoutes] Creating database backup...');
        const dbPath = process.env.DB_PATH || './data/logomesh.sqlite3';
        const backupsDir = await ensureBackupsDirectory();
        // Check if source DB exists
        try {
            await fs_1.promises.access(dbPath);
        }
        catch {
            logger_1.logger.error(`[AdminRoutes] Database file not found at: ${dbPath}`);
            return res.status(404).json({
                error: 'Database file not found',
                path: dbPath
            });
        }
        // Create timestamped backup filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFilename = `logomesh-backup-${timestamp}.sqlite3`;
        const backupPath = path_1.default.join(backupsDir, backupFilename);
        // Copy database file
        await fs_1.promises.copyFile(dbPath, backupPath);
        // Verify backup was created
        const stats = await fs_1.promises.stat(backupPath);
        logger_1.logger.info(`[AdminRoutes] Backup created successfully: ${backupPath}`);
        res.json({
            message: 'Backup created successfully',
            backupPath,
            timestamp,
            size: stats.size
        });
    }
    catch (error) {
        logger_1.logger.error('[AdminRoutes] Error creating backup:', error);
        res.status(500).json({
            error: 'Failed to create backup',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /api/v1/admin/backups (list existing backups)
router.get('/backups', async (req, res) => {
    try {
        const backupsDir = await ensureBackupsDirectory();
        const files = await fs_1.promises.readdir(backupsDir);
        const backups = await Promise.all(files
            .filter(file => file.endsWith('.sqlite3'))
            .map(async (file) => {
            const filePath = path_1.default.join(backupsDir, file);
            const stats = await fs_1.promises.stat(filePath);
            return {
                filename: file,
                path: filePath,
                size: stats.size,
                created: stats.birthtime
            };
        }));
        res.json({ backups });
    }
    catch (error) {
        logger_1.logger.error('[AdminRoutes] Error listing backups:', error);
        res.status(500).json({
            error: 'Failed to list backups',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
const router = express_1.default.Router();
/**
 * POST /api/v1/admin/backup
 * Creates a timestamped backup of the SQLite database
 */
router.post('/backup', async (req, res) => {
    try {
        const dbPath = process.env.DB_PATH || './server/data/logomesh.sqlite3';
        const backupDir = path_1.default.resolve('./server/backups');
        // Ensure backup directory exists
        if (!fs_1.promises.existsSync(backupDir)) {
            fs_1.promises.mkdirSync(backupDir, { recursive: true });
            logger_1.logger.info(`Created backup directory: ${backupDir}`);
        }
        // Check if database file exists
        if (!fs_1.promises.existsSync(dbPath)) {
            return res.status(404).json({ error: 'Database file not found' });
        }
        // Create timestamped backup filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFilename = `logomesh_backup_${timestamp}.sqlite3`;
        const backupPath = path_1.default.join(backupDir, backupFilename);
        // Copy database file to backup location
        fs_1.promises.copyFileSync(dbPath, backupPath);
        logger_1.logger.info(`Database backup created: ${backupPath}`);
        res.status(200).json({
            success: true,
            message: 'Database backup created successfully',
            backupFile: backupFilename,
            backupPath: backupPath,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating database backup:', error);
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
        const backupDir = path_1.default.resolve('./server/backups');
        if (!fs_1.promises.existsSync(backupDir)) {
            return res.status(200).json({ backups: [] });
        }
        const files = fs_1.promises.readdirSync(backupDir)
            .filter(file => file.endsWith('.sqlite3'))
            .map(file => {
            const filePath = path_1.default.join(backupDir, file);
            const stats = fs_1.promises.statSync(filePath);
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
        logger_1.logger.error('Error listing backups:', error);
        res.status(500).json({
            error: 'Failed to list backups',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map
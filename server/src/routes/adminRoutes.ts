import express, { Request, Response } from 'express';
import * as fs from 'fs'; // Use standard fs for sync methods used below
import path from 'path';
import { logger } from '../../../core/utils/logger'; // Corrected path

const router = express.Router();

// Health check for admin services
router.get('/health', (req: Request, res: Response) => {
  res.json({ service: 'admin', status: 'healthy', timestamp: new Date().toISOString() });
});

/**
 * POST /api/v1/admin/backup
 * Creates a timestamped backup of the SQLite database
 */
router.post('/backup', async (req: Request, res: Response) => {
  try {
    // Prefer DB_PATH from environment, fallback to default within server/data
    const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../../data/logomesh.sqlite3');
    const backupDir = path.resolve(__dirname, '../../../backups'); // Store backups in /app/server/backups

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      logger.info(`[AdminRoutes] Created backup directory: ${backupDir}`);
    }

    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      logger.error(`[AdminRoutes] Database file not found at: ${dbPath}`);
      return res.status(404).json({
        error: 'Database file not found',
        path: dbPath
      });
    }

    // Create timestamped backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `logomesh_backup_${timestamp}.sqlite3`;
    const backupPath = path.join(backupDir, backupFilename);

    // Copy database file to backup location
    fs.copyFileSync(dbPath, backupPath); // Using sync version as per existing dominant pattern

    logger.info(`[AdminRoutes] Database backup created: ${backupPath}`);

    res.status(200).json({
      success: true,
      message: 'Database backup created successfully',
      backupFile: backupFilename,
      backupPath: backupPath,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('[AdminRoutes] Error creating database backup:', error);
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
router.get('/backups', async (req: Request, res: Response) => { // Made async to align if fs.promises were used later
  try {
    const backupDir = path.resolve(__dirname, '../../../backups');

    if (!fs.existsSync(backupDir)) {
      logger.info('[AdminRoutes] Backup directory does not exist, returning empty list.');
      return res.status(200).json({ backups: [] });
    }

    const files = fs.readdirSync(backupDir) // Using sync version
      .filter(file => file.endsWith('.sqlite3'))
      .map(file => {
        const filePath = path.join(backupDir, file);
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

  } catch (error) {
    logger.error('[AdminRoutes] Error listing backups:', error);
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
    const logFile = path.join(process.cwd(), 'error_exports', 'runtime_errors', `errors_${timestamp}.jsonl`);

    // Ensure directory exists
    const logDir = path.dirname(logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Append error as JSON line
    const logLine = JSON.stringify(errorData) + '\n';
    fs.appendFileSync(logFile, logLine);

    res.status(200).json({ success: true, message: 'Error logged successfully' });
  } catch (error) {
    console.error('Failed to save error:', error);
    res.status(500).json({ success: false, message: 'Failed to save error' });
  }
});

export default router;
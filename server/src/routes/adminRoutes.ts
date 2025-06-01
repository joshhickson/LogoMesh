import express, { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import express from 'express';
import { logger } from '../../../src/core/utils/logger';

const router = express.Router();

// Health check for admin services
router.get('/health', (req: Request, res: Response) => {
  res.json({ service: 'admin', status: 'healthy' });
});

// POST /api/v1/admin/backup - Create database backup
router.post('/backup', async (req: Request, res: Response) => {
  try {
    const dbPath = process.env.DB_PATH || './server/data/logomesh.sqlite3';
    const backupDir = path.resolve('./server/backups');

    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `logomesh-backup-${timestamp}.sqlite3`);

    // Copy database file
    await fs.copyFile(dbPath, backupPath);

    logger.info(`Database backup created: ${backupPath}`);
    res.json({ 
      message: 'Backup created successfully',
      backupPath,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

export default router;

const router = express.Router();

// Ensure backups directory exists
async function ensureBackupsDirectory(): Promise<string> {
  const backupsDir = path.join(__dirname, '../../backups');
  try {
    await fs.access(backupsDir);
  } catch {
    await fs.mkdir(backupsDir, { recursive: true });
  }
  return backupsDir;
}

// POST /api/v1/admin/backup
router.post('/backup', async (req, res) => {
  try {
    logger.info('[AdminRoutes] Creating database backup...');

    const dbPath = process.env.DB_PATH || './data/logomesh.sqlite3';
    const backupsDir = await ensureBackupsDirectory();

    // Check if source DB exists
    try {
      await fs.access(dbPath);
    } catch {
      logger.error(`[AdminRoutes] Database file not found at: ${dbPath}`);
      return res.status(404).json({ 
        error: 'Database file not found',
        path: dbPath 
      });
    }

    // Create timestamped backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `logomesh-backup-${timestamp}.sqlite3`;
    const backupPath = path.join(backupsDir, backupFilename);

    // Copy database file
    await fs.copyFile(dbPath, backupPath);

    // Verify backup was created
    const stats = await fs.stat(backupPath);

    logger.info(`[AdminRoutes] Backup created successfully: ${backupPath}`);

    res.json({
      message: 'Backup created successfully',
      backupPath,
      timestamp,
      size: stats.size
    });

  } catch (error) {
    logger.error('[AdminRoutes] Error creating backup:', error);
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
    const files = await fs.readdir(backupsDir);

    const backups = await Promise.all(
      files
        .filter(file => file.endsWith('.sqlite3'))
        .map(async (file) => {
          const filePath = path.join(backupsDir, file);
          const stats = await fs.stat(filePath);
          return {
            filename: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime
          };
        })
    );

    res.json({ backups });
  } catch (error) {
    logger.error('[AdminRoutes] Error listing backups:', error);
    res.status(500).json({ 
      error: 'Failed to list backups',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

const router = express.Router();

/**
 * POST /api/v1/admin/backup
 * Creates a timestamped backup of the SQLite database
 */
router.post('/backup', async (req: Request, res: Response) => {
  try {
    const dbPath = process.env.DB_PATH || './server/data/logomesh.sqlite3';
    const backupDir = path.resolve('./server/backups');

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      logger.info(`Created backup directory: ${backupDir}`);
    }

    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database file not found' });
    }

    // Create timestamped backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `logomesh_backup_${timestamp}.sqlite3`;
    const backupPath = path.join(backupDir, backupFilename);

    // Copy database file to backup location
    fs.copyFileSync(dbPath, backupPath);

    logger.info(`Database backup created: ${backupPath}`);

    res.status(200).json({
      success: true,
      message: 'Database backup created successfully',
      backupFile: backupFilename,
      backupPath: backupPath,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error creating database backup:', error);
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
router.get('/backups', async (req: Request, res: Response) => {
  try {
    const backupDir = path.resolve('./server/backups');

    if (!fs.existsSync(backupDir)) {
      return res.status(200).json({ backups: [] });
    }

    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.sqlite3'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
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
    logger.error('Error listing backups:', error);
    res.status(500).json({ 
      error: 'Failed to list backups',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
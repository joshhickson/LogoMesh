
import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../../../src/core/utils/logger';

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

import express, { Request, Response } from 'express';
import * as fs from 'fs'; // Use standard fs for sync methods used below
import path from 'path';
import { Client, QueryResult } from 'pg'; // Added QueryResult
import { logger } from '../../../core/utils/logger'; // Corrected path
import config from '../../../core/config';

const router = express.Router();

// Health check for admin services
// Health check endpoint
router.get('/health', async (_req: Request, res: Response): Promise<void> => { // req -> _req
  try {
    // Test database connection
    const databaseUrl = config.database.url;
    if (databaseUrl) {
      const client = new Client({ connectionString: databaseUrl });
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
    }

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      database: databaseUrl ? 'connected' : 'not_configured'
    });
  } catch (error) {
    logger.error('[AdminRoutes] Health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test database connection with custom connection string
interface TestDbBody {
  connectionString?: string;
}
router.post('/test-db', async (req: Request, res: Response): Promise<void> => {
  try {
    const { connectionString } = req.body as TestDbBody;

    if (!connectionString) {
      res.status(400).json({ error: 'Connection string is required' });
      return;
    }

    const client = new Client({ connectionString });
    await client.connect();

    // Test basic query
    const result: QueryResult<{ version: string }> = await client.query('SELECT version()');
    await client.end();

    const version = result.rows && result.rows.length > 0 ? result.rows[0].version : 'unknown';

    res.json({ 
      success: true, 
      message: 'Database connection successful',
      version: version
    });
  } catch (error) {
    logger.error('[AdminRoutes] Database test failed:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/admin/backup
 * Creates a timestamped backup of the SQLite database
 */
router.post('/backup', async (_req: Request, res: Response): Promise<void> => { // req -> _req
  try {
    // Prefer DB_PATH from environment, fallback to default within server/data
    const dbPath = config.database.path;
    const backupDir = path.resolve(__dirname, '../../../backups'); // Store backups in /app/server/backups

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      logger.info(`[AdminRoutes] Created backup directory: ${backupDir}`);
    }

    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      logger.error(`[AdminRoutes] Database file not found at: ${dbPath}`);
      res.status(404).json({
        error: 'Database file not found',
        path: dbPath
      });
      return;
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
router.get('/backups', async (_req: Request, res: Response): Promise<void> => { // req -> _req
  try {
    const backupDir = path.resolve(__dirname, '../../../backups');

    if (!fs.existsSync(backupDir)) {
      logger.info('[AdminRoutes] Backup directory does not exist, returning empty list.');
      res.status(200).json({ backups: [] });
      return;
    }

    const files = fs.readdirSync(backupDir)
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
router.post('/save-errors', (req: Request, res: Response): void => { // Added void return type
  try {
    const errorData = req.body as Record<string, unknown>;
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
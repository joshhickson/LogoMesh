/* globals Express:readonly */
import express, { Request, Response, Request as ExpressRequest } from 'express';
import multer from 'multer';
// Express.Multer.File should be available globally via @types/multer and @types/express
import { PortabilityService } from '../../../core/services/portabilityService';
import { logger } from '../../../core/utils/logger';
import { ExportData } from '../../../contracts/types'; // Import ExportData

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req: ExpressRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => { // Changed MulterFile to Express.Multer.File
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
    if (file && typeof file.mimetype === 'string' && typeof file.originalname === 'string' &&
        (file.mimetype === 'application/json' || file.originalname.endsWith('.json'))) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
  }
});

/**
 * Export all data as JSON
 */
router.get('/json', async (_req: Request, res: Response): Promise<void> => {
  try {
    const portabilityService = _req.app.locals.portabilityService as PortabilityService; // req -> _req

    const exportData = await portabilityService.exportData();

    // Set headers for file download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `logomesh-export-${timestamp}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.json(exportData);
  } catch (error) {
    logger.error('Error exporting data:', error);
    res.status(500).json({ 
      error: 'Failed to export data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Import data from JSON file
 */
router.post('/json', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const portabilityService = req.app.locals.portabilityService as PortabilityService;

    // Parse the JSON file
    const fileContent = req.file.buffer.toString('utf8');
    let jsonData: unknown; // Use unknown first

    try {
      jsonData = JSON.parse(fileContent);
    } catch (parseError) {
      res.status(400).json({
        error: 'Invalid JSON file',
        details: parseError instanceof Error ? parseError.message : 'Parse error'
      });
      return;
    }

    // Import the data
    // TODO: Add validation to ensure jsonData actually matches ExportData structure before casting
    await portabilityService.importData(jsonData as ExportData);

    res.json({ 
      success: true,
      message: 'Data imported successfully'
    });
  } catch (error) {
    logger.error('Error importing data:', error);
    res.status(500).json({ 
      error: 'Failed to import data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
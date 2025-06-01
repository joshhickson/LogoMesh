import express, { Request, Response } from 'express';
import multer from 'multer';
import { PortabilityService } from '../../../core/services/portabilityService';
import { logger } from '../../../src/core/utils/logger';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
  }
});

/**
 * Export all data as JSON
 */
router.get('/json', async (req: Request, res: Response) => {
  try {
    const portabilityService: PortabilityService = req.app.locals.portabilityService;

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
router.post('/json', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const portabilityService: PortabilityService = req.app.locals.portabilityService;

    // Parse the JSON file
    const fileContent = req.file.buffer.toString('utf8');
    let jsonData;

    try {
      jsonData = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({ 
        error: 'Invalid JSON file',
        details: parseError instanceof Error ? parseError.message : 'Parse error'
      });
    }

    // Import the data
    await portabilityService.importData(jsonData);

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
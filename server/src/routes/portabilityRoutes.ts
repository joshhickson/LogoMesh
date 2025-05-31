
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
});

// Export data as JSON
router.get('/json', async (req: Request, res: Response) => {
  try {
    const portabilityService: PortabilityService = req.app.locals.portabilityService;
    const exportData = await portabilityService.exportData();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `thoughtweb-export-${timestamp}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(exportData);
  } catch (error) {
    logger.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Import data from JSON
router.post('/json', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const portabilityService: PortabilityService = req.app.locals.portabilityService;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const jsonData = JSON.parse(req.file.buffer.toString('utf-8'));
    await portabilityService.importData(jsonData);
    
    res.json({ 
      success: true, 
      message: 'Data imported successfully',
      filename: req.file.originalname 
    });
  } catch (error) {
    logger.error('Error importing data:', error);
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: 'Invalid JSON file' });
    } else {
      res.status(500).json({ error: 'Failed to import data' });
    }
  }
});

export default router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const logger_1 = require("../../../src/core/utils/logger");
const router = express_1.default.Router();
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
// Export data as JSON
router.get('/json', async (req, res) => {
    try {
        const portabilityService = req.app.locals.portabilityService;
        const exportData = await portabilityService.exportData();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `thoughtweb-export-${timestamp}.json`;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.json(exportData);
    }
    catch (error) {
        logger_1.logger.error('Error exporting data:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});
// Import data from JSON
router.post('/json', upload.single('file'), async (req, res) => {
    try {
        const portabilityService = req.app.locals.portabilityService;
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
    }
    catch (error) {
        logger_1.logger.error('Error importing data:', error);
        if (error instanceof SyntaxError) {
            res.status(400).json({ error: 'Invalid JSON file' });
        }
        else {
            res.status(500).json({ error: 'Failed to import data' });
        }
    }
});
exports.default = router;
//# sourceMappingURL=portabilityRoutes.js.map
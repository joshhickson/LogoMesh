"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pluginHost_1 = require("../../../core/services/pluginHost");
const logger_1 = require("../../../core/utils/logger");
const router = express_1.default.Router();
// This will be initialized with proper PluginAPI
let pluginHost = null;
// Initialize plugin host with proper API wiring
router.post('/init', async (req, res) => {
    try {
        const { PluginAPI } = require('../../../contracts/plugins/pluginApi');
        const { SQLiteAdapter } = require('../../../core/storage/sqliteAdapter');
        const { EventBus } = require('../../../core/services/eventBus');
        // Create minimal plugin API for testing
        const eventBus = new EventBus();
        const storage = new SQLiteAdapter();
        const pluginApi = new PluginAPI(logger_1.logger, storage, eventBus);
        pluginHost = new pluginHost_1.PluginHost(logger_1.logger, pluginApi);
        res.json({ success: true, message: 'Plugin host initialized with API' });
    }
    catch (error) {
        logger_1.logger.error('Plugin host initialization failed:', error);
        res.status(500).json({ error: 'Failed to initialize plugin host' });
    }
});
// Load a plugin
router.post('/load', async (req, res) => {
    const { manifestPath } = req.body;
    try {
        if (!pluginHost) {
            return res.status(400).json({ error: 'Plugin host not initialized' });
        }
        const success = await pluginHost.loadPlugin(manifestPath);
        if (success) {
            res.json({ success: true, message: `Plugin loaded from ${manifestPath}` });
        }
        else {
            res.status(400).json({ error: 'Failed to load plugin' });
        }
    }
    catch (error) {
        logger_1.logger.error('Plugin loading failed:', error);
        res.status(500).json({ error: 'Plugin loading failed' });
    }
});
// Execute plugin command
router.post('/execute', async (req, res) => {
    const { pluginName, command, payload } = req.body;
    try {
        if (!pluginHost) {
            return res.status(400).json({ error: 'Plugin host not initialized' });
        }
        const result = await pluginHost.executePluginCommand(pluginName, command, payload);
        res.json({ success: true, result });
    }
    catch (error) {
        logger_1.logger.error('Plugin execution failed:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
});
// List loaded plugins
router.get('/list', (req, res) => {
    try {
        if (!pluginHost) {
            return res.status(400).json({ error: 'Plugin host not initialized' });
        }
        const plugins = pluginHost.getLoadedPlugins();
        res.json({ success: true, plugins });
    }
    catch (error) {
        logger_1.logger.error('Failed to list plugins:', error);
        res.status(500).json({ error: 'Failed to list plugins' });
    }
});
exports.default = router;
//# sourceMappingURL=pluginRoutes.js.map

import express from 'express';
import { PluginHost } from '../../../core/services/pluginHost';
import { Logger } from '../../../core/utils/logger';

const router = express.Router();
const logger = new Logger();

// This will be initialized with proper PluginAPI
let pluginHost: PluginHost | null = null;

// Initialize plugin host (you'll wire this to your main app)
router.post('/init', async (req, res) => {
  try {
    // pluginHost = new PluginHost(logger, pluginApi);
    res.json({ success: true, message: 'Plugin host initialized' });
  } catch (error) {
    logger.error('Plugin host initialization failed:', error);
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
    } else {
      res.status(400).json({ error: 'Failed to load plugin' });
    }
  } catch (error) {
    logger.error('Plugin loading failed:', error);
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
  } catch (error) {
    logger.error('Plugin execution failed:', error);
    res.status(500).json({ error: error.message });
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
  } catch (error) {
    logger.error('Failed to list plugins:', error);
    res.status(500).json({ error: 'Failed to list plugins' });
  }
});

export default router;

import { Router, Request, Response } from 'express'; // Removed express default, NextFunction
import { PluginHost } from '../../../core/services/pluginHost';
import { logger } from '../../../core/utils/logger';

const router = Router();

// --- Request Body Interfaces ---
interface LoadPluginBody {
  manifestPath?: string;
}

interface ExecuteCommandBody {
  pluginName?: string;
  command?: string;
  payload?: unknown;
}
// --- End Request Body Interfaces ---

// This will be initialized with proper PluginAPI
let pluginHost: PluginHost | null = null;

// Initialize plugin host with proper API wiring
import { SQLiteStorageAdapter } from '../../../core/storage/sqliteAdapter';
// import { EventBus } from '../../../core/services/eventBus';

router.post('/init', async (_req: Request, res: Response): Promise<void> => {
  try {
    // Create minimal plugin API for testing
    // const eventBus = new EventBus();
    new SQLiteStorageAdapter('./data/logomesh.sqlite3');

    pluginHost = new PluginHost(logger);
    res.json({ success: true, message: 'Plugin host initialized with API' });
  } catch (error: unknown) { // Typed error
    logger.error('Plugin host initialization failed:', error);
    res.status(500).json({
      error: 'Failed to initialize plugin host',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Load a plugin
router.post('/load', async (req: Request, res: Response): Promise<void> => {
  const { manifestPath } = req.body as LoadPluginBody;

  if (!manifestPath || typeof manifestPath !== 'string') {
    res.status(400).json({ error: 'manifestPath is required and must be a string' });
    return; // This is already correct
  }

  try {
    if (!pluginHost) {
      res.status(400).json({ error: 'Plugin host not initialized' });
      return; // This is already correct
    }

    const success = await pluginHost.loadPlugin(manifestPath);

    if (success) {
      res.json({ success: true, message: `Plugin loaded from ${manifestPath}` });
    } else {
      res.status(400).json({ error: 'Failed to load plugin' });
    }
  } catch (error: unknown) {
    logger.error('Plugin loading failed:', error);
    res.status(500).json({
      error: 'Plugin loading failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Execute plugin command
router.post('/execute', async (req: Request, res: Response): Promise<void> => {
  const { pluginName, command, payload } = req.body as ExecuteCommandBody;

  if (!pluginName || typeof pluginName !== 'string' || !command || typeof command !== 'string') {
    res.status(400).json({ error: 'pluginName and command are required and must be strings' });
    return; // Correct
  }

  try {
    if (!pluginHost) {
      res.status(400).json({ error: 'Plugin host not initialized' });
      return; // Correct
    }

    const result = await pluginHost.executePluginCommand(pluginName, command, payload);
    res.json({ success: true, result });
  } catch (error: unknown) {
    logger.error('Plugin execution failed:', error);
    res.status(500).json({
      error: 'Plugin execution command failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// List loaded plugins
router.get('/list', (_req: Request, res: Response): void => { // req -> _req
  try {
    if (!pluginHost) {
      res.status(400).json({ error: 'Plugin host not initialized' });
      return; // Correct
    }

    const plugins = pluginHost.getLoadedPlugins();
    res.json({ success: true, plugins });
    // return; // Implicitly returns after res.json() in a void function
  } catch (error: unknown) {
    logger.error('Failed to list plugins:', error);
    res.status(500).json({
      error: 'Failed to list plugins',
      details: error instanceof Error ? error.message : String(error)
    });
    // return; // Implicitly returns after res.status().json() in a void function
  }
});

export default router;
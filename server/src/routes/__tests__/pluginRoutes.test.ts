/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { PluginHost } from '@core/services/pluginHost';
import { SQLiteStorageAdapter } from '@core/storage/sqliteAdapter';

// Mock dependencies
vi.mock('@core/services/pluginHost');
vi.mock('@core/storage/sqliteAdapter');

describe('Plugin Routes', () => {
  let app: express.Express;
  let pluginRoutes: express.Router;

  // Shared mock instance
  const mockPluginHost = {
    loadPlugin: vi.fn(),
    executePluginCommand: vi.fn(),
    getLoadedPlugins: vi.fn(),
  };

  beforeEach(async () => {
    // Reset modules to get a fresh instance of the routes with a null pluginHost
    vi.resetModules();
    vi.clearAllMocks();

    // Setup mock implementations
    vi.mocked(PluginHost).mockImplementation(() => mockPluginHost as any);
    vi.mocked(SQLiteStorageAdapter).mockImplementation(() => ({} as any));

    // Dynamically import routes to get the fresh, un-initialized state
    const { default: routes } = await import('../pluginRoutes');
    pluginRoutes = routes;

    app = express();
    app.use(express.json());
    app.use('/plugins', pluginRoutes);
  });

  describe('Before Initialization', () => {
    it('POST /plugins/load should fail if host not initialized', async () => {
      const response = await request(app).post('/plugins/load').send({ manifestPath: 'path' });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Plugin host not initialized');
    });

    it('POST /plugins/execute should fail if host not initialized', async () => {
        const response = await request(app).post('/plugins/execute').send({ pluginName: 'p', command: 'c' });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Plugin host not initialized');
    });

    it('GET /plugins/list should fail if host not initialized', async () => {
        const response = await request(app).get('/plugins/list');
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Plugin host not initialized');
    });
  });

  describe('POST /plugins/init', () => {
    it('should initialize the plugin host successfully', async () => {
      const response = await request(app).post('/plugins/init');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(PluginHost).toHaveBeenCalled();
    });

    it('should return 500 if initialization fails', async () => {
        vi.mocked(PluginHost).mockImplementationOnce(() => {
            throw new Error('Init failed');
        });
        const response = await request(app).post('/plugins/init');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to initialize plugin host');
    });
  });

  describe('After Initialization', () => {
    beforeEach(async () => {
        // Ensure host is initialized for this block of tests
        await request(app).post('/plugins/init');
    });

    describe('POST /plugins/load', () => {
        it('should load a plugin successfully', async () => {
            mockPluginHost.loadPlugin.mockResolvedValue(true);
            const response = await request(app)
                .post('/plugins/load')
                .send({ manifestPath: '/path/to/manifest.json' });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should return 400 if manifestPath is missing', async () => {
            const response = await request(app).post('/plugins/load').send({});
            expect(response.status).toBe(400);
        });

        it('should return 400 if plugin loading fails', async () => {
            mockPluginHost.loadPlugin.mockResolvedValue(false);
            const response = await request(app)
                .post('/plugins/load')
                .send({ manifestPath: '/path/to/manifest.json' });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Failed to load plugin');
        });
    });

    describe('POST /plugins/execute', () => {
        it('should execute a plugin command successfully', async () => {
            mockPluginHost.executePluginCommand.mockResolvedValue({ result: 'ok' });
            const response = await request(app)
                .post('/plugins/execute')
                .send({ pluginName: 'my-plugin', command: 'do-stuff', payload: { data: 1 } });
            expect(response.status).toBe(200);
            expect(response.body.result).toEqual({ result: 'ok' });
        });
    });

    describe('GET /plugins/list', () => {
        it('should list loaded plugins successfully', async () => {
            const loadedPlugins = [{ name: 'my-plugin', version: '1.0.0' }];
            mockPluginHost.getLoadedPlugins.mockReturnValue(loadedPlugins);
            const response = await request(app).get('/plugins/list');
            expect(response.status).toBe(200);
            expect(response.body.plugins).toEqual(loadedPlugins);
        });
    });
  });
});

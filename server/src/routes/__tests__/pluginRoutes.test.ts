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
    vi.mocked(PluginHost).mockImplementation(() => mockPluginHost as unknown as PluginHost);
    vi.mocked(SQLiteStorageAdapter).mockImplementation(() => ({} as unknown as SQLiteStorageAdapter));

    // Dynamically import routes to get the fresh, un-initialized state
    const { default: routes } = await import('../pluginRoutes');
    pluginRoutes = routes;

    app = express();
    app.use(express.json());
    app.use('/plugins', pluginRoutes);
  });

  describe('Before Initialization', () => {
    interface ErrorResponse {
      error: string;
    }

    it('POST /plugins/load should fail if host not initialized', async () => {
      const response = await request(app).post('/plugins/load').send({ manifestPath: 'path' });
      const body = response.body as ErrorResponse;
      expect(response.status).toBe(400);
      expect(body.error).toBe('Plugin host not initialized');
    });

    it('POST /plugins/execute should fail if host not initialized', async () => {
        const response = await request(app).post('/plugins/execute').send({ pluginName: 'p', command: 'c' });
        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Plugin host not initialized');
    });

    it('GET /plugins/list should fail if host not initialized', async () => {
        const response = await request(app).get('/plugins/list');
        const body = response.body as ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.error).toBe('Plugin host not initialized');
    });
  });

  describe('POST /plugins/init', () => {
    interface InitResponse {
      success?: boolean;
      error?: string;
    }

    it('should initialize the plugin host successfully', async () => {
      const response = await request(app).post('/plugins/init');
      const body = response.body as InitResponse;
      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(PluginHost).toHaveBeenCalled();
    });

    it('should return 500 if initialization fails', async () => {
        vi.mocked(PluginHost).mockImplementationOnce(() => {
            throw new Error('Init failed');
        });
        const response = await request(app).post('/plugins/init');
        const body = response.body as InitResponse;
        expect(response.status).toBe(500);
        expect(body.error).toBe('Failed to initialize plugin host');
    });
  });

  describe('After Initialization', () => {
    beforeEach(async () => {
        // Ensure host is initialized for this block of tests
        await request(app).post('/plugins/init');
    });

    describe('POST /plugins/load', () => {
        interface LoadResponse {
          success?: boolean;
          error?: string;
        }

        it('should load a plugin successfully', async () => {
            mockPluginHost.loadPlugin.mockResolvedValue(true);
            const response = await request(app)
                .post('/plugins/load')
                .send({ manifestPath: '/path/to/manifest.json' });
            const body = response.body as LoadResponse;
            expect(response.status).toBe(200);
            expect(body.success).toBe(true);
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
            const body = response.body as LoadResponse;
            expect(response.status).toBe(400);
            expect(body.error).toBe('Failed to load plugin');
        });
    });

    describe('POST /plugins/execute', () => {
        interface ExecuteResponse {
          result: { result: string };
        }

        it('should execute a plugin command successfully', async () => {
            mockPluginHost.executePluginCommand.mockResolvedValue({ result: 'ok' });
            const response = await request(app)
                .post('/plugins/execute')
                .send({ pluginName: 'my-plugin', command: 'do-stuff', payload: { data: 1 } });
            const body = response.body as ExecuteResponse;
            expect(response.status).toBe(200);
            expect(body.result).toEqual({ result: 'ok' });
        });
    });

    describe('GET /plugins/list', () => {
        interface ListResponse {
          plugins: { name: string; version: string }[];
        }

        it('should list loaded plugins successfully', async () => {
            const loadedPlugins = [{ name: 'my-plugin', version: '1.0.0' }];
            mockPluginHost.getLoadedPlugins.mockReturnValue(loadedPlugins);
            const response = await request(app).get('/plugins/list');
            const body = response.body as ListResponse;
            expect(response.status).toBe(200);
            expect(body.plugins).toEqual(loadedPlugins);
        });
    });
  });
});

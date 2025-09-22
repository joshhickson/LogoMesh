/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import portabilityRoutes from '../portabilityRoutes';

// Mock the service
vi.mock('@core/services/portabilityService');

describe('Portability Routes', () => {
  let app: express.Express;
  const mockPortabilityService = {
    exportData: vi.fn(),
    importData: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();
    // Inject the mock service into app.locals, which is how the route accesses it
    app.locals.portabilityService = mockPortabilityService;
    app.use(express.json());
    app.use('/portability', portabilityRoutes);
  });

  describe('GET /portability/json (Export)', () => {
    it('should export data successfully', async () => {
      const mockExport = { version: 1, thoughts: [{ id: 't1', title: 'Test Thought' }] };
      mockPortabilityService.exportData.mockResolvedValue(mockExport);

      const response = await request(app).get('/portability/json');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="logomesh-export-.*\.json"/);
      expect(response.body).toEqual(mockExport);
      expect(mockPortabilityService.exportData).toHaveBeenCalled();
    });

    it('should return 500 if export fails', async () => {
      mockPortabilityService.exportData.mockRejectedValue(new Error('Export failed'));
      const response = await request(app).get('/portability/json');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to export data');
    });
  });

  describe('POST /portability/json (Import)', () => {
    const validJsonString = '{"version":1,"thoughts":[]}';
    const validJsonBuffer = Buffer.from(validJsonString);

    it('should import data successfully from a valid JSON file', async () => {
      mockPortabilityService.importData.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/portability/json')
        .attach('file', validJsonBuffer, 'import.json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPortabilityService.importData).toHaveBeenCalledWith(JSON.parse(validJsonString));
    });

    it('should return 400 if no file is uploaded', async () => {
      const response = await request(app).post('/portability/json');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No file uploaded');
    });

    it('should return 400 for a file with invalid JSON', async () => {
      const invalidJsonBuffer = Buffer.from('{"key": "value"'); // Malformed JSON
      const response = await request(app)
        .post('/portability/json')
        .attach('file', invalidJsonBuffer, 'bad.json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid JSON file');
    });

    it('should return 500 if import process fails', async () => {
      mockPortabilityService.importData.mockRejectedValue(new Error('Import failed'));

      const response = await request(app)
        .post('/portability/json')
        .attach('file', validJsonBuffer, 'import.json');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to import data');
    });

    // Note: Testing multer's file type filter is harder here as it rejects
    // before the route handler. Supertest might get a generic connection error.
    // The current tests are sufficient to cover the route's own logic.
  });
});

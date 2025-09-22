/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import adminRoutes from '../adminRoutes';
import config from '@core/config';
import * as fs from 'fs';
import { Client } from 'pg';

// --- Mocks ---
vi.mock('@core/config', () => ({
  default: {
    database: {
      url: undefined,
      path: '/data/logomesh.sqlite3',
    },
    nodeEnv: 'test',
  },
}));

vi.mock('fs');
vi.mock('pg');

// --- Test Suite ---
describe('Admin Routes', () => {
  let app: express.Express;

  // Mock implementations
  const mockConnect = vi.fn();
  const mockQuery = vi.fn();
  const mockEnd = vi.fn();

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/admin', adminRoutes);

    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup mock for pg.Client
    vi.mocked(Client).mockImplementation(() => ({
      connect: mockConnect.mockResolvedValue(undefined),
      query: mockQuery.mockResolvedValue({ rows: [], rowCount: 0 }),
      end: mockEnd.mockResolvedValue(undefined),
    } as unknown as Client));
  });

  afterEach(() => {
      // Restore config to default state after each test
      vi.mocked(config.database, true).url = undefined;
      vi.mocked(config.database, true).path = '/data/logomesh.sqlite3';
  });


  describe('GET /admin/health', () => {
    it('should return a healthy status when the database is not configured', async () => {
      vi.mocked(config.database, true).url = undefined;
      const response = await request(app).get('/admin/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.database).toBe('not_configured');
      expect(response.body.environment).toBe('test');
    });

    it('should return a healthy status when the database is configured and connects', async () => {
      vi.mocked(config.database, true).url = 'postgresql://test:test@localhost:5432/test';
      const response = await request(app).get('/admin/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.database).toBe('connected');
      expect(mockConnect).toHaveBeenCalled();
    });

    it('should return 500 if database connection fails', async () => {
      vi.mocked(config.database, true).url = 'postgresql://test:test@localhost:5432/test';
      mockConnect.mockRejectedValueOnce(new Error('Connection failed'));
      const response = await request(app).get('/admin/health');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('unhealthy');
      expect(response.body.error).toContain('Connection failed');
    });
  });

  describe('POST /admin/test-db', () => {
    it('should return 400 if connectionString is not provided', async () => {
      const response = await request(app).post('/admin/test-db').send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Connection string is required');
    });

    it('should return success on a valid connection string', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ version: 'PostgreSQL 13.0' }], rowCount: 1 });
      const response = await request(app)
        .post('/admin/test-db')
        .send({ connectionString: 'valid-string' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.version).toContain('PostgreSQL');
      expect(Client).toHaveBeenCalledWith({ connectionString: 'valid-string' });
    });

    it('should return 500 if the connection fails', async () => {
      mockConnect.mockRejectedValueOnce(new Error('DB connection failed'));
      const response = await request(app)
        .post('/admin/test-db')
        .send({ connectionString: 'invalid-string' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database connection failed');
    });
  });

  describe('POST /admin/backup', () => {
    it('should return 404 if database file is not found', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const response = await request(app).post('/admin/backup');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Database file not found');
    });

    it('should create a backup directory if it does not exist', async () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => {
        // DB exists, but backup dir does not
        return path === config.database.path;
      });
      const response = await request(app).post('/admin/backup');
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should create a backup file successfully', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        const response = await request(app).post('/admin/backup');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Database backup created successfully');
        expect(fs.copyFileSync).toHaveBeenCalled();
      });

    it('should return 500 on backup creation failure', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.copyFileSync).mockImplementationOnce(() => {
        throw new Error('Copy failed');
      });
      const response = await request(app).post('/admin/backup');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to create database backup');
    });
  });

  describe('GET /admin/backups', () => {
    it('should return an empty array when backup directory does not exist', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);
        const response = await request(app).get('/admin/backups');
        expect(response.status).toBe(200);
        expect(response.body.backups).toEqual([]);
    });

    it('should return a list of backup files', async () => {
        const mockFiles = ['backup1.sqlite3', 'backup2.sqlite3'];
        const mockStats = { size: 1024, birthtime: new Date(), mtime: new Date() };
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue(mockFiles as any);
        vi.mocked(fs.statSync).mockReturnValue(mockStats as any);

        const response = await request(app).get('/admin/backups');
        expect(response.status).toBe(200);
        expect(response.body.backups).toHaveLength(2);
        expect(response.body.backups[0].filename).toBe('backup1.sqlite3');
    });
  });

  describe('POST /admin/save-errors', () => {
    it('should save error data and return success', async () => {
        const errorData = { error: 'test error', details: 'details here' };
        vi.mocked(fs.existsSync).mockReturnValue(false); // To test directory creation
        const response = await request(app).post('/admin/save-errors').send(errorData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(fs.mkdirSync).toHaveBeenCalled();
        expect(fs.appendFileSync).toHaveBeenCalledWith(expect.any(String), JSON.stringify(errorData) + '\n');
    });

    it('should return 500 if saving fails', async () => {
        const errorData = { error: 'test error' };
        vi.mocked(fs.appendFileSync).mockImplementationOnce(() => {
            throw new Error('Cannot write to file');
        });

        const response = await request(app).post('/admin/save-errors').send(errorData);
        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
    });
  });
});

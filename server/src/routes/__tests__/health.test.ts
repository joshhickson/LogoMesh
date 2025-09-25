import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../index';
import { SQLiteStorageAdapter } from '../../../../core/storage/sqliteAdapter';

vi.mock('../../../../core/storage/sqliteAdapter');

describe('Health Check Endpoint', () => {
  it('should return a 200 status code and healthy status', async () => {
    const mockHealthCheck = vi.fn().mockResolvedValue({ status: 'ok' });
    app.locals.storageAdapter = { healthCheck: mockHealthCheck };

    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('operational');
    expect(response.body.services.dbConn).toBe('ok');
  });

  it('should return a 503 status code if the database is down', async () => {
    const mockHealthCheck = vi.fn().mockRejectedValue(new Error('DB is down'));
    app.locals.storageAdapter = { healthCheck: mockHealthCheck };

    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('degraded');
    expect(response.body.error).toBe('Service health check failed');
  });
});
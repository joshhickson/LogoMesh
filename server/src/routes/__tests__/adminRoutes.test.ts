import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import adminRoutes from '../adminRoutes';
import config from '@core/config';

// Mock the config module
vi.mock('@core/config', () => ({
  default: {
    database: {
      // Set to a falsy value to prevent the test from trying to connect to a real DB
      url: null,
    },
    nodeEnv: 'test',
  },
}));

const app = express();
app.use(express.json());
// Mount the admin routes at /admin
app.use('/admin', adminRoutes);

describe('Admin Routes', () => {
  describe('GET /admin/health', () => {
    it('should return a healthy status when the database is not configured', async () => {
      const response = await request(app).get('/admin/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.database).toBe('not_configured');
      expect(response.body.environment).toBe('test');
    });
  });
});

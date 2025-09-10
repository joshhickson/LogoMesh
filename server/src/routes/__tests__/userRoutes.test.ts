import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import userRoutes from '../userRoutes';
import * as authService from '@core/services/authService';

// Mock the authService
vi.mock('@core/services/authService', () => ({
  requireAuth: vi.fn((req, res, next) => {
    req.user = { id: '123', email: 'test@example.com', isAuthenticated: true };
    next();
  }),
}));

import { requireAuth } from '@core/services/authService';

const app = express();
app.use(express.json());
app.use('/user', requireAuth, userRoutes);

describe('User Routes', () => {
  describe('GET /user/current', () => {
    it('should return the current user when authenticated', async () => {
      const response = await request(app).get('/user/current');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: '123',
        isAuthenticated: true,
        name: undefined,
        roles: undefined,
      });
    });
  });
});

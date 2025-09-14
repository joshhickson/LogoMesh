/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import userRoutes from '../userRoutes';
import { AuthService } from '@core/services/authService';

// Mock the AuthService class and its requireAuth method
vi.mock('@core/services/authService', () => {
  const mockAuthServiceInstance = {
    requireAuth: vi.fn((req, res, next) => {
      req.user = { id: '123', name: 'Test User', roles: 'user', isAuthenticated: true };
      next();
    }),
  };
  return {
    AuthService: vi.fn(() => mockAuthServiceInstance),
  };
});

const mockAuthService = new AuthService({ jwtSecret: 'test-secret', jwtExpiration: '1h' });

const app = express();
app.use(express.json());
app.use('/user', mockAuthService.requireAuth, userRoutes);

describe('User Routes', () => {
  describe('GET /user/current', () => {
    it('should return the current user when authenticated', async () => {
      const response = await request(app).get('/user/current');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: '123',
        isAuthenticated: true,
        name: 'Test User',
        roles: 'user',
      });
    });
  });
});

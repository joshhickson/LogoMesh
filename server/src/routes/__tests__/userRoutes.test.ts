/** @vitest-environment node */
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import userRoutes from '../userRoutes';
import { AuthService } from '@core/services/authService';

// This mock is for the authenticated app instance
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


// --- Authenticated App Setup ---
const authenticatedApp = express();
authenticatedApp.use(express.json());
// Since AuthService is mocked, this will use the mocked instance
const mockAuthService = new AuthService();
authenticatedApp.use('/user', mockAuthService.requireAuth, userRoutes);


// --- Unauthenticated App Setup ---
const unauthenticatedApp = express();
unauthenticatedApp.use(express.json());
// We use the userRoutes directly, without any auth middleware.
// The route handlers themselves should handle cases where req.user is not defined.
unauthenticatedApp.use('/user', userRoutes);


describe('User Routes', () => {
  describe('When Authenticated', () => {
    describe('GET /user/me', () => {
      it('should return the current user info in the expected format', async () => {
        const response = await request(authenticatedApp).get('/user/me');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          user: {
            id: '123',
            name: 'Test User',
            roles: 'user',
            isAuthenticated: true,
          },
        });
      });
    });

    describe('GET /user/current', () => {
      it('should return the current user when authenticated', async () => {
        const response = await request(authenticatedApp).get('/user/current');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          id: '123',
          isAuthenticated: true,
          name: 'Test User',
          roles: 'user',
        });
      });
    });

    describe('GET /user/health', () => {
      it('should return a healthy status and authenticated flag', async () => {
        const response = await request(authenticatedApp).get('/user/health');
        expect(response.status).toBe(200);
        expect(response.body.service).toBe('user-auth');
        expect(response.body.status).toBe('healthy');
        expect(response.body.authenticated).toBe(true);
        expect(response.body).toHaveProperty('timestamp');
      });
    });
  });

  describe('When Unauthenticated', () => {
    describe('GET /user/me', () => {
      it('should return 401 Not Authenticated', async () => {
        const response = await request(unauthenticatedApp).get('/user/me');
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Not authenticated');
      });
    });

    describe('GET /user/current', () => {
      it('should return 401 Not Authenticated', async () => {
        const response = await request(unauthenticatedApp).get('/user/current');
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Not authenticated');
      });
    });

    describe('GET /user/health', () => {
      it('should return a healthy status and unauthenticated flag', async () => {
        const response = await request(unauthenticatedApp).get('/user/health');
        expect(response.status).toBe(200);
        expect(response.body.service).toBe('user-auth');
        expect(response.body.status).toBe('healthy');
        expect(response.body.authenticated).toBe(false);
        expect(response.body).toHaveProperty('timestamp');
      });
    });
  });
});

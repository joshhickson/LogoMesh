/** @vitest-environment node */
import { describe, it, expect, vi } from 'vitest';
import { AuthService, AuthUser } from './authService';
import config from '@core/config';
import jwt from 'jsonwebtoken';

describe('AuthService', () => {
  const authService = new AuthService();

  it('should generate a valid JWT token', () => {
    const user: AuthUser = {
      id: '123',
      name: 'Test User',
      roles: 'user',
      isAuthenticated: true,
    };

    const token = authService.generateToken(user);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should verify a valid JWT token', () => {
    const user: AuthUser = {
      id: '123',
      name: 'Test User',
      roles: 'user',
      isAuthenticated: true,
    };

    const token = authService.generateToken(user);
    const result = authService.verifyToken(token);

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe(user.id);
    expect(result.data?.name).toBe(user.name);
    expect(result.data?.roles).toBe(user.roles);
  });

  it('should not verify an invalid JWT token', () => {
    const result = authService.verifyToken('invalid-token');
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('AUTH_INVALID_TOKEN');
  });

  it('should not verify an expired JWT token', () => {
    vi.useFakeTimers();

    const user: AuthUser = {
      id: '123',
      name: 'Test User',
      roles: 'user',
      isAuthenticated: true,
    };

    const token = jwt.sign(
      { id: user.id, name: user.name, roles: user.roles },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    // Advance time by 2 hours
    vi.advanceTimersByTime(2 * 60 * 60 * 1000);

    const result = authService.verifyToken(token);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('AUTH_INVALID_TOKEN');

    vi.useRealTimers();
  });
});

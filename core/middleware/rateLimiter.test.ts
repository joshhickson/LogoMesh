/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApiRateLimiter } from './rateLimiter';
import { Request, Response } from 'express';

describe('Rate Limiter Middleware', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests below the limit', () => {
    const rateLimiter = createApiRateLimiter();
    const req = {
      path: '/',
      headers: {},
      connection: { remoteAddress: '127.0.0.1' },
      socket: { remoteAddress: '127.0.0.1' },
    } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();

    for (let i = 0; i < 100; i++) {
      rateLimiter.middleware()(req, res, next);
    }

    expect(next).toHaveBeenCalledTimes(100);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should block requests exceeding the limit', () => {
    const rateLimiter = createApiRateLimiter();
    const req = {
      path: '/',
      headers: {},
      connection: { remoteAddress: '127.0.0.1' },
      socket: { remoteAddress: '127.0.0.1' },
    } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();

    for (let i = 0; i < 101; i++) {
      rateLimiter.middleware()(req, res, next);
    }

    expect(next).toHaveBeenCalledTimes(100);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Too many API requests',
      })
    );
  });

  it('should reset the limit after the windowMs has passed', () => {
    const rateLimiter = createApiRateLimiter();
    const req = {
      path: '/',
      headers: {},
      connection: { remoteAddress: '127.0.0.1' },
      socket: { remoteAddress: '127.0.0.1' },
    } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();

    for (let i = 0; i < 101; i++) {
      rateLimiter.middleware()(req, res, next);
    }

    vi.advanceTimersByTime(61 * 1000);

    rateLimiter.middleware()(req, res, next);
    expect(next).toHaveBeenCalledTimes(101);
  });

  it('should not rate limit whitelisted paths', () => {
    const rateLimiter = createApiRateLimiter();
    const req = {
      path: '/status',
      headers: {},
      connection: { remoteAddress: '127.0.0.1' },
      socket: { remoteAddress: '127.0.0.1' },
    } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();

    for (let i = 0; i < 101; i++) {
      rateLimiter.middleware()(req, res, next);
    }

    expect(next).toHaveBeenCalledTimes(101);
    expect(res.status).not.toHaveBeenCalled();
  });
});

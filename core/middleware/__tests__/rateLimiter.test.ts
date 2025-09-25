import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { apiLimiter } from '../rateLimiter';
import requestIp from 'request-ip';

describe('Rate Limiter Middleware', () => {
  it('should allow requests under the limit', async () => {
    const app = express();
    app.use(requestIp.mw());
    app.use(apiLimiter);
    app.get('/', (_req, res) => res.status(200).send('OK'));

    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });

  it('should block requests over the limit', async () => {
    const app = express();
    app.use(requestIp.mw());
    app.use(apiLimiter);
    app.get('/', (_req, res) => res.status(200).send('OK'));

    // Exhaust the rate limit
    for (let i = 0; i < 100; i++) {
      await request(app).get('/');
    }

    const response = await request(app).get('/');
    expect(response.status).toBe(429);
    expect(response.body.error).toBe('Too many requests, please try again later.');
  });

  it('should not rate limit whitelisted endpoints', async () => {
    const app = express();
    app.use(requestIp.mw());
    app.use('/api/v1', apiLimiter);
    app.get('/api/v1/health', (_req, res) => res.status(200).send('OK'));
    app.get('/api/v1/status', (_req, res) => res.status(200).send('OK'));
    app.get('/', (_req, res) => res.status(200).send('OK'));

    // Exhaust the rate limit on a non-whitelisted endpoint
    for (let i = 0; i < 100; i++) {
      await request(app).get('/');
    }

    const healthResponse = await request(app).get('/api/v1/health');
    expect(healthResponse.status).toBe(200);

    const statusResponse = await request(app).get('/api/v1/status');
    expect(statusResponse.status).toBe(200);
  });
});
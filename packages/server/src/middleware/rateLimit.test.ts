import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import app from '../server';

describe('Rate Limiting Middleware', () => {
  it.skip('should allow requests under the limit', async () => {
    const response = await supertest(app).post('/v1/evaluate');
    expect(response.status).toBe(501); // Expecting the "Not Implemented" from our scaffold
  });

  it('should block requests that exceed the limit', async () => {
    const agent = supertest(app);
    // Exceed the limit of 100 requests
    for (let i = 0; i < 101; i++) {
      await agent.post('/v_1/evaluate');
    }
    const response = await agent.post('/v_1/evaluate');
    expect(response.status).toBe(429); // Too Many Requests
  });
});

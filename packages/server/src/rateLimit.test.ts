import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './server';

describe('Rate Limiting', () => {
  it('should return a 429 Too Many Requests status after 100 requests', async () => {
    const agent = request.agent(app);
    // In a separate test file, we can safely make all 100 requests without interference.
    for (let i = 0; i < 100; i++) {
      await agent.post('/v1/evaluate').expect(501);
    }
    // The 101st request should be blocked.
    const response = await agent.post('/v1/evaluate');
    expect(response.status).toBe(429);
  }, 15000); // Increase timeout for this test
});

import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import app from '../server';

describe('Rate Limiting Middleware', () => {
  it('should allow requests under the limit', async () => {
    const response = await supertest(app)
      .post('/v1/evaluate')
      .send({ purple_agent_endpoint: 'http://localhost:9999' });
    // Expect a 500 error because the orchestrator will fail to connect
    expect(response.status).toBe(500);
  });

  it('should block requests that exceed the limit', async () => {
    const agent = supertest(app);
    // Exceed the limit of 100 requests
    for (let i = 0; i < 101; i++) {
      await agent
        .post('/v1/evaluate')
        .send({ purple_agent_endpoint: 'http://localhost:9999' });
    }
    const response = await agent
      .post('/v1/evaluate')
      .send({ purple_agent_endpoint: 'http://localhost:9999' });
    expect(response.status).toBe(429); // Too Many Requests
  }, 15000);
});

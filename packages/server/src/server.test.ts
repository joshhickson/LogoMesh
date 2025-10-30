import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './server';

describe('POST /v1/evaluate', () => {
  it('should return a 501 Not Implemented status', async () => {
    const response = await request(app).post('/v1/evaluate');
    expect(response.status).toBe(501);
    expect(response.body).toEqual({ message: 'Not Implemented' });
  });
});

describe('GET /v1/evaluate/:evaluation_id', () => {
  it('should return a 501 Not Implemented status', async () => {
    const response = await request(app).get('/v1/evaluate/some-id');
    expect(response.status).toBe(501);
    expect(response.body).toEqual({ message: 'Not Implemented' });
  });
});

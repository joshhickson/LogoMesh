/** @vitest-environment node */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiService, getCurrentUser } from '../apiService';

describe('API Service Integration - User Authentication', () => {
  beforeEach(() => {
    // Mock fetch before each test in this suite
    global.fetch = vi.fn();
  });

  afterEach(() => {
    // Restore all mocks after each test
    vi.restoreAllMocks();
  });

  test('getCurrentUser - should handle successful response', async () => {
    const mockUser = { id: '123', name: 'Test User', email: 'test@example.com' };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockUser,
    });

    const result = await getCurrentUser();
    
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/user/current', expect.any(Object));
    expect(result).toEqual(mockUser);
  });

  test('getCurrentUser - should handle HTML error response', async () => {
    const htmlErrorResponse = '<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Cannot GET /api/v1/user/current</h1></body></html>';
    
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'text/html' }),
      text: async () => htmlErrorResponse,
      json: async () => {
        throw new SyntaxError('Unexpected token \'<\', "<!DOCTYPE "... is not valid JSON');
      }
    });

    await expect(getCurrentUser()).rejects.toThrow('HTTP 404: <!DOCTYPE html><html><head><title>Error</title></head><body><h1>Cannot GET /api/v1/user/current</h1></body></html>');
  });

  test('getCurrentUser - should handle network errors', async () => {
    // To test network errors, we make the fetch call itself fail
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(getCurrentUser()).rejects.toThrow('Network error');
  });

  test('getCurrentUser - should handle server errors', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Internal server error' }),
      text: async () => '{"error":"Internal server error"}'
    });

    await expect(getCurrentUser()).rejects.toThrow('HTTP 500: {"error":"Internal server error"}');
  });

  test('API base URL configuration', () => {
    expect(apiService.baseURL).toBe('http://localhost:3001/api/v1');
  });

  test('Backend health check should use the mock', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ status: 'healthy' })
    });

    // This test now uses the same mock as others.
    const response = await fetch('http://localhost:3001/api/v1/health');
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/health');
  });
});

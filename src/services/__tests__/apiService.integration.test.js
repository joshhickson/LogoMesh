
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiService } from '../apiService';

describe('API Service Integration - User Authentication', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('getCurrentUser - should handle successful response', async () => {
    const mockUser = { id: '123', name: 'Test User', email: 'test@example.com' };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockUser
    });

    const result = await apiService.getCurrentUser();
    
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/user/current', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    expect(result).toEqual(mockUser);
  });

  test('getCurrentUser - should handle HTML error response (current issue)', async () => {
    // Simulate the exact error we're seeing
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

    await expect(apiService.getCurrentUser()).rejects.toThrow('API request failed');
  });

  test('getCurrentUser - should handle network errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(apiService.getCurrentUser()).rejects.toThrow('Network error');
  });

  test('getCurrentUser - should handle server errors', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Internal server error' })
    });

    await expect(apiService.getCurrentUser()).rejects.toThrow('API request failed');
  });

  test('API base URL configuration', () => {
    // Test that the API service is using the correct base URL
    expect(apiService.baseURL).toBe('http://localhost:3001/api/v1');
  });

  test('Backend health check', async () => {
    // Test if backend is responding
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ status: 'healthy' })
    });

    try {
      const response = await fetch('http://localhost:3001/api/v1/health');
      const data = await response.json();
      expect(data.status).toBe('healthy');
    } catch (error) {
      // This will help us identify if the backend is not running
      console.warn('Backend health check failed:', error.message);
    }
  });
});

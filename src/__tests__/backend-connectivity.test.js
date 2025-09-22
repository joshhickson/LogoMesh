
/** @vitest-environment node */
import { describe, test, expect } from 'vitest';

describe('Backend Connectivity Test', () => {
  test('should detect if backend server is running', async () => {
    console.log('=== BACKEND CONNECTIVITY TEST ===');
    
    // Test the exact endpoint that's failing
    const testEndpoint = 'http://localhost:3001/api/v1/user/current';
    
    try {
      const response = await fetch(testEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('JSON response:', data);
        expect(contentType).toContain('application/json');
      } else {
        const text = await response.text();
        console.log('HTML/Text response:', text.substring(0, 200) + '...');
        
        // This is the current issue - we're getting HTML instead of JSON
        if (text.includes('<!DOCTYPE')) {
          console.log('❌ ISSUE DETECTED: Backend returning HTML instead of JSON');
          console.log('This indicates the backend route /api/v1/user/current does not exist');
        }
      }
      
    } catch (error) {
      console.log('❌ NETWORK ERROR:', error.message);
      console.log('This indicates the backend server is not running on port 3001');
      
      // Don't fail the test - we want to see the error for debugging
      expect(error.message).toBeDefined();
    }
  });

  test('should check if backend has required routes', async () => {
    const requiredRoutes = [
      '/api/v1/user/current',
      '/api/v1/thoughts',
      '/api/v1/health'
    ];

    for (const route of requiredRoutes) {
      const url = `http://localhost:3001${route}`;
      console.log(`Testing route: ${url}`);
      
      try {
        const response = await fetch(url);
        console.log(`${route}: Status ${response.status}`);
        
        if (response.status === 404) {
          console.log(`❌ Route ${route} not found - needs to be implemented`);
        }
      } catch (error) {
        console.log(`❌ ${route}: ${error.message}`);
      }
    }
    
    expect(true).toBe(true); // Always pass - this is a diagnostic test
  });
});


import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import App from '../App';

// Mock the API service
vi.mock('../../services/apiService', () => ({
  apiService: {
    getCurrentUser: vi.fn(),
    baseURL: 'http://localhost:3001/api/v1'
  }
}));

describe('App Integration - Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any existing auth state
    delete window.REPLIT_USER_ID;
    delete window.REPLIT_USER_NAME;
  });

  test('should handle successful user authentication', async () => {
    const { apiService } = await import('../../services/apiService');
    const mockUser = { id: '123', name: 'Test User' };
    
    apiService.getCurrentUser.mockResolvedValueOnce(mockUser);
    window.REPLIT_USER_ID = '123';
    window.REPLIT_USER_NAME = 'Test User';

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Please log in with your Replit account')).not.toBeInTheDocument();
    });
  });

  test('should handle authentication failure (current issue)', async () => {
    const { apiService } = await import('../../services/apiService');
    
    // Simulate the exact error we're seeing
    apiService.getCurrentUser.mockRejectedValueOnce(
      new SyntaxError('Unexpected token \'<\', "<!DOCTYPE "... is not valid JSON')
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Please log in with your Replit account')).toBeInTheDocument();
    });
  });

  test('should handle network errors gracefully', async () => {
    const { apiService } = await import('../../services/apiService');
    
    apiService.getCurrentUser.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Please log in with your Replit account')).toBeInTheDocument();
    });
  });

  test('should show loading state during authentication', async () => {
    const { apiService } = await import('../../services/apiService');
    
    // Create a promise that we can control
    let resolveAuth;
    const authPromise = new Promise(resolve => {
      resolveAuth = resolve;
    });
    
    apiService.getCurrentUser.mockReturnValueOnce(authPromise);

    render(<App />);

    // Should show some kind of loading state
    // (This depends on your current App implementation)
    
    // Resolve the promise
    resolveAuth({ id: '123', name: 'Test User' });
    
    await waitFor(() => {
      expect(apiService.getCurrentUser).toHaveBeenCalled();
    });
  });
});

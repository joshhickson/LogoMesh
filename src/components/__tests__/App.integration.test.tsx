/// <reference types="vitest" />
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import App from '../../App'; // Corrected path
import { authService, User } from '../../services/authService'; // Import authService
import '@testing-library/jest-dom';

// Mock authService
vi.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
  }
}));

// Mock apiService, specifically the methods App.jsx uses
vi.mock('../../services/apiService', () => ({
  fetchThoughts: vi.fn().mockResolvedValue([]), // App.jsx calls this
  // Add any other methods from apiService that App.jsx might directly call
  // For now, only fetchThoughts seems relevant for App.jsx initialization path
  createThought: vi.fn(), // placeholder if any test indirectly triggers it via App
  updateThought: vi.fn(), // placeholder
  // Note: baseURL is part of the actual apiService export, not a function to mock here unless tested directly
}));

vi.mock('../../components/Sidebar', () => ({
  default: () => <div data-testid="sidebar-mock"></div>,
}));

describe('App Integration - Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore actual implementations if modified globally or ensure mocks are clean
    // For example, if authService.getCurrentUser was modified directly in a test:
    // authService.getCurrentUser.mockRestore(); // if it was vi.spyOn(authService, 'getCurrentUser')
    // For vi.mock, it's typically reset by clearAllMocks or specific mockReset if needed.
    // Clear any existing auth state
    delete (window as any).REPLIT_USER_ID;
    delete (window as any).REPLIT_USER_NAME;
  });

  test('should handle successful user authentication', async () => {
    const mockUser: User = { id: '123', name: 'Test User', isAuthenticated: true }; // Add isAuthenticated

    (authService.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockUser);
    // window.REPLIT_USER_ID = '123'; // These might not be needed if service is mocked
    // window.REPLIT_USER_NAME = 'Test User';

    render(<App />);

    await waitFor(() => {
      // Check for an element that appears AFTER successful login
      // For example, if Sidebar appears:
      expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
    });
  });

  test('should handle authentication failure (current issue)', async () => {
    (authService.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null); // Simulate no user / auth failed

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Please log in with your Replit account/i)).toBeInTheDocument();
    });
  });

  test('should handle network errors gracefully', async () => {
    (authService.getCurrentUser as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Please log in with your Replit account/i)).toBeInTheDocument();
    });
  });

  test('should show loading state during authentication', async () => {
    // Create a promise that we can control
    let resolveAuth: (value: User | PromiseLike<User | null> | null) => void;
    const authPromise = new Promise<User | null>(resolve => {
      resolveAuth = resolve;
    });

    (authService.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValueOnce(authPromise); // Use authService

    render(<App />);

    // Example: Check for loading spinner if App renders one
    expect(screen.getByText(/Loading LogoMesh.../i)).toBeInTheDocument();

    // Resolve the promise
    resolveAuth!({ id: '123', name: 'Test User', isAuthenticated: true }); // Add isAuthenticated

    await waitFor(() => {
      expect(authService.getCurrentUser).toHaveBeenCalled();
      // Check for an element that appears AFTER successful login
      expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
    });
  });
});

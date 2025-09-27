// src/App.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';
import App from './App'; // The component we are testing
import * as apiService from './services/apiService'; // Import the service to mock its functions
import { Thought } from '../contracts/entities'; // Import types for our mock data
import '@testing-library/jest-dom';

// Mock all the child components to focus on App structure
vi.mock('./components/Sidebar', () => ({
  default: ({ thoughts }: { thoughts: Thought[] }) => (
    <div data-testid="sidebar-mock">
      Sidebar Component
      {thoughts.map(t => <div key={t.id}>{t.title}</div>)}
    </div>
  ),
}));

vi.mock('./components/Canvas', () => ({
  default: () => <div data-testid="canvas-mock">Canvas Component</div>
}));

vi.mock('./components/AddThoughtModal', () => ({
  default: () => <div data-testid="modal-mock">Add Thought Modal</div>
}));

vi.mock('./components/ThoughtDetailPanel', () => ({
  default: () => <div data-testid="detail-panel-mock">Detail Panel</div>
}));

vi.mock('./components/DevAssistantPanel', () => ({
  default: () => <div data-testid="dev-assistant-panel-mock">Dev Assistant Panel</div>
}));

vi.mock('./services/apiService', () => ({
  fetchThoughts: vi.fn(),
  createThoughtApi: vi.fn(),
  updateThoughtApi: vi.fn(),
  createSegmentApi: vi.fn(),
}));

vi.mock('./services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn().mockResolvedValue({ name: 'Test User', isAuthenticated: true }),
    isUserAuthenticated: vi.fn().mockReturnValue(true)
  }
}));

describe('App Component', () => {
  it('should fetch thoughts on mount and display them', async () => {
    const mockThoughts: Thought[] = [
      {
        id: 'tb_01',
        title: 'First Mocked Thought',
        description: 'This is a test from Vitest',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: [],
        segments: [],
      },
    ];

    (apiService.fetchThoughts as Mock).mockResolvedValue(mockThoughts);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('First Mocked Thought')).toBeInTheDocument();
    });

    expect(apiService.fetchThoughts).toHaveBeenCalledTimes(1);
  });

  it('should display an error message if fetching thoughts fails', async () => {
    (apiService.fetchThoughts as Mock).mockRejectedValue(new Error('Failed to fetch'));

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    await waitFor(() => {
        expect(errorSpy).toHaveBeenCalledWith('Failed to fetch thoughts:', expect.any(Error));
    });

    errorSpy.mockRestore();
  });
});
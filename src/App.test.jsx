import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

// Mock all the child components to focus on App structure
vi.mock('./components/Sidebar', () => ({
  default: () => <div data-testid="sidebar-mock">Sidebar Component</div>
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

vi.mock('./services/apiService', () => {
  const mockApiService = {
    fetchThoughts: vi.fn().mockResolvedValue([]),
    createThoughtApi: vi.fn().mockResolvedValue({}),
    updateThoughtApi: vi.fn().mockResolvedValue({}),
    deleteThoughtApi: vi.fn().mockResolvedValue({}),
    createSegmentApi: vi.fn().mockResolvedValue({}),
    updateSegmentApi: vi.fn().mockResolvedValue({}),
    deleteSegmentApi: vi.fn().mockResolvedValue({})
  };

  return {
    default: mockApiService,
    ...mockApiService
  };
});

test('renders main app components', () => {
  render(<App />);
  // Check that the main app structure renders with mocked components
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
  expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
});
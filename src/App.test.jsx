import { render, screen } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import App from './App';

vi.mock('./components/Canvas', () => {
  return {
    default: function MockCanvas() {
      return <div data-testid="canvas-mock" />;
    }
  };
});

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
  expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
});

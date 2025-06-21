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
  return {
    default: {
      getThoughts: vi.fn().mockResolvedValue([]),
      getBubbles: vi.fn().mockResolvedValue([])
    }
  };
});

test('renders main app components', () => {
  render(<App />);
  expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
});

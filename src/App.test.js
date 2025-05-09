import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/Canvas', () => {
  return function MockCanvas() {
    return <div data-testid="canvas-mock" />;
  };
});

test('renders main app components', () => {
  render(<App />);
  expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
});

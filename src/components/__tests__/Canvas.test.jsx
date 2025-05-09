import React from 'react';
import { render } from '@testing-library/react';
import Canvas from '../Canvas';

jest.mock('react-cytoscapejs');
jest.mock('cytoscape-cose-bilkent');

describe('Canvas', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<Canvas />);
    expect(getByTestId('cytoscape-mock')).toBeInTheDocument();
  });
});
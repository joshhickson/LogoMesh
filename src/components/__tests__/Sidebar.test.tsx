import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Sidebar from '../Sidebar';
import { Thought } from '../../contracts/entities';
import { User } from '../../services/authService';

describe('Sidebar', () => {
  const mockThoughts: Thought[] = [
    {
      id: '1',
      title: 'Philosophy Thought',
      userId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'AI Thought',
      userId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockUser: User = { id: 'user-1', name: 'Test User' };

  const mockProps = {
    thoughts: mockThoughts,
    user: mockUser,
    onCreateThought: vi.fn(),
    onClusterThoughts: vi.fn(),
    onShowDevAssistant: vi.fn(),
    onSelectThought: vi.fn(),
    activeThought: null,
    clusters: [],
    activeCluster: null,
    onClusterClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders user name and thoughts', () => {
    render(<Sidebar {...mockProps} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Philosophy Thought')).toBeInTheDocument();
    expect(screen.getByText('AI Thought')).toBeInTheDocument();
  });

  test('calls onCreateThought when "Add New Thought" is clicked', () => {
    render(<Sidebar {...mockProps} />);
    fireEvent.click(screen.getByText('Add New Thought'));
    expect(mockProps.onCreateThought).toHaveBeenCalledTimes(1);
  });

  test('calls onClusterThoughts when "Toggle Cluster View" is clicked', () => {
    render(<Sidebar {...mockProps} />);
    fireEvent.click(screen.getByTestId('toggle-cluster-view-btn'));
    expect(mockProps.onClusterThoughts).toHaveBeenCalledTimes(1);
  });

  test('calls onShowDevAssistant when the dev assistant button is clicked', () => {
    render(<Sidebar {...mockProps} />);
    fireEvent.click(screen.getByTitle('Toggle Dev Assistant'));
    expect(mockProps.onShowDevAssistant).toHaveBeenCalledTimes(1);
  });

  test('calls onSelectThought when a thought is clicked', () => {
    render(<Sidebar {...mockProps} />);
    fireEvent.click(screen.getByText('AI Thought'));
    expect(mockProps.onSelectThought).toHaveBeenCalledWith(mockThoughts[1]);
  });
});
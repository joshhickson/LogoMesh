
import { render, screen, fireEvent } from '@testing-library/react';
import AddThoughtModal from '../AddThoughtModal';

describe('AddThoughtModal', () => {
  const mockSetShowModal = jest.fn();
  const mockAddThought = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all form elements', () => {
    render(<AddThoughtModal setShowModal={mockSetShowModal} addThought={mockAddThought} />);
    
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Main Tag')).toBeInTheDocument();
  });

  test('creates thought with correct structure', () => {
    render(<AddThoughtModal setShowModal={mockSetShowModal} addThought={mockAddThought} />);
    
    const titleInput = screen.getByPlaceholderText('Title');
    fireEvent.change(titleInput, { target: { value: 'Test Thought' } });
    
    const submitButton = screen.getByText(/Add New Thought/i);
    fireEvent.click(submitButton);
    
    expect(mockAddThought).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Thought',
        thought_bubble_id: expect.any(String),
        segments: expect.any(Array)
      })
    );
  });
});

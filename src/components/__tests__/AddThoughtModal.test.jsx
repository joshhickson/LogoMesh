
import { render, screen, fireEvent } from '@testing-library/react';
import AddThoughtModal from '../AddThoughtModal';

describe('AddThoughtModal', () => {
  const mockCreateThought = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all form elements', () => {
    render(<AddThoughtModal createThought={mockCreateThought} onClose={mockOnClose} />);
    
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add Tag')).toBeInTheDocument();
    expect(screen.getByText('+ Add Segment')).toBeInTheDocument();
  });

  test('validates title before submission', () => {
    render(<AddThoughtModal createThought={mockCreateThought} onClose={mockOnClose} />);
    
    const submitButton = screen.getByText('Add Thought');
    fireEvent.click(submitButton);
    
    expect(mockCreateThought).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Please enter a title for your thought.');
  });

  test('adds and updates segments', () => {
    render(<AddThoughtModal createThought={mockCreateThought} onClose={mockOnClose} />);
    
    const addSegmentButton = screen.getByText('+ Add Segment');
    fireEvent.click(addSegmentButton);
    
    const segmentTitle = screen.getByPlaceholderText('Segment Title');
    const segmentContent = screen.getByPlaceholderText('Segment Content');
    
    fireEvent.change(segmentTitle, { target: { value: 'Test Segment' } });
    fireEvent.change(segmentContent, { target: { value: 'Test Content' } });
    
    expect(segmentTitle.value).toBe('Test Segment');
    expect(segmentContent.value).toBe('Test Content');
  });

  test('handles tag addition', () => {
    render(<AddThoughtModal createThought={mockCreateThought} onClose={mockOnClose} />);
    
    const tagInput = screen.getByPlaceholderText('Add Tag');
    fireEvent.change(tagInput, { target: { value: 'test-tag' } });
    fireEvent.change(tagInput, { target: { value: '' } });
    
    expect(screen.getByText('test-tag')).toBeInTheDocument();
  });

  test('creates thought with correct data structure', () => {
    render(<AddThoughtModal createThought={mockCreateThought} onClose={mockOnClose} />);
    
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Test Description' } });
    
    const addSegmentButton = screen.getByText('+ Add Segment');
    fireEvent.click(addSegmentButton);
    
    const submitButton = screen.getByText('Add Thought');
    fireEvent.click(submitButton);
    
    expect(mockCreateThought).toHaveBeenCalledWith(
      expect.objectContaining({
        thought_bubble_id: expect.any(String),
        title: 'Test Title',
        description: 'Test Description',
        segments: expect.arrayContaining([
          expect.objectContaining({
            segment_id: expect.any(String),
            title: '',
            content: '',
            fields: {}
          })
        ])
      })
    );
    expect(mockOnClose).toHaveBeenCalled();
  });
});

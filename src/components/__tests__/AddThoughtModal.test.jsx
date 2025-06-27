import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import AddThoughtModal from '../AddThoughtModal';

// Mock VoiceInputManager
vi.mock('../../utils/VoiceInputManager', () => {
  // Default mock implementation
  const mockVoiceInputManager = vi.fn().mockImplementation(function() {
    this.isSupported = () => 'webkitSpeechRecognition' in window; // Reflect actual window state
    this.startListening = vi.fn();
    this.stopListening = vi.fn();
    // Add other methods/properties if component interacts with them
    this.recognition = { continuous: false, interimResults: false, lang: '', onresult: null, onerror: null, onend: null, onstart: null };
    return this;
  });
  return { VoiceInputManager: mockVoiceInputManager };
});

// Mock ulid
vi.mock('ulid', () => ({
  ulid: () => 'test-ulid-123',
}));

describe('AddThoughtModal', () => {
  const mockCreateThought = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders modal with title input', () => {
    render(
      <AddThoughtModal
        createThought={mockCreateThought}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
  });

  test('renders Add Thought button', () => {
    render(
      <AddThoughtModal
        createThought={mockCreateThought}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Add Thought')).toBeInTheDocument();
  });
  test('renders all form elements', () => {
    const mockCreateThought = vi.fn();
    const mockOnClose = vi.fn();
    render(
      <AddThoughtModal
        createThought={mockCreateThought}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add Tag')).toBeInTheDocument();
    expect(screen.getByText('+ Add Segment')).toBeInTheDocument();
  });

  test('validates title before submission', () => {
    const mockCreateThought = vi.fn();
    const mockOnClose = vi.fn();
    render(
      <AddThoughtModal
        createThought={mockCreateThought}
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByText('Add Thought');
    fireEvent.click(submitButton);

    expect(mockCreateThought).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      'Please enter a title for your thought.'
    );
  });

  test('adds and updates segments', () => {
    const mockCreateThought = vi.fn();
    const mockOnClose = vi.fn();
    render(
      <AddThoughtModal
        createThought={mockCreateThought}
        onClose={mockOnClose}
      />
    );

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
    const mockCreateThought = vi.fn();
    const mockOnClose = vi.fn();
    render(
      <AddThoughtModal
        createThought={mockCreateThought}
        onClose={mockOnClose}
      />
    );

    const tagInput = screen.getByPlaceholderText('Add Tag');
    fireEvent.change(tagInput, { target: { value: 'test-tag' } });
    fireEvent.change(tagInput, { target: { value: '' } });

    expect(screen.getByText('test-tag')).toBeInTheDocument();
  });

  test('creates thought with correct data structure', () => {
    const mockCreateThought = vi.fn();
    const mockOnClose = vi.fn();
    render(
      <AddThoughtModal
        createThought={mockCreateThought}
        onClose={mockOnClose}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Title'), {
      target: { value: 'Test Title' },
    });
    fireEvent.change(screen.getByPlaceholderText('Description'), {
      target: { value: 'Test Description' },
    });

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
            fields: {},
          }),
        ]),
      })
    );
    expect(mockOnClose).toHaveBeenCalled();
  });
});
test('handles voice input correctly', () => {
  const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
  // Setup speech recognition mock before render
  const mockRecognition = {
    start: vi.fn(),
    stop: vi.fn(),
    onresult: null,
    onerror: null,
    continuous: false,
    interimResults: false,
  };

  Object.defineProperty(window, 'webkitSpeechRecognition', {
    value: vi.fn(() => mockRecognition),
    configurable: true,
    writable: true
  });

  const mockCreateThought = vi.fn();
  const mockOnClose = vi.fn();
  const { getByTitle, getByPlaceholderText } = render(
    <AddThoughtModal createThought={mockCreateThought} onClose={mockOnClose} />
  );

  const micButton = getByTitle('Start recording');
  const description = getByPlaceholderText('Description');

  // Test start recording
  fireEvent.click(micButton);
  expect(
    screen.getByText('Listening... Click microphone to stop')
  ).toBeInTheDocument();

  // Test transcript update
  const voiceInput = 'Voice input test';
  fireEvent.change(description, { target: { value: voiceInput } });
  expect(description.value).toBe(voiceInput);

  // Test stop recording
  fireEvent.click(micButton);
  expect(
    screen.queryByText('Listening... Click microphone to stop')
  ).not.toBeInTheDocument();

  // Test browser support error
  delete window.webkitSpeechRecognition;
  fireEvent.click(micButton);
  expect(window.alert).toHaveBeenCalledWith(
    'Speech recognition is not supported in your browser'
  );
});
test('handles voice input integration', () => {
    // Remove speech recognition support to trigger alert *before* component renders
    delete window.webkitSpeechRecognition;

    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const mockCreateThought = vi.fn();
    const mockOnClose = vi.fn();
    render(<AddThoughtModal createThought={mockCreateThought} onClose={mockOnClose} />);

    // Look for the microphone button by its title attribute
    const voiceButton = screen.getByTitle('Start recording');
    fireEvent.click(voiceButton);

    // Should trigger alert for unsupported browser
    expect(mockAlert).toHaveBeenCalledWith('Speech recognition is not supported in your browser');
  });
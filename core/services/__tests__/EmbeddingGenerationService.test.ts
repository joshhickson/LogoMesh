import { describe, test, expect, beforeEach, vi } from 'vitest';
import { EmbeddingGenerationService } from '../EmbeddingGenerationService';
import { EventBus } from '../eventBus';
import { StorageAdapter } from '../../../contracts/storageAdapter';
import { ContextualEmbeddingInterface } from '../../../contracts/embeddings/embeddingInterface';
import { Thought } from '../../../contracts/entities';

// Mocks for the dependencies
const mockStorage: StorageAdapter = {
  getSegmentsForThought: vi.fn(),
  updateThought: vi.fn(),
  // Add other methods as needed, or cast to any if you want to be less strict
} as any;

const mockEmbeddingProvider: ContextualEmbeddingInterface = {
  toVector: vi.fn(),
} as any;


describe('EmbeddingGenerationService', () => {
  let eventBus: EventBus;
  let service: EmbeddingGenerationService;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create a new event bus for each test to ensure isolation
    eventBus = new EventBus();

    // Instantiate the service with mocked dependencies
    service = new EmbeddingGenerationService(
      eventBus,
      mockStorage,
      mockEmbeddingProvider
    );

    // Start the service to attach listeners
    service.start();
  });

  test('should generate and save embedding on thought.created event', async () => {
    // 1. Arrange
    const mockThought: Thought = {
      thought_bubble_id: 't1',
      title: 'Test Title',
      description: 'Test description content.',
      created_at: new Date(),
      updated_at: new Date(),
      tags: [],
      segments: [],
    };
    const mockUserId = 'user-123';
    const mockEmbedding = [0.1, 0.2, 0.3];

    (mockStorage.getSegmentsForThought as vi.Mock).mockResolvedValue([]);
    (mockEmbeddingProvider.toVector as vi.Mock).mockResolvedValue(mockEmbedding);
    (mockStorage.updateThought as vi.Mock).mockResolvedValue({ ...mockThought, embedding: mockEmbedding });

    // 2. Act
    // Emit the event to trigger the service's handler
    eventBus.emit('thought.created', { thought: mockThought, userId: mockUserId });

    // 3. Assert
    // Give promises a chance to resolve
    await new Promise(process.nextTick);

    // Check that the correct content was used for embedding
    const expectedContent = `Title: ${mockThought.title}\n\n---\n\nDescription: ${mockThought.description}`;
    expect(mockEmbeddingProvider.toVector).toHaveBeenCalledWith(expectedContent);

    // Check that the thought was updated in storage with the new embedding
    expect(mockStorage.updateThought).toHaveBeenCalledWith(
      't1',
      { embedding: mockEmbedding },
      mockUserId
    );
  });

  test('should aggregate segment content for embedding on thought.updated event', async () => {
    // 1. Arrange
    const mockThought: Thought = {
      thought_bubble_id: 't1',
      title: 'Main Idea',
      description: 'This is the core concept.',
      created_at: new Date(),
      updated_at: new Date(),
      tags: [],
      segments: [], // Segments are fetched, so this can be empty
    };
    const mockSegments = [
      { content: 'First supporting point.' },
      { content: 'Second supporting point.' },
    ];
    const mockUserId = 'user-456';
    const mockEmbedding = [0.4, 0.5, 0.6];

    (mockStorage.getSegmentsForThought as vi.Mock).mockResolvedValue(mockSegments);
    (mockEmbeddingProvider.toVector as vi.Mock).mockResolvedValue(mockEmbedding);
    (mockStorage.updateThought as vi.Mock).mockResolvedValue({ ...mockThought, embedding: mockEmbedding });

    // 2. Act
    eventBus.emit('thought.updated', { thought: mockThought, userId: mockUserId });

    // 3. Assert
    await new Promise(process.nextTick);

    expect(mockStorage.getSegmentsForThought).toHaveBeenCalledWith('t1', mockUserId);

    const expectedContent = `Title: ${mockThought.title}\n\n---\n\nDescription: ${mockThought.description}\n\n---\n\n${mockSegments[0].content}\n\n---\n\n${mockSegments[1].content}`;
    expect(mockEmbeddingProvider.toVector).toHaveBeenCalledWith(expectedContent);

    expect(mockStorage.updateThought).toHaveBeenCalledWith(
      't1',
      { embedding: mockEmbedding },
      mockUserId
    );
  });

  test('should not generate embedding if content is empty', async () => {
    // 1. Arrange
    const mockThought: Thought = {
      thought_bubble_id: 't1',
      title: '', // No title
      description: '', // No description
      created_at: new Date(),
      updated_at: new Date(),
      tags: [],
      segments: [],
    };
    const mockUserId = 'user-789';

    (mockStorage.getSegmentsForThought as vi.Mock).mockResolvedValue([]);

    // 2. Act
    eventBus.emit('thought.created', { thought: mockThought, userId: mockUserId });

    // 3. Assert
    await new Promise(process.nextTick);

    expect(mockEmbeddingProvider.toVector).not.toHaveBeenCalled();
    expect(mockStorage.updateThought).not.toHaveBeenCalled();
  });
});

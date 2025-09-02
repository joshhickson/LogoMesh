import { EventBus } from './eventBus';
import { StorageAdapter } from '../../contracts/storageAdapter';
import { ContextualEmbeddingInterface } from '../../contracts/embeddings/embeddingInterface';
import { Thought } from '../../contracts/entities';
import { logger } from '../utils/logger';

/**
 * A service that listens for thought events and automatically
 * generates and saves embeddings for them.
 */
export class EmbeddingGenerationService {
  private eventBus: EventBus;
  private storage: StorageAdapter;
  private embeddingProvider: ContextualEmbeddingInterface;

  constructor(
    eventBus: EventBus,
    storage: StorageAdapter,
    embeddingProvider: ContextualEmbeddingInterface
  ) {
    this.eventBus = eventBus;
    this.storage = storage;
    this.embeddingProvider = embeddingProvider;
  }

  /**
   * Starts the service by subscribing to relevant events.
   */
  public start(): void {
    this.eventBus.on<Thought>('thought.created', this.handleThoughtChange.bind(this));
    this.eventBus.on<Thought>('thought.updated', this.handleThoughtChange.bind(this));
    logger.info('[EmbeddingGenerationService] Started and listening for thought events.');
  }

  /**
   * Stops the service by unsubscribing from events.
   */
  public stop(): void {
    this.eventBus.off<Thought>('thought.created', this.handleThoughtChange.bind(this));
    this.eventBus.off<Thought>('thought.updated', this.handleThoughtChange.bind(this));
    logger.info('[EmbeddingGenerationService] Stopped.');
  }

  /**
   * Handles a thought creation or update event by generating a comprehensive
   * embedding from the thought's title, description, and all its segments.
   * @param thought The thought that was created or updated.
   */
  private async handleThoughtChange(thought: Thought): Promise<void> {
    if (!thought || !thought.thought_bubble_id) {
      logger.warn('[EmbeddingGenerationService] Received an invalid thought event.', { thought });
      return;
    }

    logger.info(`[EmbeddingGenerationService] Processing thought ${thought.thought_bubble_id} for embedding generation.`);

    try {
      // We need the user ID, which is not in the event payload. Using a placeholder.
      // TODO: Pass userId in the event payload from IdeaManager.
      const userId = 'anonymous';

      // 1. Fetch all segments for the thought
      const segments = await this.storage.getSegmentsForThought(thought.thought_bubble_id, userId);

      // 2. Aggregate content from thought and its segments
      const contentParts: string[] = [];
      if (thought.title) {
        contentParts.push(`Title: ${thought.title}`);
      }
      if (thought.description) {
        contentParts.push(`Description: ${thought.description}`);
      }
      segments.forEach(segment => {
        if (segment.content) {
          contentParts.push(segment.content);
        }
      });

      const aggregatedContent = contentParts.join('\n\n---\n\n');

      if (!aggregatedContent) {
        logger.debug(`[EmbeddingGenerationService] Thought ${thought.thought_bubble_id} has no aggregate content to embed. Skipping.`);
        return;
      }

      // 3. Generate embedding from the aggregated content
      const embedding = await this.embeddingProvider.toVector(aggregatedContent);

      if (!embedding || embedding.length === 0) {
        logger.warn(`[EmbeddingGenerationService] Embedding provider returned an empty embedding for thought ${thought.thought_bubble_id}.`);
        return;
      }

      // 4. Save the new embedding to the database
      await this.storage.updateThought(thought.thought_bubble_id, { embedding }, userId);
      logger.info(`[EmbeddingGenerationService] Successfully generated and saved enhanced embedding for thought ${thought.thought_bubble_id}.`);

    } catch (error) {
      logger.error(`[EmbeddingGenerationService] Failed to process thought ${thought.thought_bubble_id}:`, error);
    }
  }
}

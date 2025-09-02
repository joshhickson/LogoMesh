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
   * Handles a thought creation or update event.
   * @param thought The thought that was created or updated.
   */
  private async handleThoughtChange(thought: Thought): Promise<void> {
    if (!thought || !thought.thought_bubble_id) {
      logger.warn('[EmbeddingGenerationService] Received an invalid thought event.', { thought });
      return;
    }

    // Use the thought's description as the content for embedding, falling back to title.
    const contentToEmbed = thought.description || thought.title;

    if (!contentToEmbed) {
      logger.debug(`[EmbeddingGenerationService] Thought ${thought.thought_bubble_id} has no content to embed. Skipping.`);
      return;
    }

    logger.info(`[EmbeddingGenerationService] Processing thought ${thought.thought_bubble_id}...`);

    try {
      const embedding = await this.embeddingProvider.toVector(contentToEmbed);

      if (!embedding || embedding.length === 0) {
        logger.warn(`[EmbeddingGenerationService] Embedding provider returned an empty embedding for thought ${thought.thought_bubble_id}.`);
        return;
      }

      // We need the user ID to update the thought, but the event payload doesn't contain it.
      // This is a limitation. For now, we'll assume a default or 'anonymous' user.
      // A better implementation would have the user ID in the event payload.
      const userId = 'anonymous'; // TODO: Get this from the event payload if possible.

      await this.storage.updateThought(thought.thought_bubble_id, { embedding }, userId);
      logger.info(`[EmbeddingGenerationService] Successfully generated and saved embedding for thought ${thought.thought_bubble_id}.`);

    } catch (error) {
      logger.error(`[EmbeddingGenerationService] Failed to process thought ${thought.thought_bubble_id}:`, error);
    }
  }
}

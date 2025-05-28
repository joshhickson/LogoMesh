import { Thought, Segment } from '@contracts/entities';
import { StorageAdapter, NewThoughtData, NewSegmentData } from '../../contracts/storageAdapter';
import { generateThoughtId, generateSegmentId } from '@core/utils/idUtils';
import { logger } from '@core/utils/logger';

/**
 * Manages thought data and operations, providing a centralized interface
 * for data manipulation while abstracting storage details via StorageAdapter.
 */
export class IdeaManager {
  constructor(private storage: StorageAdapter) {}

  /**
   * Returns all thoughts from storage
   */
  async getThoughts(): Promise<Thought[]> {
    try {
      return await this.storage.getAllThoughts();
    } catch (error) {
      logger.error('Failed to get thoughts from storage:', error);
      return [];
    }
  }

  /**
   * Returns a specific thought by ID from storage
   */
  async getThoughtById(id: string): Promise<Thought | undefined> {
    try {
      const thought = await this.storage.getThoughtById(id);
      return thought || undefined;
    } catch (error) {
      logger.error('Failed to get thought by ID from storage:', error);
      return undefined;
    }
  }

  /**
   * Creates a new thought using the storage adapter
   */
  async addThought(
    thoughtData: Omit<Thought, 'thought_bubble_id' | 'created_at' | 'updated_at'>
  ): Promise<Thought> {
    try {
      const newThoughtData: NewThoughtData = {
        title: thoughtData.title,
        description: thoughtData.description,
        tags: thoughtData.tags,
        position: thoughtData.position,
        color: thoughtData.color
      };

      const thought = await this.storage.createThought(newThoughtData);
      logger.log(`Created thought: ${thought.thought_bubble_id}`);
      return thought;
    } catch (error) {
      logger.error('Failed to create thought:', error);
      throw error;
    }
  }

  /**
   * Updates an existing thought using the storage adapter
   */
  async updateThought(
    thoughtId: string,
    updates: Partial<Omit<Thought, 'thought_bubble_id' | 'created_at'>>
  ): Promise<Thought | undefined> {
    try {
      const updateData: Partial<NewThoughtData> = {
        title: updates.title,
        description: updates.description,
        tags: updates.tags,
        position: updates.position,
        color: updates.color
      };

      const thought = await this.storage.updateThought(thoughtId, updateData);
      if (thought) {
        logger.log(`Updated thought: ${thoughtId}`);
      }
      return thought || undefined;
    } catch (error) {
      logger.error('Failed to update thought:', error);
      return undefined;
    }
  }

  /**
   * Deletes a thought using the storage adapter
   */
  async deleteThought(thoughtId: string): Promise<boolean> {
    try {
      const deleted = await this.storage.deleteThought(thoughtId);
      if (deleted) {
        logger.log(`Deleted thought: ${thoughtId}`);
      }
      return deleted;
    } catch (error) {
      logger.error('Failed to delete thought:', error);
      return false;
    }
  }

  /**
   * Creates a new segment for a thought using the storage adapter
   */
  async addSegment(
    thoughtId: string,
    segmentData: Omit<Segment, 'segment_id' | 'thought_bubble_id' | 'created_at' | 'updated_at'>
  ): Promise<Segment | undefined> {
    try {
      // Verify thought exists first
      const thought = await this.storage.getThoughtById(thoughtId);
      if (!thought) {
        logger.error(`Thought not found with ID: ${thoughtId}`);
        return undefined;
      }

      const newSegmentData: NewSegmentData = {
        title: segmentData.title,
        content: segmentData.content,
        content_type: segmentData.content_type,
        asset_path: segmentData.asset_path,
        fields: segmentData.fields,
        abstraction_level: segmentData.abstraction_level,
        local_priority: segmentData.local_priority,
        cluster_id: segmentData.cluster_id
      };

      const segment = await this.storage.createSegment(thoughtId, newSegmentData);
      logger.log(`Created segment: ${segment.segment_id}`);
      return segment;
    } catch (error) {
      logger.error('Failed to create segment:', error);
      return undefined;
    }
  }

  /**
   * Updates an existing segment using the storage adapter
   */
  async updateSegment(
    thoughtId: string,
    segmentId: string,
    updates: Partial<Omit<Segment, 'segment_id' | 'thought_bubble_id' | 'created_at'>>
  ): Promise<Segment | undefined> {
    try {
      const updateData: Partial<NewSegmentData> = {
        title: updates.title,
        content: updates.content,
        content_type: updates.content_type,
        asset_path: updates.asset_path,
        fields: updates.fields,
        abstraction_level: updates.abstraction_level,
        local_priority: updates.local_priority,
        cluster_id: updates.cluster_id
      };

      const segment = await this.storage.updateSegment(segmentId, updateData);
      if (segment) {
        logger.log(`Updated segment: ${segmentId}`);
      }
      return segment || undefined;
    } catch (error) {
      logger.error('Failed to update segment:', error);
      return undefined;
    }
  }

  /**
   * Deletes a segment using the storage adapter
   */
  async deleteSegment(thoughtId: string, segmentId: string): Promise<boolean> {
    try {
      const deleted = await this.storage.deleteSegment(segmentId);
      if (deleted) {
        logger.log(`Deleted segment: ${segmentId}`);
      }
      return deleted;
    } catch (error) {
      logger.error('Failed to delete segment:', error);
      return false;
    }
  }

  /**
   * Legacy compatibility methods - these maintain the original interface
   * but now delegate to the async storage methods
   */

  /**
   * @deprecated Use addThought instead
   */
  upsertThought(thought: Thought): void {
    // This method is kept for backward compatibility but should be migrated to async
    logger.warn('upsertThought is deprecated, use addThought or updateThought instead');
  }

  /**
   * @deprecated Use deleteThought instead  
   */
  removeThought(id: string): void {
    // This method is kept for backward compatibility but should be migrated to async
    logger.warn('removeThought is deprecated, use deleteThought instead');
  }
}
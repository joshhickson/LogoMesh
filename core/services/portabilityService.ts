import { ThoughtExportProvider, SemanticCompressionOptions } from '../../contracts/thoughtExportProvider';
import { StorageAdapter } from '../../contracts/storageAdapter';
import { logger } from '../utils/logger';

export class PortabilityService implements ThoughtExportProvider {
  constructor(private storage: StorageAdapter) {}

  /**
   * Export all data from the storage adapter with optional semantic compression
   */
  async exportData(options?: any): Promise<any> {
    try {
      logger.info('Starting data export...');

      const thoughts = await this.storage.getAllThoughts();

      let processedThoughts = thoughts;

      // Apply semantic compression options if provided
      if (options) {
        processedThoughts = await this.applySemanticCompression(thoughts, options);
      }

      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          compressionOptions: options
        },
        thoughts: processedThoughts,
      };

      logger.info(`Successfully exported ${processedThoughts.length} thoughts (original: ${thoughts.length})`);
      return exportData;
    } catch (error) {
      logger.error('Error during data export:', error);
      throw error;
    }
  }

  /**
   * Apply semantic compression based on provided options
   * Stub implementation for CCE integration in future phases
   */
  private async applySemanticCompression(thoughts: any[], options: any): Promise<any[]> {
    logger.info('Applying semantic compression to export data');

    let filteredThoughts = [...thoughts];

    // Apply abstraction level filter
    if (options.abstractionLevelFilter && options.abstractionLevelFilter.length > 0) {
      filteredThoughts = filteredThoughts.filter(thought => 
        options.abstractionLevelFilter.includes(thought.abstraction_level || 'default')
      );
      logger.debug(`Filtered by abstraction level: ${filteredThoughts.length} thoughts remain`);
    }

    // Apply local priority threshold
    if (options.localPriorityThreshold !== undefined) {
      filteredThoughts = filteredThoughts.filter(thought => 
        (thought.local_priority || 0.5) >= options.localPriorityThreshold
      );
      logger.debug(`Filtered by priority threshold: ${filteredThoughts.length} thoughts remain`);
    }

    // Apply cluster filter
    if (options.clusterIdFilter && options.clusterIdFilter.length > 0) {
      filteredThoughts = filteredThoughts.filter(thought => 
        options.clusterIdFilter.includes(thought.cluster_id || 'default')
      );
      logger.debug(`Filtered by cluster ID: ${filteredThoughts.length} thoughts remain`);
    }

    // Apply depth limitation (mock implementation)
    if (options.maxDepth !== undefined) {
      // In future phases, this would traverse the graph to the specified depth
      logger.debug(`Would apply max depth ${options.maxDepth} in future implementation`);
    }

    return filteredThoughts;
  }

  async exportThought(thoughtId: string, options?: SemanticCompressionOptions): Promise<any> {
    try {
      logger.info(`[PortabilityService] Exporting thought ${thoughtId} with options:`, options);

      const thought = await this.storage.getThoughtById(thoughtId);
      if (!thought) {
        throw new Error(`Thought with ID ${thoughtId} not found`);
      }

      // Apply semantic compression options to single thought
      const processedThought = { ...thought };

      if (options?.maxDepth !== undefined) {
        processedThought.segments = thought.segments?.slice(0, options.maxDepth || 10);
      }

      return {
        metadata: {
          exportDate: new Date().toISOString(),
          thoughtId,
          compressionOptions: options
        },
        thought: processedThought
      };
    } catch (error) {
      logger.error('[PortabilityService] Error exporting thought:', error);
      throw error;
    }
  }

  async exportCluster(clusterId: string, options?: SemanticCompressionOptions): Promise<any> {
    try {
      logger.info(`[PortabilityService] Exporting cluster ${clusterId} with options:`, options);

      const allThoughts = await this.storage.getAllThoughts();
      const clusterThoughts = allThoughts.filter(thought => 
        thought.tags?.some(tag => tag.name === clusterId) // Corrected check
      );

      return {
        metadata: {
          exportDate: new Date().toISOString(),
          clusterId,
          compressionOptions: options
        },
        thoughts: clusterThoughts
      };
    } catch (error) {
      logger.error('[PortabilityService] Error exporting cluster:', error);
      throw error;
    }
  }

  async importData(jsonData: any): Promise<void> {
    logger.info('Starting data import');

    try {
      // Validate the import data structure
      if (!jsonData || !jsonData.thoughts || !Array.isArray(jsonData.thoughts)) {
        throw new Error('Invalid import data: missing or malformed thoughts array');
      }

      let importedThoughts = 0;
      let importedSegments = 0;

      // Import each thought
      for (const thoughtData of jsonData.thoughts) {
        try {
          // Check if thought already exists
          const existingThought = await this.storage.getThoughtById(thoughtData.thought_bubble_id);

          if (existingThought) {
            logger.warn(`Thought ${thoughtData.thought_bubble_id} already exists, skipping`);
            continue;
          }

          // Prepare thought data for creation
          const newThoughtData = {
            title: thoughtData.title || 'Imported Thought',
            description: thoughtData.description || '',
            tags: thoughtData.tags || [],
            position: thoughtData.position || { x: 0, y: 0 },
            created_at: thoughtData.created_at || new Date().toISOString(),
            updated_at: thoughtData.updated_at || new Date().toISOString()
          };

          // Create the thought
          const createdThought = await this.storage.createThought(newThoughtData);
          importedThoughts++;

          // Import segments if they exist
          if (thoughtData.segments && Array.isArray(thoughtData.segments)) {
            for (const segmentData of thoughtData.segments) {
              try {
                const newSegmentData = {
                  title: segmentData.title || 'Imported Segment',
                  content: segmentData.content || '',
                  tags: segmentData.tags || [],
                  abstraction_level: segmentData.abstraction_level || 'detail',
                  created_at: segmentData.created_at || new Date().toISOString(),
                  updated_at: segmentData.updated_at || new Date().toISOString()
                };

                await this.storage.createSegment(createdThought.thought_bubble_id, newSegmentData);
                importedSegments++;
              } catch (segmentError) {
                logger.warn(`Failed to import segment: ${segmentError instanceof Error ? segmentError.message : 'Unknown error'}`);
              }
            }
          }
        } catch (thoughtError) {
          logger.warn(`Failed to import thought ${thoughtData.thought_bubble_id}: ${thoughtError instanceof Error ? thoughtError.message : 'Unknown error'}`);
        }
      }

      logger.info(`Successfully imported ${importedThoughts} thoughts and ${importedSegments} segments`);
    } catch (error) {
      logger.error('Error during data import:', error);
      throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
import { ThoughtExportProvider, SemanticCompressionOptions } from '../../contracts/thoughtExportProvider';
import { StorageAdapter } from '../../contracts/storageAdapter';
import { logger } from '../../src/core/utils/logger';

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
      let processedThought = { ...thought };

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
        thought.tags?.includes(clusterId)
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
}
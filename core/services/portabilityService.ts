
import { ThoughtExportProvider, SemanticCompressionOptions } from '../../contracts/thoughtExportProvider';
import { StorageAdapter } from '../../contracts/storageAdapter';
import { logger } from '../utils/logger';
import { 
  ExportData, 
  ExportMetadata, 
  ThoughtData, 
  SegmentData, 
  ServiceResponse,
  ServiceError
} from '../../contracts/types';

export class PortabilityService implements ThoughtExportProvider {
  constructor(private storage: StorageAdapter) {}

  /**
   * Export all data from the storage adapter with optional semantic compression
   */
  async exportData(options?: SemanticCompressionOptions): Promise<ServiceResponse<ExportData>> {
    try {
      logger.info('Starting data export...');

      const thoughts = await this.storage.getAllThoughts();

      let processedThoughts = thoughts;

      // Apply semantic compression options if provided
      if (options) {
        processedThoughts = await this.applySemanticCompression(thoughts, options);
      }

      const exportData: ExportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          compressionOptions: options,
          thoughtCount: processedThoughts.length,
          segmentCount: processedThoughts.reduce((total, thought) => 
            total + (thought.segments?.length || 0), 0)
        },
        thoughts: processedThoughts,
      };

      logger.info(`Successfully exported ${processedThoughts.length} thoughts (original: ${thoughts.length})`);
      
      return {
        success: true,
        data: exportData,
        metadata: {
          originalCount: thoughts.length,
          exportedCount: processedThoughts.length
        }
      };
    } catch (error) {
      const serviceError: ServiceError = {
        code: 'EXPORT_FAILED',
        message: error instanceof Error ? error.message : 'Unknown export error',
        timestamp: new Date().toISOString(),
        details: { error }
      };
      
      logger.error('Error during data export:', error);
      
      return {
        success: false,
        error: serviceError
      };
    }
  }

  /**
   * Apply semantic compression based on provided options
   * Stub implementation for CCE integration in future phases
   */
  private async applySemanticCompression(
    thoughts: ThoughtData[], 
    options: SemanticCompressionOptions
  ): Promise<ThoughtData[]> {
    logger.info('Applying semantic compression to export data');

    let filteredThoughts = [...thoughts];

    // Apply abstraction level filter
    if (options.abstractionLevelFilter && options.abstractionLevelFilter.length > 0) {
      filteredThoughts = filteredThoughts.filter(thought => 
        options.abstractionLevelFilter!.includes(thought.abstraction_level || 'default')
      );
      logger.debug(`Filtered by abstraction level: ${filteredThoughts.length} thoughts remain`);
    }

    // Apply local priority threshold
    if (options.localPriorityThreshold !== undefined) {
      filteredThoughts = filteredThoughts.filter(thought => 
        (thought.local_priority || 0.5) >= options.localPriorityThreshold!
      );
      logger.debug(`Filtered by priority threshold: ${filteredThoughts.length} thoughts remain`);
    }

    // Apply cluster filter
    if (options.clusterIdFilter && options.clusterIdFilter.length > 0) {
      filteredThoughts = filteredThoughts.filter(thought => 
        options.clusterIdFilter!.includes(thought.cluster_id || 'default')
      );
      logger.debug(`Filtered by cluster ID: ${filteredThoughts.length} thoughts remain`);
    }

    // Apply depth limitation (mock implementation)
    if (options.maxDepth !== undefined) {
      // In future phases, this would traverse the graph to the specified depth
      logger.debug(`Would apply max depth ${options.maxDepth} in future implementation`);
      
      // For now, limit segments per thought as a proxy for depth
      filteredThoughts = filteredThoughts.map(thought => ({
        ...thought,
        segments: thought.segments?.slice(0, options.maxDepth) || []
      }));
    }

    return filteredThoughts;
  }

  async exportThought(
    thoughtId: string, 
    options?: SemanticCompressionOptions
  ): Promise<ServiceResponse<{ thought: ThoughtData; metadata: ExportMetadata }>> {
    try {
      logger.info(`[PortabilityService] Exporting thought ${thoughtId} with options:`, options);

      const thought = await this.storage.getThoughtById(thoughtId);
      if (!thought) {
        const error: ServiceError = {
          code: 'THOUGHT_NOT_FOUND',
          message: `Thought with ID ${thoughtId} not found`,
          timestamp: new Date().toISOString()
        };
        
        return {
          success: false,
          error
        };
      }

      // Apply semantic compression options to single thought
      const processedThought: ThoughtData = { ...thought };

      if (options?.maxDepth !== undefined) {
        processedThought.segments = thought.segments?.slice(0, options.maxDepth || 10);
      }

      const metadata: ExportMetadata = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        thoughtCount: 1,
        segmentCount: processedThought.segments?.length || 0,
        compressionOptions: options
      };

      return {
        success: true,
        data: {
          thought: processedThought,
          metadata
        }
      };
    } catch (error) {
      const serviceError: ServiceError = {
        code: 'EXPORT_THOUGHT_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        details: { thoughtId, error }
      };
      
      logger.error('[PortabilityService] Error exporting thought:', error);
      
      return {
        success: false,
        error: serviceError
      };
    }
  }

  async exportCluster(
    clusterId: string, 
    options?: SemanticCompressionOptions
  ): Promise<ServiceResponse<{ thoughts: ThoughtData[]; metadata: ExportMetadata }>> {
    try {
      logger.info(`[PortabilityService] Exporting cluster ${clusterId} with options:`, options);

      const allThoughts = await this.storage.getAllThoughts();
      const clusterThoughts = allThoughts.filter(thought => 
        thought.tags?.some(tag => tag.name === clusterId)
      );

      const metadata: ExportMetadata = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        thoughtCount: clusterThoughts.length,
        segmentCount: clusterThoughts.reduce((total, thought) => 
          total + (thought.segments?.length || 0), 0),
        compressionOptions: options
      };

      return {
        success: true,
        data: {
          thoughts: clusterThoughts,
          metadata
        }
      };
    } catch (error) {
      const serviceError: ServiceError = {
        code: 'EXPORT_CLUSTER_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        details: { clusterId, error }
      };
      
      logger.error('[PortabilityService] Error exporting cluster:', error);
      
      return {
        success: false,
        error: serviceError
      };
    }
  }

  async importData(jsonData: ExportData): Promise<ServiceResponse<{ imported: number; skipped: number }>> {
    logger.info('Starting data import');

    try {
      // Validate the import data structure
      if (!jsonData || !jsonData.thoughts || !Array.isArray(jsonData.thoughts)) {
        const error: ServiceError = {
          code: 'INVALID_IMPORT_DATA',
          message: 'Invalid import data: missing or malformed thoughts array',
          timestamp: new Date().toISOString()
        };
        
        return {
          success: false,
          error
        };
      }

      let importedThoughts = 0;
      let importedSegments = 0;
      let skippedThoughts = 0;

      // Import each thought
      for (const thoughtData of jsonData.thoughts) {
        try {
          // Check if thought already exists
          const existingThought = await this.storage.getThoughtById(thoughtData.thought_bubble_id);

          if (existingThought) {
            logger.warn(`Thought ${thoughtData.thought_bubble_id} already exists, skipping`);
            skippedThoughts++;
            continue;
          }

          // Prepare thought data for creation
          const newThoughtData = {
            title: thoughtData.title || 'Imported Thought',
            description: thoughtData.description || '',
            tags: thoughtData.tags || [],
            position: thoughtData.position || { x: 0, y: 0 },
            created_at: thoughtData.created_at || new Date().toISOString(),
            updated_at: thoughtData.updated_at || new Date().toISOString(),
            metadata: thoughtData.metadata || {}
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
                  updated_at: segmentData.updated_at || new Date().toISOString(),
                  metadata: segmentData.metadata || {}
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
          skippedThoughts++;
        }
      }

      logger.info(`Successfully imported ${importedThoughts} thoughts and ${importedSegments} segments`);
      
      return {
        success: true,
        data: {
          imported: importedThoughts,
          skipped: skippedThoughts
        },
        metadata: {
          segmentsImported: importedSegments,
          totalProcessed: jsonData.thoughts.length
        }
      };
    } catch (error) {
      const serviceError: ServiceError = {
        code: 'IMPORT_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        details: { error }
      };
      
      logger.error('Error during data import:', error);
      
      return {
        success: false,
        error: serviceError
      };
    }
  }
}

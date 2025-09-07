import { ThoughtExportProvider, SemanticCompressionOptions } from '../../contracts/thoughtExportProvider';
import { StorageAdapter, NewThoughtData, NewSegmentData } from '../../contracts/storageAdapter';
import { logger } from '../utils/logger';
import { 
  ExportData, 
  ExportMetadata, 
  ThoughtData, 
  SegmentData,
  ServiceResponse,
  ServiceError,
  TagData
  // Position // Removed as it's part of Thought/NewThoughtData directly
} from '../../contracts/types';
import { Thought, Segment, Tag } from '../../contracts/entities';

export class PortabilityService implements ThoughtExportProvider {
  constructor(private storage: StorageAdapter) {}

  // --- Export Mappers ---
  private mapTagToTagData(tag: Tag): TagData {
    const tagData: TagData = { name: tag.name };
    if (tag.color !== undefined) {
      tagData.color = tag.color;
    }
    // Assuming Tag entity does not have metadata to map to TagData.metadata
    return tagData;
  }

  private mapSegmentToSegmentData(segment: Segment): SegmentData {
    const segmentData: SegmentData = {
      segment_id: segment.segment_id,
      thought_bubble_id: segment.thought_bubble_id,
      title: segment.title || '',
      content: segment.content,
      content_type: segment.content_type || 'text',
      created_at: segment.created_at.toISOString(),
      updated_at: segment.updated_at.toISOString(),
    };

    if (segment.abstraction_level !== undefined) segmentData.abstraction_level = segment.abstraction_level;
    if (segment.local_priority !== undefined) segmentData.local_priority = segment.local_priority;
    if (segment.cluster_id !== undefined) segmentData.cluster_id = segment.cluster_id;
    if (segment.sort_order !== undefined) segmentData.sort_order = segment.sort_order;
    // SegmentData.tags is optional; current logic maps to undefined.
    // if (segment.tags && segment.tags.length > 0) segmentData.tags = segment.tags.map(this.mapTagToTagData.bind(this));
    if (segment.metadata && Object.keys(segment.metadata).length > 0) {
      segmentData.metadata = segment.metadata as Record<string, unknown>; // Cast from Record<string, any>
    }
    return segmentData;
  }

  private mapThoughtToThoughtData(thought: Thought): ThoughtData {
    const thoughtData: ThoughtData = {
      thought_bubble_id: thought.thought_bubble_id,
      title: thought.title,
      description: thought.description || '',
      created_at: thought.created_at.toISOString(),
      updated_at: thought.updated_at.toISOString(),
    };

    if (thought.segments && thought.segments.length > 0) {
      thoughtData.segments = thought.segments.map(this.mapSegmentToSegmentData.bind(this));
    }
    if (thought.tags && thought.tags.length > 0) {
      thoughtData.tags = thought.tags.map(this.mapTagToTagData.bind(this));
    }

    const entityMetadata = thought.metadata as Record<string, unknown> | undefined;
    if (entityMetadata?.abstraction_level !== undefined) thoughtData.abstraction_level = entityMetadata.abstraction_level as string;
    if (entityMetadata?.local_priority !== undefined) thoughtData.local_priority = entityMetadata.local_priority as number;
    if (entityMetadata?.cluster_id !== undefined) thoughtData.cluster_id = entityMetadata.cluster_id as string;

    if (thought.position !== undefined) thoughtData.position = thought.position;

    if (thought.metadata && Object.keys(thought.metadata).length > 0) {
       // If ThoughtData.metadata is for additional DTO-specific metadata, adjust this.
       // For now, passing through the thought's own metadata.
      thoughtData.metadata = thought.metadata as Record<string, unknown>;
    }
    return thoughtData;
  }

  // --- Import Mappers ---
  private mapTagDataToNewTagFormat(tagData: TagData): { name: string; color: string } {
    return {
      name: tagData.name,
      color: tagData.color || '#ffffff',
    };
  }

  private mapSegmentDataToNewSegmentData(segmentData: SegmentData, thoughtId: string): NewSegmentData {
    const newSegment: NewSegmentData = {
      id: segmentData.segment_id,
      thoughtId: thoughtId,
      content: segmentData.content,
    };
    if (segmentData.title !== undefined) newSegment.title = segmentData.title;
    if (segmentData.content_type !== undefined) newSegment.content_type = segmentData.content_type;
    if (segmentData.abstraction_level !== undefined) newSegment.abstraction_level = segmentData.abstraction_level;
    if (segmentData.local_priority !== undefined) newSegment.local_priority = segmentData.local_priority;
    if (segmentData.cluster_id !== undefined) newSegment.cluster_id = segmentData.cluster_id;

    const dtoMetadata = segmentData.metadata as Record<string, unknown> | undefined;
    if (dtoMetadata?.fields !== undefined) newSegment.fields = dtoMetadata.fields as Record<string, unknown>;
    if (segmentData.metadata) newSegment.metadata = segmentData.metadata;

    return newSegment;
  }

  private mapThoughtDataToNewThoughtData(thoughtData: ThoughtData): NewThoughtData {
    const newThought: NewThoughtData = {
      id: thoughtData.thought_bubble_id,
      title: thoughtData.title,
    };

    if (thoughtData.description !== undefined) newThought.description = thoughtData.description;
    if (thoughtData.tags && thoughtData.tags.length > 0) {
      newThought.tags = thoughtData.tags.map(this.mapTagDataToNewTagFormat.bind(this));
    }
    if (thoughtData.position !== undefined) newThought.position = thoughtData.position;

    const dtoMetadata = thoughtData.metadata as Record<string, unknown> | undefined;
    if (dtoMetadata?.color !== undefined) newThought.color = dtoMetadata.color as string;
    if (dtoMetadata?.fields !== undefined) newThought.fields = dtoMetadata.fields as Record<string, unknown>;
    if (thoughtData.metadata) newThought.metadata = thoughtData.metadata;

    return newThought;
  }

  async exportData(options?: SemanticCompressionOptions): Promise<ServiceResponse<ExportData>> {
    try {
      logger.info('Starting data export...');
      const thoughtsFromStorage = await this.storage.getAllThoughts();
      let thoughtsForProcessing: Thought[] = thoughtsFromStorage;

      if (options) {
        thoughtsForProcessing = await this.applySemanticCompression(thoughtsForProcessing, options);
      }

      const mappedExportThoughts: ThoughtData[] = thoughtsForProcessing.map(this.mapThoughtToThoughtData.bind(this));

      const metadataObject: ExportMetadata = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        thoughtCount: mappedExportThoughts.length,
        segmentCount: mappedExportThoughts.reduce((total, thought) =>
          total + (thought.segments?.length || 0), 0)
      };
      if (options !== undefined) {
        metadataObject.compressionOptions = options;
      }

      const exportData: ExportData = {
        metadata: metadataObject,
        thoughts: mappedExportThoughts,
      };

      logger.info(`Successfully exported ${mappedExportThoughts.length} thoughts (original: ${thoughtsFromStorage.length})`);
      
      return {
        success: true,
        data: exportData,
        metadata: {
          originalCount: thoughtsFromStorage.length,
          exportedCount: mappedExportThoughts.length
        }
      };
    } catch (error: unknown) {
      const serviceError: ServiceError = {
        code: 'EXPORT_FAILED',
        message: error instanceof Error ? error.message : 'Unknown export error',
        timestamp: new Date().toISOString(),
        details: { error }
      };
      logger.error('Error during data export:', error);
      return { success: false, error: serviceError };
    }
  }

  private async applySemanticCompression(
    thoughts: Thought[],
    options: SemanticCompressionOptions
  ): Promise<Thought[]> {
    logger.info('Applying semantic compression to export data');
    let filteredThoughts = [...thoughts];

    if (options.abstractionLevelFilter && options.abstractionLevelFilter.length > 0) {
      const filterValues = options.abstractionLevelFilter;
      filteredThoughts = filteredThoughts.filter(thought => {
        const abstractionLevel = (thought.metadata?.abstraction_level as string | undefined) || 'default';
        return filterValues.includes(abstractionLevel);
      });
      logger.debug(`Filtered by abstraction level: ${filteredThoughts.length} thoughts remain`);
    }

    if (options.localPriorityThreshold !== undefined) {
      const threshold = options.localPriorityThreshold;
      filteredThoughts = filteredThoughts.filter(thought => {
        const localPriority = (thought.metadata?.local_priority as number | undefined) || 0.5;
        return localPriority >= threshold;
      });
      logger.debug(`Filtered by priority threshold: ${filteredThoughts.length} thoughts remain`);
    }

    if (options.clusterIdFilter && options.clusterIdFilter.length > 0) {
      const filterValues = options.clusterIdFilter;
      filteredThoughts = filteredThoughts.filter(thought => {
        const clusterId = (thought.metadata?.cluster_id as string | undefined) || 'default';
        return filterValues.includes(clusterId);
      });
      logger.debug(`Filtered by cluster ID: ${filteredThoughts.length} thoughts remain`);
    }

    if (options.maxDepth !== undefined) {
      logger.debug(`Would apply max depth ${options.maxDepth} in future implementation`);
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
        const serviceError: ServiceError = {
          code: 'THOUGHT_NOT_FOUND',
          message: `Thought with ID ${thoughtId} not found`,
          timestamp: new Date().toISOString()
        };
        return { success: false, error: serviceError };
      }

      let thoughtToProcess: Thought = thought;
      if (options?.maxDepth !== undefined && thoughtToProcess.segments) {
        thoughtToProcess = {
          ...thoughtToProcess,
          segments: thoughtToProcess.segments.slice(0, options.maxDepth),
        };
      }

      const mappedThoughtData = this.mapThoughtToThoughtData(thoughtToProcess);

      const metadataObject: ExportMetadata = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        thoughtCount: 1,
        segmentCount: mappedThoughtData.segments?.length || 0,
      };
      if (options !== undefined) {
        metadataObject.compressionOptions = options;
      }

      return {
        success: true,
        data: {
          thought: mappedThoughtData,
          metadata: metadataObject
        }
      };
    } catch (error: unknown) {
      const serviceError: ServiceError = {
        code: 'EXPORT_THOUGHT_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        details: { thoughtId, error }
      };
      logger.error('[PortabilityService] Error exporting thought:', error);
      return { success: false, error: serviceError };
    }
  }

  async exportCluster(
    clusterId: string, 
    options?: SemanticCompressionOptions
  ): Promise<ServiceResponse<{ thoughts: ThoughtData[]; metadata: ExportMetadata }>> {
    try {
      logger.info(`[PortabilityService] Exporting cluster ${clusterId} with options:`, options);
      const allThoughts = await this.storage.getAllThoughts();
      const clusterThoughtsFromStorage = allThoughts.filter(thought =>
        thought.tags?.some(tag => tag.name === clusterId)
      );

      const mappedClusterThoughts: ThoughtData[] = clusterThoughtsFromStorage.map(
        this.mapThoughtToThoughtData.bind(this)
      );

      const metadataObject: ExportMetadata = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        thoughtCount: mappedClusterThoughts.length,
        segmentCount: mappedClusterThoughts.reduce((total, thought) =>
          total + (thought.segments?.length || 0), 0)
      };
      if (options !== undefined) {
        metadataObject.compressionOptions = options;
      }

      return {
        success: true,
        data: {
          thoughts: mappedClusterThoughts,
          metadata: metadataObject
        }
      };
    } catch (error: unknown) {
      const serviceError: ServiceError = {
        code: 'EXPORT_CLUSTER_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        details: { clusterId, error }
      };
      logger.error('[PortabilityService] Error exporting cluster:', error);
      return { success: false, error: serviceError };
    }
  }

  async importData(jsonData: ExportData): Promise<ServiceResponse<{ imported: number; skipped: number }>> {
    logger.info('Starting data import');
    try {
      if (!jsonData || !jsonData.thoughts || !Array.isArray(jsonData.thoughts)) {
        const serviceError: ServiceError = {
          code: 'INVALID_IMPORT_DATA',
          message: 'Invalid import data: missing or malformed thoughts array',
          timestamp: new Date().toISOString()
        };
        return { success: false, error: serviceError };
      }

      let importedThoughts = 0;
      let importedSegments = 0;
      let skippedThoughts = 0;

      for (const thoughtData of jsonData.thoughts) {
        try {
          const existingThought = await this.storage.getThoughtById(thoughtData.thought_bubble_id);
          if (existingThought) {
            logger.warn(`Thought ${thoughtData.thought_bubble_id} already exists, skipping`);
            skippedThoughts++;
            continue;
          }

          const newThoughtDataForStorage: NewThoughtData = this.mapThoughtDataToNewThoughtData(thoughtData);
          const createdThought = await this.storage.createThought(newThoughtDataForStorage);
          importedThoughts++;

          if (thoughtData.segments && Array.isArray(thoughtData.segments)) {
            for (const segmentData of thoughtData.segments) {
              try {
                const newSegmentDataForStorage: NewSegmentData = this.mapSegmentDataToNewSegmentData(
                  segmentData,
                  createdThought.thought_bubble_id
                );
                await this.storage.createSegment(
                  createdThought.thought_bubble_id,
                  newSegmentDataForStorage
                );
                importedSegments++;
              } catch (segmentError: unknown) {
                logger.warn(`Failed to import segment for thought ${createdThought.thought_bubble_id}: ${segmentError instanceof Error ? segmentError.message : String(segmentError)}`);
              }
            }
          }
        } catch (thoughtError: unknown) {
          logger.warn(`Failed to import thought ${thoughtData.thought_bubble_id}: ${thoughtError instanceof Error ? thoughtError.message : String(thoughtError)}`);
          skippedThoughts++;
        }
      }

      logger.info(`Successfully imported ${importedThoughts} thoughts and ${importedSegments} segments`);
      return {
        success: true,
        data: { imported: importedThoughts, skipped: skippedThoughts },
        metadata: { segmentsImported: importedSegments, totalProcessed: jsonData.thoughts.length }
      };
    } catch (error: unknown) {
      const serviceError: ServiceError = {
        code: 'IMPORT_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        details: { error }
      };
      logger.error('Error during data import:', error);
      return { success: false, error: serviceError };
    }
  }
}

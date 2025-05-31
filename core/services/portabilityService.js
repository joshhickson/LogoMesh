"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortabilityService = void 0;
const logger_1 = require("../../src/core/utils/logger");
class PortabilityService {
    constructor(storage) {
        this.storage = storage;
    }
    async exportData(options) {
        try {
            logger_1.logger.info('[PortabilityService] Exporting data with options:', options);
            const thoughts = await this.storage.getAllThoughts();
            // Apply basic filtering based on semantic compression options
            let filteredThoughts = thoughts;
            if (options?.clusterIdFilter && options.clusterIdFilter.length > 0) {
                filteredThoughts = thoughts.filter(thought => options.clusterIdFilter.some(clusterId => thought.tags?.includes(clusterId)));
            }
            if (options?.maxDepth !== undefined) {
                // Limit the depth of segment nesting (basic implementation)
                filteredThoughts = filteredThoughts.map(thought => ({
                    ...thought,
                    segments: thought.segments?.slice(0, options.maxDepth || 10)
                }));
            }
            return {
                metadata: {
                    exportDate: new Date().toISOString(),
                    version: '1.0.0',
                    compressionOptions: options
                },
                thoughts: filteredThoughts
            };
        }
        catch (error) {
            logger_1.logger.error('[PortabilityService] Error exporting data:', error);
            throw error;
        }
    }
    async exportThought(thoughtId, options) {
        try {
            logger_1.logger.info(`[PortabilityService] Exporting thought ${thoughtId} with options:`, options);
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
        }
        catch (error) {
            logger_1.logger.error('[PortabilityService] Error exporting thought:', error);
            throw error;
        }
    }
    async exportCluster(clusterId, options) {
        try {
            logger_1.logger.info(`[PortabilityService] Exporting cluster ${clusterId} with options:`, options);
            const allThoughts = await this.storage.getAllThoughts();
            const clusterThoughts = allThoughts.filter(thought => thought.tags?.includes(clusterId));
            return {
                metadata: {
                    exportDate: new Date().toISOString(),
                    clusterId,
                    compressionOptions: options
                },
                thoughts: clusterThoughts
            };
        }
        catch (error) {
            logger_1.logger.error('[PortabilityService] Error exporting cluster:', error);
            throw error;
        }
    }
}
exports.PortabilityService = PortabilityService;
//# sourceMappingURL=portabilityService.js.map
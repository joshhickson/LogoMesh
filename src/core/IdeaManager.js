"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdeaManager = void 0;
const logger_1 = require("@core/utils/logger");
/**
 * Manages thought data and operations, providing a centralized interface
 * for data manipulation while abstracting storage details via StorageAdapter.
 */
class IdeaManager {
    constructor(storage) {
        this.storage = storage;
    }
    /**
     * Returns all thoughts from storage
     */
    async getThoughts() {
        try {
            return await this.storage.getAllThoughts();
        }
        catch (error) {
            logger_1.logger.error('Failed to get thoughts from storage:', error);
            return [];
        }
    }
    /**
     * Returns a specific thought by ID from storage
     */
    async getThoughtById(id) {
        try {
            const thought = await this.storage.getThoughtById(id);
            return thought || undefined;
        }
        catch (error) {
            logger_1.logger.error('Failed to get thought by ID from storage:', error);
            return undefined;
        }
    }
    /**
     * Creates a new thought using the storage adapter
     */
    async addThought(thoughtData) {
        try {
            const newThoughtData = {
                title: thoughtData.title,
                description: thoughtData.description,
                tags: thoughtData.tags,
                position: thoughtData.position,
                color: thoughtData.color
            };
            const thought = await this.storage.createThought(newThoughtData);
            logger_1.logger.log(`Created thought: ${thought.thought_bubble_id}`);
            return thought;
        }
        catch (error) {
            logger_1.logger.error('Failed to create thought:', error);
            throw error;
        }
    }
    /**
     * Updates an existing thought using the storage adapter
     */
    async updateThought(thoughtId, updates) {
        try {
            const updateData = {
                title: updates.title,
                description: updates.description,
                tags: updates.tags,
                position: updates.position,
                color: updates.color
            };
            const thought = await this.storage.updateThought(thoughtId, updateData);
            if (thought) {
                logger_1.logger.log(`Updated thought: ${thoughtId}`);
            }
            return thought || undefined;
        }
        catch (error) {
            logger_1.logger.error('Failed to update thought:', error);
            return undefined;
        }
    }
    /**
     * Deletes a thought using the storage adapter
     */
    async deleteThought(thoughtId) {
        try {
            const deleted = await this.storage.deleteThought(thoughtId);
            if (deleted) {
                logger_1.logger.log(`Deleted thought: ${thoughtId}`);
            }
            return deleted;
        }
        catch (error) {
            logger_1.logger.error('Failed to delete thought:', error);
            return false;
        }
    }
    /**
     * Creates a new segment for a thought using the storage adapter
     */
    async addSegment(thoughtId, segmentData) {
        try {
            // Verify thought exists first
            const thought = await this.storage.getThoughtById(thoughtId);
            if (!thought) {
                logger_1.logger.error(`Thought not found with ID: ${thoughtId}`);
                return undefined;
            }
            const newSegmentData = {
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
            logger_1.logger.log(`Created segment: ${segment.segment_id}`);
            return segment;
        }
        catch (error) {
            logger_1.logger.error('Failed to create segment:', error);
            return undefined;
        }
    }
    /**
     * Updates an existing segment using the storage adapter
     */
    async updateSegment(thoughtId, segmentId, updates) {
        try {
            const updateData = {
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
                logger_1.logger.log(`Updated segment: ${segmentId}`);
            }
            return segment || undefined;
        }
        catch (error) {
            logger_1.logger.error('Failed to update segment:', error);
            return undefined;
        }
    }
    /**
     * Deletes a segment using the storage adapter
     */
    async deleteSegment(thoughtId, segmentId) {
        try {
            const deleted = await this.storage.deleteSegment(segmentId);
            if (deleted) {
                logger_1.logger.log(`Deleted segment: ${segmentId}`);
            }
            return deleted;
        }
        catch (error) {
            logger_1.logger.error('Failed to delete segment:', error);
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
    upsertThought(thought) {
        // This method is kept for backward compatibility but should be migrated to async
        logger_1.logger.warn('upsertThought is deprecated, use addThought or updateThought instead');
    }
    /**
     * @deprecated Use deleteThought instead
     */
    removeThought(id) {
        // This method is kept for backward compatibility but should be migrated to async
        logger_1.logger.warn('removeThought is deprecated, use deleteThought instead');
    }
}
exports.IdeaManager = IdeaManager;
//# sourceMappingURL=IdeaManager.js.map
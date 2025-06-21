"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteStorageAdapter = void 0;
const sqlite3 = __importStar(require("sqlite3"));
const idUtils_1 = require("core/utils/idUtils"); // Path mapping
const logger_1 = require("core/utils/logger"); // Path mapping
/**
 * SQLite implementation of the StorageAdapter interface
 * Handles all database operations with proper DTO <-> DB mapping
 */
class SQLiteStorageAdapter {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null; // Changed Database to any
    }
    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    logger_1.logger.error('Failed to open SQLite database:', err);
                    reject(err);
                }
                else {
                    logger_1.logger.info(`Connected to SQLite database at ${this.dbPath}`); // Changed to info
                    resolve();
                }
            });
        });
    }
    async close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        logger_1.logger.error('Error closing database:', err);
                    }
                    else {
                        logger_1.logger.info('Database connection closed'); // Changed to info
                    }
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    async getAllThoughts() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const query = `
        SELECT t.*, 
               GROUP_CONCAT(DISTINCT tg.name || '::' || tg.color) as tags
        FROM thoughts t
        LEFT JOIN thought_tags tt ON t.thought_bubble_id = tt.thought_bubble_id
        LEFT JOIN tags tg ON tt.tag_id = tg.tag_id
        GROUP BY t.thought_bubble_id
        ORDER BY t.created_at DESC
      `;
            this.db.all(query, async (err, rows) => {
                if (err) {
                    logger_1.logger.error('Error fetching thoughts:', err);
                    reject(err);
                    return;
                }
                try {
                    const thoughts = [];
                    for (const row of rows) {
                        const segments = await this.getSegmentsForThought(row.thought_bubble_id);
                        const tags = this.parseTagsFromRow(row.tags);
                        thoughts.push({
                            thought_bubble_id: row.thought_bubble_id,
                            title: row.title,
                            description: row.description,
                            created_at: row.created_at,
                            updated_at: row.updated_at,
                            color: row.color,
                            position: row.position_x !== null ? { x: row.position_x, y: row.position_y } : undefined,
                            tags,
                            segments
                        });
                    }
                    resolve(thoughts);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    async getThoughtById(thoughtId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const query = `
        SELECT t.*, 
               GROUP_CONCAT(DISTINCT tg.name || '::' || tg.color) as tags
        FROM thoughts t
        LEFT JOIN thought_tags tt ON t.thought_bubble_id = tt.thought_bubble_id
        LEFT JOIN tags tg ON tt.tag_id = tg.tag_id
        WHERE t.thought_bubble_id = ?
        GROUP BY t.thought_bubble_id
      `;
            this.db.get(query, [thoughtId], async (err, row) => {
                if (err) {
                    logger_1.logger.error('Error fetching thought:', err);
                    reject(err);
                    return;
                }
                if (!row) {
                    resolve(null);
                    return;
                }
                try {
                    const segments = await this.getSegmentsForThought(thoughtId);
                    const tags = this.parseTagsFromRow(row.tags);
                    resolve({
                        thought_bubble_id: row.thought_bubble_id,
                        title: row.title,
                        description: row.description,
                        created_at: row.created_at,
                        updated_at: row.updated_at,
                        color: row.color,
                        position: row.position_x !== null ? { x: row.position_x, y: row.position_y } : undefined,
                        tags,
                        segments
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    async createThought(thoughtData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const thoughtId = (0, idUtils_1.generateThoughtId)();
            const now = new Date().toISOString();
            const insertQuery = `
        INSERT INTO thoughts (thought_bubble_id, title, description, created_at, updated_at, color, position_x, position_y)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const values = [
                thoughtId,
                thoughtData.title,
                thoughtData.description || null,
                now,
                now,
                thoughtData.color || '#3b82f6',
                thoughtData.position?.x || 0,
                thoughtData.position?.y || 0
            ];
            this.db.run(insertQuery, values, async (err) => {
                if (err) {
                    logger_1.logger.error('Error creating thought:', err);
                    reject(err);
                    return;
                }
                try {
                    // Handle tags if provided
                    if (thoughtData.tags && thoughtData.tags.length > 0) {
                        await this.associateTagsWithThought(thoughtId, thoughtData.tags);
                    }
                    const createdThought = await this.getThoughtById(thoughtId);
                    if (createdThought) {
                        logger_1.logger.info(`Created thought: ${thoughtId}`); // Changed to info
                        resolve(createdThought);
                    }
                    else {
                        reject(new Error('Failed to retrieve created thought'));
                    }
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    async updateThought(thoughtId, updates) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const updateFields = [];
            const values = [];
            if (updates.title !== undefined) {
                updateFields.push('title = ?');
                values.push(updates.title);
            }
            if (updates.description !== undefined) {
                updateFields.push('description = ?');
                values.push(updates.description);
            }
            if (updates.color !== undefined) {
                updateFields.push('color = ?');
                values.push(updates.color);
            }
            if (updates.position !== undefined) {
                updateFields.push('position_x = ?, position_y = ?');
                values.push(updates.position.x, updates.position.y);
            }
            updateFields.push('updated_at = ?');
            values.push(new Date().toISOString());
            values.push(thoughtId);
            const query = `UPDATE thoughts SET ${updateFields.join(', ')} WHERE thought_bubble_id = ?`;
            this.db.run(query, values, async (err) => {
                if (err) {
                    logger_1.logger.error('Error updating thought:', err);
                    reject(err);
                    return;
                }
                try {
                    // Handle tag updates if provided
                    if (updates.tags !== undefined) {
                        await this.updateThoughtTags(thoughtId, updates.tags);
                    }
                    const updatedThought = await this.getThoughtById(thoughtId);
                    resolve(updatedThought);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    async deleteThought(thoughtId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            // Due to CASCADE constraints, deleting the thought will also delete related records
            const query = 'DELETE FROM thoughts WHERE thought_bubble_id = ?';
            this.db.run(query, [thoughtId], function (err) {
                if (err) {
                    logger_1.logger.error('Error deleting thought:', err);
                    reject(err);
                    return;
                }
                const deleted = this.changes > 0; // 'this' is now correctly typed (implicitly by sqlite3)
                if (deleted) {
                    logger_1.logger.info(`Deleted thought: ${thoughtId}`); // Changed to info
                }
                resolve(deleted);
            });
        });
    }
    async getSegmentsForThought(thoughtId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const query = 'SELECT * FROM segments WHERE thought_bubble_id = ? ORDER BY sort_order, created_at';
            this.db.all(query, [thoughtId], (err, rows) => {
                if (err) {
                    logger_1.logger.error('Error fetching segments:', err);
                    reject(err);
                    return;
                }
                const segments = rows.map(row => ({
                    segment_id: row.segment_id,
                    thought_bubble_id: row.thought_bubble_id,
                    title: row.title,
                    content: row.content || '',
                    content_type: 'text',
                    fields: row.metadata ? JSON.parse(row.metadata) : {},
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    abstraction_level: 'Fact',
                    local_priority: 0.5,
                    cluster_id: 'uncategorized'
                }));
                resolve(segments);
            });
        });
    }
    async getSegmentById(segmentId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const query = 'SELECT * FROM segments WHERE segment_id = ?';
            this.db.get(query, [segmentId], (err, row) => {
                if (err) {
                    logger_1.logger.error('Error fetching segment:', err);
                    reject(err);
                    return;
                }
                if (!row) {
                    resolve(null);
                    return;
                }
                resolve({
                    segment_id: row.segment_id,
                    thought_bubble_id: row.thought_bubble_id,
                    title: row.title,
                    content: row.content || '',
                    content_type: 'text',
                    fields: row.metadata ? JSON.parse(row.metadata) : {},
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    abstraction_level: 'Fact',
                    local_priority: 0.5,
                    cluster_id: 'uncategorized'
                });
            });
        });
    }
    async createSegment(thoughtId, segmentData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const segmentId = (0, idUtils_1.generateSegmentId)();
            const now = new Date().toISOString();
            const query = `
        INSERT INTO segments (segment_id, thought_bubble_id, title, content, created_at, updated_at, sort_order, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const values = [
                segmentId,
                thoughtId,
                segmentData.title,
                segmentData.content,
                now,
                now,
                0,
                JSON.stringify(segmentData.fields || {})
            ];
            this.db.run(query, values, async (err) => {
                if (err) {
                    logger_1.logger.error('Error creating segment:', err);
                    reject(err);
                    return;
                }
                try {
                    const createdSegment = await this.getSegmentById(segmentId);
                    if (createdSegment) {
                        logger_1.logger.info(`Created segment: ${segmentId}`); // Changed to info
                        resolve(createdSegment);
                    }
                    else {
                        reject(new Error('Failed to retrieve created segment'));
                    }
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    async updateSegment(segmentId, updates) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const updateFields = [];
            const values = [];
            if (updates.title !== undefined) {
                updateFields.push('title = ?');
                values.push(updates.title);
            }
            if (updates.content !== undefined) {
                updateFields.push('content = ?');
                values.push(updates.content);
            }
            if (updates.fields !== undefined) {
                updateFields.push('metadata = ?');
                values.push(JSON.stringify(updates.fields));
            }
            updateFields.push('updated_at = ?');
            values.push(new Date().toISOString());
            values.push(segmentId);
            const query = `UPDATE segments SET ${updateFields.join(', ')} WHERE segment_id = ?`;
            this.db.run(query, values, async (err) => {
                if (err) {
                    logger_1.logger.error('Error updating segment:', err);
                    reject(err);
                    return;
                }
                try {
                    const updatedSegment = await this.getSegmentById(segmentId);
                    resolve(updatedSegment);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    async deleteSegment(segmentId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const query = 'DELETE FROM segments WHERE segment_id = ?';
            this.db.run(query, [segmentId], function (err) {
                if (err) {
                    logger_1.logger.error('Error deleting segment:', err);
                    reject(err);
                    return;
                }
                const deleted = this.changes > 0; // 'this' is now correctly typed (implicitly by sqlite3)
                if (deleted) {
                    logger_1.logger.info(`Deleted segment: ${segmentId}`); // Changed to info
                }
                resolve(deleted);
            });
        });
    }
    // Helper methods
    parseTagsFromRow(tagsString) {
        if (!tagsString)
            return [];
        return tagsString.split(',').map(tagStr => {
            const [name, color] = tagStr.split('::');
            return { name, color };
        }).filter(tag => tag.name && tag.color);
    }
    async associateTagsWithThought(thoughtId, tags) {
        return new Promise((resolve, reject) => {
            if (!this.db || !tags.length) {
                resolve();
                return;
            }
            // First, ensure all tags exist in the tags table
            const insertTagQuery = 'INSERT OR IGNORE INTO tags (tag_id, name, color, created_at) VALUES (?, ?, ?, ?)';
            const linkTagQuery = 'INSERT OR IGNORE INTO thought_tags (thought_bubble_id, tag_id, created_at) VALUES (?, ?, ?)';
            let pending = tags.length;
            const now = new Date().toISOString();
            for (const tag of tags) {
                const tagId = `tag_${tag.name.toLowerCase().replace(/\s+/g, '_')}`;
                this.db.run(insertTagQuery, [tagId, tag.name, tag.color, now], (err) => {
                    if (err) {
                        logger_1.logger.error('Error creating tag:', err);
                        reject(err);
                        return;
                    }
                    this.db.run(linkTagQuery, [thoughtId, tagId, now], (err) => {
                        if (err) {
                            logger_1.logger.error('Error linking tag to thought:', err);
                            reject(err);
                            return;
                        }
                        pending--;
                        if (pending === 0) {
                            resolve();
                        }
                    });
                });
            }
        });
    }
    async updateThoughtTags(thoughtId, tags) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            // First remove existing tag associations
            const deleteQuery = 'DELETE FROM thought_tags WHERE thought_bubble_id = ?';
            this.db.run(deleteQuery, [thoughtId], async (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    await this.associateTagsWithThought(thoughtId, tags);
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
}
exports.SQLiteStorageAdapter = SQLiteStorageAdapter;
//# sourceMappingURL=sqliteAdapter.js.map
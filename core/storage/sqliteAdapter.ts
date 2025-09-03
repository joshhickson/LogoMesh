import sqlite3, { Database } from 'sqlite3';
import { StorageAdapter, NewThoughtData, NewSegmentData } from '../../contracts/storageAdapter';
import { Thought, Segment, Tag } from '../../contracts/entities';
import {
  SQLiteThoughtRecord, // Added specific record type
  SQLiteSegmentRecord, // Added specific record type
  SQLiteRunResult 
} from '../../contracts/types'; // Removed ThoughtRecord, SegmentRecord, TagRecord
import { generateThoughtId, generateSegmentId } from '../utils/idUtils'; // Removed .js
import { logger } from '../utils/logger'; // Removed .js

/**
 * SQLite implementation of the StorageAdapter interface
 * Handles all database operations with proper DTO <-> DB mapping
 */
export class SQLiteStorageAdapter implements StorageAdapter {
  private db: Database | null = null;

  constructor(private dbPath: string) {}

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err: Error | null) => {
        if (err) {
          logger.error('Failed to open SQLite database:', err);
          reject(err);
        } else {
          logger.info(`Connected to SQLite database at ${this.dbPath}`);
          resolve();
        }
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err: Error | null) => {
          if (err) {
            logger.error('Error closing database:', err);
          } else {
            logger.info('Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async getAllThoughts(_userId?: string): Promise<Thought[]> { // userId -> _userId
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const query = `
        SELECT t.*, 
               GROUP_CONCAT(DISTINCT tg.name || '::' || tg.color) as tags_str
        FROM thoughts t
        LEFT JOIN thought_tags tt ON t.thought_bubble_id = tt.thought_bubble_id
        LEFT JOIN tags tg ON tt.tag_id = tg.tag_id
        GROUP BY t.thought_bubble_id
        ORDER BY t.created_at DESC
      `;

      this.db.all(query, async (err: Error | null, rows: SQLiteThoughtRecord[]) => { // Use SQLiteThoughtRecord
        if (err) {
          logger.error('Error fetching thoughts:', err);
          reject(err);
          return;
        }

        try {
          const thoughts: Thought[] = [];
          for (const row of rows) {
            const segments = await this.getSegmentsForThought(row.thought_bubble_id, _userId); // userId -> _userId
            const tags = this.parseTagsFromRow(row.tags_str || null); // Use tags_str

            let parsedFields: Record<string, unknown> = {};
            if (row.fields) {
              try { parsedFields = JSON.parse(row.fields) as Record<string, unknown>; }
              catch (e) { logger.warn(`Failed to parse fields JSON for thought ${row.thought_bubble_id}`, e); }
            }
            let parsedMetadata: Record<string, unknown> = {};
            if (row.metadata) {
              try { parsedMetadata = JSON.parse(row.metadata) as Record<string, unknown>; }
              catch (e) { logger.warn(`Failed to parse metadata JSON for thought ${row.thought_bubble_id}`, e); }
            }

            const thought: Thought = {
              thought_bubble_id: row.thought_bubble_id,
              title: row.title,
              created_at: new Date(row.created_at),
              updated_at: new Date(row.updated_at),
              tags, // Assuming Tag[] is fine, or it needs mapping too
              segments, // Assuming Segment[] is fine
              fields: parsedFields, // Assuming Record<string, unknown> is fine
              metadata: parsedMetadata // Assuming Record<string, unknown> is fine
            };
            if (row.description !== undefined && row.description !== null) thought.description = row.description;
            if (row.color !== undefined && row.color !== null) thought.color = row.color;
            if (row.position_x !== undefined && row.position_x !== null &&
                row.position_y !== undefined && row.position_y !== null) {
              thought.position = { x: row.position_x, y: row.position_y };
            }
            thoughts.push(thought);
          }
          resolve(thoughts);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async getThoughtById(thoughtId: string, _userId?: string): Promise<Thought | null> { // userId -> _userId
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const query = `
        SELECT t.*, 
               GROUP_CONCAT(DISTINCT tg.name || '::' || tg.color) as tags_str
        FROM thoughts t
        LEFT JOIN thought_tags tt ON t.thought_bubble_id = tt.thought_bubble_id
        LEFT JOIN tags tg ON tt.tag_id = tg.tag_id
        WHERE t.thought_bubble_id = ?
        GROUP BY t.thought_bubble_id
      `;

      this.db.get(query, [thoughtId], async (err: Error | null, row: SQLiteThoughtRecord | undefined) => { // Use SQLiteThoughtRecord
        if (err) {
          logger.error('Error fetching thought:', err);
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        try {
          const segments = await this.getSegmentsForThought(thoughtId, _userId); // userId -> _userId
          const tags = this.parseTagsFromRow(row.tags_str || null); // Use tags_str

          let parsedFields: Record<string, unknown> = {};
          if (row.fields) {
            try { parsedFields = JSON.parse(row.fields) as Record<string, unknown>; }
            catch (e) { logger.warn(`Failed to parse fields JSON for thought ${row.thought_bubble_id}`, e); }
          }
          let parsedMetadata: Record<string, unknown> = {};
          if (row.metadata) {
            try { parsedMetadata = JSON.parse(row.metadata) as Record<string, unknown>; }
            catch (e) { logger.warn(`Failed to parse metadata JSON for thought ${row.thought_bubble_id}`, e); }
          }

          const thought: Thought = {
            thought_bubble_id: row.thought_bubble_id,
            title: row.title,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
            tags,
            segments,
            fields: parsedFields,
            metadata: parsedMetadata
          };
          if (row.description !== undefined && row.description !== null) thought.description = row.description;
          if (row.color !== undefined && row.color !== null) thought.color = row.color;
          if (row.position_x !== undefined && row.position_x !== null &&
              row.position_y !== undefined && row.position_y !== null) {
            thought.position = { x: row.position_x, y: row.position_y };
          }
          resolve(thought);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async createThought(thoughtData: NewThoughtData, userId?: string): Promise<Thought> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const thoughtId = thoughtData.id || generateThoughtId(); // Use provided ID or generate
      const now = new Date().toISOString();

      const insertQuery = `
        INSERT INTO thoughts (thought_bubble_id, title, description, created_at, updated_at, color, position_x, position_y, fields, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      // Ensure fields and metadata are stringified if they are objects
      const fieldsStr = thoughtData.fields ? JSON.stringify(thoughtData.fields) : null;
      const metadataStr = thoughtData.metadata ? JSON.stringify(thoughtData.metadata) : null;


      const values = [
        thoughtId,
        thoughtData.title,
        thoughtData.description || null,
        now,
        now,
        thoughtData.color || '#3b82f6',
        thoughtData.position?.x || 0,
        thoughtData.position?.y || 0,
        fieldsStr,
        metadataStr
      ];

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;

      this.db.run(insertQuery, values, async function(this: SQLiteRunResult, err: Error | null) {
        if (err) {
          logger.error('Error creating thought:', err);
          reject(err);
          return;
        }

        try {
          if (thoughtData.tags && thoughtData.tags.length > 0) {
            await self.associateTagsWithThought(thoughtId, thoughtData.tags);
          }

          const createdThought = await self.getThoughtById(thoughtId, userId);
          if (createdThought) {
            logger.info(`Created thought: ${thoughtId}`);
            resolve(createdThought);
          } else {
            reject(new Error('Failed to retrieve created thought after insert. ID: ' + thoughtId));
          }
        } catch (error: unknown) {
          logger.error('Error retrieving created thought or associating tags:', error);
          if (error instanceof Error) {
            reject(error);
          } else {
            reject(new Error(`An unknown error occurred during thought creation: ${String(error)}`));
          }
        }
      });
    });
  }

  async updateThought(thoughtId: string, updates: Partial<NewThoughtData>, userId?: string): Promise<Thought | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const updateFields: string[] = [];
      const values: (string | number | null)[] = []; // Typed more strictly

      // Handle standard fields
      if (updates.title !== undefined) { updateFields.push('title = ?'); values.push(updates.title); }
      if (updates.description !== undefined) { updateFields.push('description = ?'); values.push(updates.description); }
      if (updates.color !== undefined) { updateFields.push('color = ?'); values.push(updates.color); }
      if (updates.position !== undefined) {
        updateFields.push('position_x = ?, position_y = ?');
        values.push(updates.position.x, updates.position.y);
      }
      // Handle JSON fields
      if (updates.fields !== undefined) {
        updateFields.push('fields = ?');
        values.push(updates.fields ? JSON.stringify(updates.fields) : null);
      }
      if (updates.metadata !== undefined) {
        updateFields.push('metadata = ?');
        values.push(updates.metadata ? JSON.stringify(updates.metadata) : null);
      }


      if (updateFields.length === 0 && updates.tags === undefined) {
        // No actual fields to update, just fetch the thought
        this.getThoughtById(thoughtId, userId).then(resolve).catch(reject);
        return;
      }

      updateFields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(thoughtId); // For the WHERE clause

      const query = `UPDATE thoughts SET ${updateFields.join(', ')} WHERE thought_bubble_id = ?`;

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;

      this.db.run(query, values, async function(this: SQLiteRunResult, err: Error | null) {
        if (err) {
          logger.error('Error updating thought:', err);
          reject(err);
          return;
        }

        try {
          if (updates.tags !== undefined) {
            await self.updateThoughtTags(thoughtId, updates.tags);
          }

          const updatedThought = await self.getThoughtById(thoughtId, userId);
          resolve(updatedThought);
        } catch (error: unknown) {
           logger.error('Error retrieving updated thought or updating tags:', error);
          if (error instanceof Error) {
            reject(error);
          } else {
            reject(new Error(`An unknown error occurred during thought update: ${String(error)}`));
          }
        }
      });
    });
  }

  async deleteThought(thoughtId: string): Promise<boolean> { // userId -> _userId
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const query = 'DELETE FROM thoughts WHERE thought_bubble_id = ?';

      this.db.run(query, [thoughtId], function(this: SQLiteRunResult, err: Error | null) {
        if (err) {
          logger.error('Error deleting thought:', err);
          reject(err);
          return;
        }

        const deleted = this.changes > 0;
        if (deleted) {
          logger.info(`Deleted thought: ${thoughtId}`);
        }
        resolve(deleted);
      });
    });
  }

  async getSegmentsForThought(thoughtId: string, _userId?: string): Promise<Segment[]> { // userId -> _userId
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const query = 'SELECT * FROM segments WHERE thought_bubble_id = ? ORDER BY sort_order, created_at';

      this.db.all(query, [thoughtId], (err: Error | null, rows: SQLiteSegmentRecord[]) => { // Use SQLiteSegmentRecord
        if (err) {
          logger.error('Error fetching segments:', err);
          reject(err);
          return;
        }

        const segments: Segment[] = rows.map(row => {
          let finalFields: Record<string, unknown> = {};
          let finalMetadata: Record<string, unknown> = {};

          if (row.metadata) {
            try {
              const parsed = JSON.parse(row.metadata) as Record<string, unknown>;
              if (typeof parsed.fields === 'object' && parsed.fields !== null) {
                finalFields = parsed.fields as Record<string, unknown>;
                const { ...rest } = parsed;
                finalMetadata = rest;
              } else {
                finalMetadata = parsed;
              }
            } catch (e) {
              logger.warn(`Failed to parse metadata JSON for segment ${row.segment_id}:`, e);
            }
          }

          const segment: Segment = {
            segment_id: row.segment_id,
            thought_bubble_id: row.thought_bubble_id,
            content: row.content || '',
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
            fields: finalFields, // finalFields is already {} if not found
            metadata: finalMetadata, // finalMetadata is already {} if not found
          };
          if (row.title !== undefined && row.title !== null) segment.title = row.title;
          if (row.content_type !== undefined && row.content_type !== null) segment.content_type = row.content_type;
          if (row.abstraction_level !== undefined && row.abstraction_level !== null) segment.abstraction_level = row.abstraction_level;
          if (row.local_priority !== undefined && row.local_priority !== null) segment.local_priority = row.local_priority;
          if (row.cluster_id !== undefined && row.cluster_id !== null) segment.cluster_id = row.cluster_id;
          if (row.sort_order !== undefined && row.sort_order !== null) segment.sort_order = row.sort_order;
          return segment;
        });

        resolve(segments);
      });
    });
  }

  async getSegmentById(segmentId: string): Promise<Segment | null> {
     return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      const query = 'SELECT * FROM segments WHERE segment_id = ?';

      this.db.get(query, [segmentId], (err: Error | null, row: SQLiteSegmentRecord | undefined) => {
        if (err) {
          logger.error('Error fetching segment:', err);
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        let finalFields: Record<string, unknown> = {};
        let finalMetadata: Record<string, unknown> = {};
        if (row.metadata) {
          try {
            const parsed = JSON.parse(row.metadata) as Record<string, unknown>;
            if (typeof parsed.fields === 'object' && parsed.fields !== null) {
              finalFields = parsed.fields as Record<string, unknown>;
              const { ...rest } = parsed;
              finalMetadata = rest;
            } else {
              finalMetadata = parsed;
            }
          } catch (e) {
            logger.warn(`Failed to parse metadata JSON for segment ${row.segment_id}:`, e);
          }
        }

        const segment: Segment = {
          segment_id: row.segment_id,
          thought_bubble_id: row.thought_bubble_id,
          content: row.content || '',
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at),
          fields: finalFields, // finalFields is already {} if not found
          metadata: finalMetadata, // finalMetadata is already {} if not found
        };
        if (row.title !== undefined && row.title !== null) segment.title = row.title;
        if (row.content_type !== undefined && row.content_type !== null) segment.content_type = row.content_type;
        if (row.abstraction_level !== undefined && row.abstraction_level !== null) segment.abstraction_level = row.abstraction_level;
        if (row.local_priority !== undefined && row.local_priority !== null) segment.local_priority = row.local_priority;
        if (row.cluster_id !== undefined && row.cluster_id !== null) segment.cluster_id = row.cluster_id;
        if (row.sort_order !== undefined && row.sort_order !== null) segment.sort_order = row.sort_order;
        resolve(segment);
      });
    });
  }

  async createSegment(thoughtId: string, segmentData: NewSegmentData, _userId?: string): Promise<Segment> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const segmentId = segmentData.id || generateSegmentId();
      const now = new Date().toISOString();

      // Prepare metadata for DB (stringify if object, else null)
      const dbMetadata = (segmentData.metadata || segmentData.fields)
        ? JSON.stringify(segmentData.metadata || segmentData.fields || {})
        : null;


      const query = `
        INSERT INTO segments (segment_id, thought_bubble_id, title, content, content_type, created_at, updated_at, sort_order, metadata, abstraction_level, local_priority, cluster_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        segmentId,
        thoughtId,
        segmentData.title || null,
        segmentData.content,
        segmentData.content_type || 'text',
        now,
        now,
        0, // Default sort order
        dbMetadata,
        segmentData.abstraction_level || 'Fact',
        segmentData.local_priority || 0.5,
        segmentData.cluster_id || 'uncategorized'
      ];

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;

      this.db.run(query, values, async function(this: SQLiteRunResult, err: Error | null) {
        if (err) {
          logger.error('Error creating segment:', err);
          reject(err);
          return;
        }

        try {
          const createdSegment = await self.getSegmentById(segmentId);
          if (createdSegment) {
            logger.info(`Created segment: ${segmentId}`);
            resolve(createdSegment);
          } else {
            reject(new Error('Failed to retrieve created segment after insert. ID: ' + segmentId));
          }
        } catch (error: unknown) {
          logger.error('Error retrieving created segment:', error);
          if (error instanceof Error) {
            reject(error);
          } else {
            reject(new Error(`An unknown error occurred during segment creation: ${String(error)}`));
          }
        }
      });
    });
  }

  async updateSegment(_thoughtId: string, segmentId: string, updates: Partial<NewSegmentData>, _userId?: string): Promise<Segment | null> { // Prefixed thoughtId
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const updateFields: string[] = [];
      const values: (string | number | null)[] = [];

      if (updates.title !== undefined) { updateFields.push('title = ?'); values.push(updates.title); }
      if (updates.content !== undefined) { updateFields.push('content = ?'); values.push(updates.content); }
      if (updates.content_type !== undefined) { updateFields.push('content_type = ?'); values.push(updates.content_type); }
      if (updates.abstraction_level !== undefined) { updateFields.push('abstraction_level = ?'); values.push(updates.abstraction_level); }
      if (updates.local_priority !== undefined) { updateFields.push('local_priority = ?'); values.push(updates.local_priority); }
      if (updates.cluster_id !== undefined) { updateFields.push('cluster_id = ?'); values.push(updates.cluster_id); }
      // Assuming fields and metadata are combined into the 'metadata' DB column
      if (updates.metadata !== undefined || updates.fields !== undefined) {
        updateFields.push('metadata = ?');
        values.push(JSON.stringify(updates.metadata || updates.fields || {}));
      }
      // if (updates.sort_order !== undefined) { updateFields.push('sort_order = ?'); values.push(updates.sort_order); }


      if (updateFields.length === 0) {
        this.getSegmentById(segmentId).then(resolve).catch(reject);
        return;
      }

      updateFields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(segmentId); // For the WHERE clause

      const query = `UPDATE segments SET ${updateFields.join(', ')} WHERE segment_id = ?`;

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;

      this.db.run(query, values, async function(this: SQLiteRunResult, err: Error | null) {
        if (err) {
          logger.error('Error updating segment:', err);
          reject(err);
          return;
        }

        try {
          const updatedSegment = await self.getSegmentById(segmentId);
          resolve(updatedSegment);
        } catch (error: unknown) {
          logger.error('Error retrieving updated segment:', error);
          if (error instanceof Error) {
            reject(error);
          } else {
            reject(new Error(`An unknown error occurred during segment update: ${String(error)}`));
          }
        }
      });
    });
  }

  async deleteSegment(_thoughtId: string, segmentId: string): Promise<boolean> { // userId, thoughtId -> _userId, _thoughtId
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const query = 'DELETE FROM segments WHERE segment_id = ?';

      this.db.run(query, [segmentId], function(this: SQLiteRunResult, err: Error | null) {
        if (err) {
          logger.error('Error deleting segment:', err);
          reject(err);
          return;
        }

        const deleted = this.changes > 0;
        if (deleted) {
          logger.info(`Deleted segment: ${segmentId}`);
        }
        resolve(deleted);
      });
    });
  }

  // Mock implementation for vector search in SQLite
  async findSimilarThoughts(_embedding: number[], _maxResults: number, _userId?: string): Promise<Thought[]> {
    logger.warn('[SQLiteStorageAdapter] findSimilarThoughts is not implemented and will return an empty array.');
    return Promise.resolve([]);
  }

  // Helper methods

  private parseTagsFromRow(tagsString: string | null): Tag[] {
    if (!tagsString) return [];

    return tagsString.split(',').map(tagStr => {
      const [name, color] = tagStr.split('::');
      return { name, color: color || '#ffffff' }; // Provide default color
    }).filter(tag => tag.name); // Ensure name exists
  }

  private async associateTagsWithThought(thoughtId: string, tags: Array<{ name: string; color: string }>): Promise<void> {
    if (!this.db || !tags.length) {
      return Promise.resolve();
    }

    const db = this.db;
    const now = new Date().toISOString();
    const insertTagQuery = 'INSERT OR IGNORE INTO tags (tag_id, name, color, created_at) VALUES (?, ?, ?, ?)';
    const linkTagQuery = 'INSERT OR IGNORE INTO thought_tags (thought_bubble_id, tag_id, created_at) VALUES (?, ?, ?)';

    const tagOperations: Promise<void>[] = tags.map(tag => {
      return new Promise<void>((resolveTag, rejectTag) => {
        const tagId = `tag_${tag.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;

        db.run(insertTagQuery, [tagId, tag.name, tag.color || '#ffffff', now], function(this: SQLiteRunResult, errCreateTag: Error | null) {
          if (errCreateTag) {
            logger.error(`Error creating tag '${tag.name}':`, errCreateTag);
            return rejectTag(errCreateTag);
          }

          db.run(linkTagQuery, [thoughtId, tagId, now], function(this: SQLiteRunResult, errLinkTag: Error | null) {
            if (errLinkTag) {
              logger.error(`Error linking tag '${tag.name}' to thought '${thoughtId}':`, errLinkTag);
              return rejectTag(errLinkTag);
            }
            resolveTag();
          });
        });
      });
    });

    try {
      await Promise.all(tagOperations);
    } catch (error) {
      logger.error(`Error in associateTagsWithThought for thought '${thoughtId}':`, error);
      // Re-throw the error to ensure the calling function (updateThoughtTags) can catch it for rollback
      throw error;
    }
  }

  private async updateThoughtTags(thoughtId: string, tags: Array<{ name: string; color: string }>): Promise<void> {
    const db = this.db;
    if (!db) {
      throw new Error('Database not initialized');
    }
    // TODO: Refactor this to use async/await or promisified db calls to satisfy TS7030 without disable.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore TS7030: Not all code paths return a value (tsc struggles with nested sqlite3 callbacks for db.serialize pattern).
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION;', (errBegin: Error | null) => {
          if (errBegin) return reject(errBegin);

          const deleteQuery = 'DELETE FROM thought_tags WHERE thought_bubble_id = ?';
          db.run(deleteQuery, [thoughtId], (errDelete: Error | null) => {
            if (errDelete) {
              logger.error('Failed to delete old tags, rolling back.', errDelete);
              return db.run('ROLLBACK;', () => reject(errDelete));
            }

            this.associateTagsWithThought(thoughtId, tags)
              .then(() => {
                db.run('COMMIT;', (errCommit: Error | null) => {
                  if (errCommit) return reject(errCommit);
                  resolve();
                });
              })
              .catch((associationError: unknown) => {
                logger.error('Failed to associate new tags, rolling back.', associationError);
                db.run('ROLLBACK;', () => {
                  if (associationError instanceof Error) {
                    reject(associationError);
                  } else {
                    reject(new Error(`Unknown error associating tags: ${String(associationError)}`));
                  }
                });
              });
          });
        });
      });
    });
  }
}
import sqlite3, { Database } from 'sqlite3';
import { StorageAdapter, NewThoughtData, NewSegmentData } from '../../contracts/storageAdapter';
import { Thought, Segment, Tag } from '../../contracts/entities';
import { generateThoughtId, generateSegmentId } from '../utils/idUtils';
import { logger } from '../utils/logger';

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
          logger.info(`Connected to SQLite database at ${this.dbPath}`); // Changed to info
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
            logger.info('Database connection closed'); // Changed to info
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async getAllThoughts(userId?: string): Promise<Thought[]> { // Add userId
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

      this.db.all(query, async (err: Error | null, rows: any[]) => {
        if (err) {
          logger.error('Error fetching thoughts:', err);
          reject(err);
          return;
        }

        try {
          const thoughts: Thought[] = [];
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
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async getThoughtById(thoughtId: string, userId?: string): Promise<Thought | null> { // Add userId
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

      this.db.get(query, [thoughtId], async (err: Error | null, row: any) => {
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
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async createThought(thoughtData: NewThoughtData, userId?: string): Promise<Thought> { // Add userId
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const thoughtId = generateThoughtId();
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
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this; // Capture class instance 'this'

      this.db.run(insertQuery, values, async function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          logger.error('Error creating thought:', err);
          reject(err);
          return;
        }

        try {
          // Handle tags if provided
          if (thoughtData.tags && thoughtData.tags.length > 0) {
            await self.associateTagsWithThought(thoughtId, thoughtData.tags);
          }

          const createdThought = await self.getThoughtById(thoughtId, userId); // Add userId
          if (createdThought) {
            logger.info(`Created thought: ${thoughtId}`); // Changed to info
            resolve(createdThought);
          } else {
            reject(new Error('Failed to retrieve created thought'));
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            reject(error);
          } else {
            reject(new Error(`An unknown error occurred during thought creation: ${String(error)}`));
          }
        }
      });
    });
  }

  async updateThought(thoughtId: string, updates: Partial<NewThoughtData>, userId?: string): Promise<Thought | null> { // Add userId
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const updateFields: string[] = [];
      const values: any[] = [];

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
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this; // Capture class instance 'this'

      this.db.run(query, values, async function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          logger.error('Error updating thought:', err);
          reject(err);
          return;
        }

        try {
          // Handle tag updates if provided
          if (updates.tags !== undefined) {
            await self.updateThoughtTags(thoughtId, updates.tags);
          }

          const updatedThought = await self.getThoughtById(thoughtId, userId); // Use self and pass userId
          resolve(updatedThought);
        } catch (error: unknown) {
          if (error instanceof Error) {
            reject(error);
          } else {
            reject(new Error(`An unknown error occurred during thought update: ${String(error)}`));
          }
        }
      });
    });
  }

  async deleteThought(thoughtId: string, userId?: string): Promise<boolean> { // Add userId
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      // Due to CASCADE constraints, deleting the thought will also delete related records
      const query = 'DELETE FROM thoughts WHERE thought_bubble_id = ?';

      this.db.run(query, [thoughtId], function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          logger.error('Error deleting thought:', err);
          reject(err);
          return;
        }

        const deleted = this.changes > 0; // 'this' is now correctly typed (implicitly by sqlite3)
        if (deleted) {
          logger.info(`Deleted thought: ${thoughtId}`); // Changed to info
        }
        resolve(deleted);
      });
    });
  }

  async getSegmentsForThought(thoughtId: string, userId?: string): Promise<Segment[]> { // Add userId
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const query = 'SELECT * FROM segments WHERE thought_bubble_id = ? ORDER BY sort_order, created_at';

      this.db.all(query, [thoughtId], (err: Error | null, rows: any[]) => {
        if (err) {
          logger.error('Error fetching segments:', err);
          reject(err);
          return;
        }

        const segments: Segment[] = rows.map(row => ({
          segment_id: row.segment_id,
          thought_bubble_id: row.thought_bubble_id,
          title: row.title,
          content: row.content || '',
          content_type: 'text', // Default for now, can be enhanced later
          fields: row.metadata ? JSON.parse(row.metadata) : {},
          created_at: row.created_at,
          updated_at: row.updated_at,
          abstraction_level: 'Fact', // Default for now
          local_priority: 0.5, // Default for now
          cluster_id: 'uncategorized'
        }));

        resolve(segments);
      });
    });
  }

  async getSegmentById(segmentId: string, userId?: string): Promise<Segment | null> { // Add userId
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const query = 'SELECT * FROM segments WHERE segment_id = ?';

      this.db.get(query, [segmentId], (err: Error | null, row: any) => {
        if (err) {
          logger.error('Error fetching segment:', err);
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

  async createSegment(thoughtId: string, segmentData: NewSegmentData, userId?: string): Promise<Segment> { // Add userId
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const segmentId = generateSegmentId();
      const now = new Date().toISOString();

      const query = `
        INSERT INTO segments (segment_id, thought_bubble_id, title, content, created_at, updated_at, sort_order, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        segmentId,
        thoughtId,
        segmentData.title || null, // Add title, defaulting to null
        segmentData.content,
        now,
        now,
        0, // Default sort order
        JSON.stringify(segmentData.fields || {})
      ];
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this; // Capture class instance 'this'

      this.db.run(query, values, async function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          logger.error('Error creating segment:', err);
          reject(err);
          return;
        }

        try {
          const createdSegment = await self.getSegmentById(segmentId, userId); // Use self and pass userId
          if (createdSegment) {
            logger.info(`Created segment: ${segmentId}`); // Changed to info
            resolve(createdSegment);
          } else {
            reject(new Error('Failed to retrieve created segment'));
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            reject(error);
          } else {
            reject(new Error(`An unknown error occurred during segment creation: ${String(error)}`));
          }
        }
      });
    });
  }

  async updateSegment(thoughtId: string, segmentId: string, updates: Partial<NewSegmentData>, userId?: string): Promise<Segment | null> { // Add userId
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const updateFields: string[] = [];
      const values: any[] = [];

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
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this; // Capture class instance 'this'

      this.db.run(query, values, async function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          logger.error('Error updating segment:', err);
          reject(err);
          return;
        }

        try {
          const updatedSegment = await self.getSegmentById(segmentId, userId); // Use self and pass userId
          resolve(updatedSegment);
        } catch (error: unknown) {
          if (error instanceof Error) {
            reject(error);
          } else {
            reject(new Error(`An unknown error occurred during segment update: ${String(error)}`));
          }
        }
      });
    });
  }

  async deleteSegment(thoughtId: string, segmentId: string, userId?: string): Promise<boolean> { // Add userId
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const query = 'DELETE FROM segments WHERE segment_id = ?';

      this.db.run(query, [segmentId], function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          logger.error('Error deleting segment:', err);
          reject(err);
          return;
        }

        const deleted = this.changes > 0; // 'this' is now correctly typed (implicitly by sqlite3)
        if (deleted) {
          logger.info(`Deleted segment: ${segmentId}`); // Changed to info
        }
        resolve(deleted);
      });
    });
  }

  // Helper methods

  private parseTagsFromRow(tagsString: string | null): Tag[] {
    if (!tagsString) return [];

    return tagsString.split(',').map(tagStr => {
      const [name, color] = tagStr.split('::');
      return { name, color };
    }).filter(tag => tag.name && tag.color);
  }

  private async associateTagsWithThought(thoughtId: string, tags: Array<{ name: string; color: string }>): Promise<void> {
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
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this; // Capture class instance 'this'

      for (const tag of tags) {
        const tagId = `tag_${tag.name.toLowerCase().replace(/\s+/g, '_')}`;

        self.db!.run(insertTagQuery, [tagId, tag.name, tag.color, now], function(this: sqlite3.RunResult, err: Error | null) { // Use self.db!
          if (err) {
            logger.error('Error creating tag:', err);
            reject(err);
            return;
          }

          self.db!.run(linkTagQuery, [thoughtId, tagId, now], function(this: sqlite3.RunResult, err: Error | null) { // Use self.db!
            if (err) {
              logger.error('Error linking tag to thought:', err);
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

  private async updateThoughtTags(thoughtId: string, tags: Array<{ name: string; color: string }>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      // First remove existing tag associations
      const deleteQuery = 'DELETE FROM thought_tags WHERE thought_bubble_id = ?';
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this; // Capture class instance 'this'

      this.db.run(deleteQuery, [thoughtId], async function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          reject(err);
          return;
        }

        try {
          await self.associateTagsWithThought(thoughtId, tags); // Use self
          resolve();
        } catch (error: unknown) {
          if (error instanceof Error) {
            reject(error);
          } else {
            reject(new Error(`An unknown error occurred during thought tag update: ${String(error)}`));
          }
        }
      });
    });
  }
}
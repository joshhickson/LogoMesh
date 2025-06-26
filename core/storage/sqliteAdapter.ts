import * as sqlite3 from 'sqlite3';
// import { Database } from 'sqlite3'; // No longer typed due to declare module
import { StorageAdapter, NewThoughtData, NewSegmentData } from 'contracts/storageAdapter'; // Path mapping
import { Thought, Segment, Tag } from 'contracts/entities'; // Path mapping
import { generateThoughtId, generateSegmentId } from 'core/utils/idUtils'; // Path mapping
import { logger } from 'core/utils/logger'; // Path mapping

/**
 * SQLite implementation of the StorageAdapter interface
 * Handles all database operations with proper DTO <-> DB mapping
 */
export class SQLiteStorageAdapter implements StorageAdapter {
  private db: any | null = null; // Changed Database to any

  constructor(private dbPath: string) {}

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err: any) => { // : any
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
        this.db.close((err: any) => { // : any
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

  async getAllThoughts(): Promise<Thought[]> {
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

      this.db.all(query, async (err: any, rows: any[]) => { // : any
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

  async getThoughtById(thoughtId: string): Promise<Thought | null> {
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

      this.db.get(query, [thoughtId], async (err: any, row: any) => { // : any
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

  async createThought(thoughtData: NewThoughtData): Promise<Thought> {
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

      this.db.run(insertQuery, values, async (err: any) => { // : any
        if (err) {
          logger.error('Error creating thought:', err);
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
            logger.info(`Created thought: ${thoughtId}`); // Changed to info
            resolve(createdThought);
          } else {
            reject(new Error('Failed to retrieve created thought'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async updateThought(thoughtId: string, updates: Partial<NewThoughtData>): Promise<Thought | null> {
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

      this.db.run(query, values, async (err: any) => { // : any
        if (err) {
          logger.error('Error updating thought:', err);
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
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async deleteThought(thoughtId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      // Due to CASCADE constraints, deleting the thought will also delete related records
      const query = 'DELETE FROM thoughts WHERE thought_bubble_id = ?';

      this.db.run(query, [thoughtId], function(this: any, err: any) { // Changed sqlite3.RunResult to any
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

  async getSegmentsForThought(thoughtId: string): Promise<Segment[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const query = 'SELECT * FROM segments WHERE thought_bubble_id = ? ORDER BY sort_order, created_at';

      this.db.all(query, [thoughtId], (err: any, rows: any[]) => { // : any
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

  async getSegmentById(segmentId: string): Promise<Segment | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const query = 'SELECT * FROM segments WHERE segment_id = ?';

      this.db.get(query, [segmentId], (err: any, row: any) => { // : any
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

  async createSegment(thoughtId: string, segmentData: NewSegmentData): Promise<Segment> {
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
        segmentData.title,
        segmentData.content,
        now,
        now,
        0, // Default sort order
        JSON.stringify(segmentData.fields || {})
      ];

      this.db.run(query, values, async (err: any) => { // : any
        if (err) {
          logger.error('Error creating segment:', err);
          reject(err);
          return;
        }

        try {
          const createdSegment = await this.getSegmentById(segmentId);
          if (createdSegment) {
            logger.info(`Created segment: ${segmentId}`); // Changed to info
            resolve(createdSegment);
          } else {
            reject(new Error('Failed to retrieve created segment'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async updateSegment(segmentId: string, updates: Partial<NewSegmentData>): Promise<Segment | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const updateFields: string[] = [];
      const values: any[] = [];

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

      this.db.run(query, values, async (err: any) => { // : any
        if (err) {
          logger.error('Error updating segment:', err);
          reject(err);
          return;
        }

        try {
          const updatedSegment = await this.getSegmentById(segmentId);
          resolve(updatedSegment);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async deleteSegment(segmentId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const query = 'DELETE FROM segments WHERE segment_id = ?';

      this.db.run(query, [segmentId], function(this: any, err: any) { // Changed sqlite3.RunResult to any
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

      for (const tag of tags) {
        const tagId = `tag_${tag.name.toLowerCase().replace(/\s+/g, '_')}`;

        this.db.run(insertTagQuery, [tagId, tag.name, tag.color, now], (err: any) => { // : any
          if (err) {
            logger.error('Error creating tag:', err);
            reject(err);
            return;
          }

          this.db.run(linkTagQuery, [thoughtId, tagId, now], (err: any) => { // : any
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

      this.db.run(deleteQuery, [thoughtId], async (err: any) => { // : any
        if (err) {
          reject(err);
          return;
        }

        try {
          await this.associateTagsWithThought(thoughtId, tags);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}
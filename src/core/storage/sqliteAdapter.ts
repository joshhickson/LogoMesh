import sqlite3 from 'sqlite3';
import { StorageAdapter, NewThoughtData, NewSegmentData } from '../../contracts/storageAdapter';
import { Thought, Segment, Tag, FieldValue } from '../../contracts/entities';
import { logger } from '../utils/logger'; // Assuming logger exists at this path

// Helper function to run a single SQL query as a Promise
const runQuery = (db: sqlite3.Database, sql: string, params: any[] = []): Promise<sqlite3.RunResult> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) { // Use function keyword to access `this` from sqlite
      if (err) {
        logger.error(`SQL Error: ${err.message} running query: ${sql} with params: ${params}`);
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

// Helper function to get a single row as a Promise
const getQuery = <T>(db: sqlite3.Database, sql: string, params: any[] = []): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row: T) => {
      if (err) {
        logger.error(`SQL Error: ${err.message} running query: ${sql} with params: ${params}`);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Helper function to get all rows as a Promise
const allQuery = <T>(db: sqlite3.Database, sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows: T[]) => {
      if (err) {
        logger.error(`SQL Error: ${err.message} running query: ${sql} with params: ${params}`);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};


export class SQLiteStorageAdapter implements StorageAdapter {
  private db: sqlite3.Database;

  constructor(dbPath: string) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error(`Failed to connect to SQLite database at ${dbPath}: ${err.message}`);
      } else {
        logger.info(`Successfully connected to SQLite database at ${dbPath}`);
        this.initializeSchema().catch(error => {
            logger.error(`Failed to initialize database schema: ${error.message}`);
        });
      }
    });
  }

  private async initializeSchema(): Promise<void> {
    logger.info('Initializing database schema...');
    try {
      await runQuery(this.db, `
        CREATE TABLE IF NOT EXISTS thoughts (
          thought_bubble_id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          position_x REAL,
          position_y REAL,
          color TEXT
        )
      `);
      logger.info('Table "thoughts" created or already exists.');

      await runQuery(this.db, `
        CREATE TABLE IF NOT EXISTS segments (
          segment_id TEXT PRIMARY KEY,
          thought_bubble_id TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          content_type TEXT NOT NULL DEFAULT 'text',
          asset_path TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          abstraction_level TEXT NOT NULL DEFAULT 'Fact',
          local_priority REAL DEFAULT 0.5,
          cluster_id TEXT DEFAULT 'uncategorized_cluster',
          FOREIGN KEY (thought_bubble_id) REFERENCES thoughts (thought_bubble_id) ON DELETE CASCADE
        )
      `);
      logger.info('Table "segments" created or already exists.');

      await runQuery(this.db, `
        CREATE TABLE IF NOT EXISTS tags (
          tag_id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          color TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
      logger.info('Table "tags" created or already exists.');

      await runQuery(this.db, `
        CREATE TABLE IF NOT EXISTS thought_tags (
          thought_tag_id TEXT PRIMARY KEY,
          thought_id TEXT NOT NULL,
          tag_id TEXT NOT NULL,
          FOREIGN KEY (thought_id) REFERENCES thoughts (thought_bubble_id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags (tag_id) ON DELETE CASCADE,
          UNIQUE (thought_id, tag_id)
        )
      `);
      logger.info('Table "thought_tags" created or already exists.');

      await runQuery(this.db, `
        CREATE TABLE IF NOT EXISTS segment_tags (
          segment_tag_id TEXT PRIMARY KEY,
          segment_id TEXT NOT NULL,
          tag_id TEXT NOT NULL,
          FOREIGN KEY (segment_id) REFERENCES segments (segment_id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags (tag_id) ON DELETE CASCADE,
          UNIQUE (segment_id, tag_id)
        )
      `);
      logger.info('Table "segment_tags" created or already exists.');

      await runQuery(this.db, `
        CREATE TABLE IF NOT EXISTS segment_fields (
          field_id TEXT PRIMARY KEY,
          segment_id TEXT NOT NULL,
          name TEXT NOT NULL,
          value TEXT NOT NULL, -- Storing all values as TEXT for simplicity, parse on retrieval
          type TEXT NOT NULL, -- 'string', 'number', 'boolean', 'Date', 'string[]', 'number[]'
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (segment_id) REFERENCES segments (segment_id) ON DELETE CASCADE
        )
      `);
      logger.info('Table "segment_fields" created or already exists.');
      logger.info('Database schema initialization complete.');
    } catch (error) {
        const err = error as Error;
        logger.error(`Error initializing schema: ${err.message}`);
        throw err; // Re-throw to be caught by constructor if needed
    }
  }

  // --- Thought CRUD Methods (Part 1) ---

  async createThought(data: NewThoughtData): Promise<Thought> {
    const thought_bubble_id = `tb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    const newThought: Thought = {
      thought_bubble_id,
      title: data.title,
      description: data.description,
      created_at: now,
      updated_at: now,
      position: data.position,
      color: data.color,
      segments: [], // New thoughts start with no segments
      tags: [],     // New thoughts start with no tags
    };

    const sql = `
      INSERT INTO thoughts (thought_bubble_id, title, description, created_at, updated_at, position_x, position_y, color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      newThought.thought_bubble_id,
      newThought.title,
      newThought.description,
      newThought.created_at,
      newThought.updated_at,
      newThought.position?.x,
      newThought.position?.y,
      newThought.color,
    ];

    try {
      await runQuery(this.db, sql, params);
      logger.info(`Thought created successfully with ID: ${newThought.thought_bubble_id}`);
      // Fetch the thought back to ensure it's correctly stored, including defaults from DB if any (none in this case)
      return this.getThoughtById(newThought.thought_bubble_id).then(thought => {
        if (!thought) throw new Error('Failed to retrieve thought after creation');
        return thought;
      });
    } catch (error) {
      const err = error as Error;
      logger.error(`Error creating thought: ${err.message}`);
      throw err;
    }
  }

  async getAllThoughts(): Promise<Thought[]> {
    const thoughtsSql = `SELECT * FROM thoughts`;
    try {
      const rows = await allQuery<any>(this.db, thoughtsSql);
      const thoughts: Thought[] = [];

      for (const row of rows) {
        const thought: Thought = {
          thought_bubble_id: row.thought_bubble_id,
          title: row.title,
          description: row.description,
          created_at: row.created_at,
          updated_at: row.updated_at,
          position: (row.position_x !== null && row.position_y !== null) ? { x: row.position_x, y: row.position_y } : undefined,
          color: row.color,
          segments: await this.getSegmentsForThought(row.thought_bubble_id),
          tags: await this.getTagsForThought(row.thought_bubble_id),
        };
        thoughts.push(thought);
      }
      logger.info(`Retrieved ${thoughts.length} thoughts.`);
      return thoughts;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error getting all thoughts: ${err.message}`);
      throw err;
    }
  }

  async getThoughtById(thoughtId: string): Promise<Thought | undefined> {
    const sql = `SELECT * FROM thoughts WHERE thought_bubble_id = ?`;
    try {
      const row = await getQuery<any>(this.db, sql, [thoughtId]);
      if (!row) {
        logger.warn(`Thought with ID: ${thoughtId} not found.`);
        return undefined;
      }

      const thought: Thought = {
        thought_bubble_id: row.thought_bubble_id,
        title: row.title,
        description: row.description,
        created_at: row.created_at,
        updated_at: row.updated_at,
        position: (row.position_x !== null && row.position_y !== null) ? { x: row.position_x, y: row.position_y } : undefined,
        color: row.color,
        segments: await this.getSegmentsForThought(row.thought_bubble_id),
        tags: await this.getTagsForThought(row.thought_bubble_id),
      };
      logger.info(`Retrieved thought with ID: ${thoughtId}`);
      return thought;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error getting thought by ID ${thoughtId}: ${err.message}`);
      throw err;
    }
  }
  
  // --- Helper methods for populating nested data ---

  private async getFieldsForSegment(segmentId: string): Promise<Record<string, FieldValue>> {
    const sql = `SELECT name, value, type FROM segment_fields WHERE segment_id = ?`;
    try {
      const rows = await allQuery<{ name: string; value: string; type: string }>(this.db, sql, [segmentId]);
      const fields: Record<string, FieldValue> = {};
      for (const row of rows) {
        // Deserialize value based on type
        switch (row.type) {
          case 'number':
            fields[row.name] = parseFloat(row.value);
            break;
          case 'boolean':
            fields[row.name] = row.value === 'true';
            break;
          case 'Date':
            fields[row.name] = new Date(row.value);
            break;
          case 'string[]':
            fields[row.name] = JSON.parse(row.value);
            break;
          case 'number[]':
            fields[row.name] = JSON.parse(row.value).map(Number);
            break;
          default: // string and others
            fields[row.name] = row.value;
        }
      }
      return fields;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error getting fields for segment ${segmentId}: ${err.message}`);
      return {}; // Return empty object on error
    }
  }

  private async getTagsForSegment(segmentId: string): Promise<Tag[]> {
    const sql = `
      SELECT t.name, t.color
      FROM tags t
      JOIN segment_tags st ON t.tag_id = st.tag_id
      WHERE st.segment_id = ?
    `;
    try {
      // The Tag type in entities.ts only defines name and color.
      // If tag_id, created_at, updated_at were part of the Tag type, they would be selected here.
      const rows = await allQuery<{name: string, color: string}>(this.db, sql, [segmentId]);
      return rows;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error getting tags for segment ${segmentId}: ${err.message}`);
      return [];
    }
  }
  
  async getSegmentsForThought(thoughtId: string): Promise<Segment[]> {
    const segmentsSql = `SELECT * FROM segments WHERE thought_bubble_id = ?`;
    try {
      const segmentRows = await allQuery<any>(this.db, segmentsSql, [thoughtId]);
      const segments: Segment[] = [];
      for (const row of segmentRows) {
        const segment: Segment = {
          segment_id: row.segment_id,
          thought_bubble_id: row.thought_bubble_id,
          title: row.title,
          content: row.content,
          content_type: row.content_type,
          asset_path: row.asset_path,
          created_at: row.created_at,
          updated_at: row.updated_at,
          abstraction_level: row.abstraction_level,
          local_priority: row.local_priority,
          cluster_id: row.cluster_id,
          fields: await this.getFieldsForSegment(row.segment_id),
          // Tags for segments will be fetched by a dedicated helper getTagsForSegment
          // The Segment entity in entities.ts does not have a 'tags' property.
          // If it were to be added, it would be populated here:
          // tags: await this.getTagsForSegment(row.segment_id),
        };
        segments.push(segment);
      }
      return segments;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error getting segments for thought ${thoughtId}: ${err.message}`);
      throw err; // Rethrow or return empty array depending on desired error handling
    }
  }

  private async getTagsForThought(thoughtId: string): Promise<Tag[]> {
    const sql = `
      SELECT t.name, t.color
      FROM tags t
      JOIN thought_tags tt ON t.tag_id = tt.tag_id
      WHERE tt.thought_id = ?
    `;
    try {
      // The Tag type in entities.ts only defines name and color.
      const rows = await allQuery<{name: string, color: string}>(this.db, sql, [thoughtId]);
      return rows;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error getting tags for thought ${thoughtId}: ${err.message}`);
      return [];
    }
  }

  // --- Thought CRUD Methods (Part 2) ---

  async updateThought(thoughtId: string, updates: Partial<Omit<Thought, 'thought_bubble_id' | 'created_at' | 'segments' | 'tags'>>): Promise<Thought | undefined> {
    const setClauses: string[] = [];
    const params: any[] = [];
    
    // Add fields to update, ensuring not to update id, created_at, segments, or tags directly
    if (updates.title !== undefined) {
      setClauses.push('title = ?');
      params.push(updates.title);
    }
    if (updates.description !== undefined) {
      setClauses.push('description = ?');
      params.push(updates.description);
    }
    if (updates.position !== undefined) {
      setClauses.push('position_x = ?');
      params.push(updates.position.x);
      setClauses.push('position_y = ?');
      params.push(updates.position.y);
    }
    if (updates.color !== undefined) {
      setClauses.push('color = ?');
      params.push(updates.color);
    }

    if (setClauses.length === 0) {
      logger.warn(`No updatable fields provided for thought ID: ${thoughtId}.`);
      return this.getThoughtById(thoughtId); // Return current state if no updates
    }

    setClauses.push('updated_at = ?');
    params.push(new Date().toISOString());

    const sql = `UPDATE thoughts SET ${setClauses.join(', ')} WHERE thought_bubble_id = ?`;
    params.push(thoughtId);

    try {
      const result = await runQuery(this.db, sql, params);
      if (result.changes === 0) {
        logger.warn(`Thought with ID: ${thoughtId} not found for update.`);
        return undefined;
      }
      logger.info(`Thought with ID: ${thoughtId} updated successfully.`);
      return this.getThoughtById(thoughtId);
    } catch (error) {
      const err = error as Error;
      logger.error(`Error updating thought ID ${thoughtId}: ${err.message}`);
      throw err;
    }
  }

  async deleteThought(thoughtId: string): Promise<boolean> {
    // ON DELETE CASCADE for thought_bubble_id in 'segments' table will delete associated segments.
    // ON DELETE CASCADE for thought_id in 'thought_tags' table will delete associated thought_tags.
    // ON DELETE CASCADE for segment_id in 'segment_fields' and 'segment_tags' will handle segment sub-data.
    const sql = `DELETE FROM thoughts WHERE thought_bubble_id = ?`;
    try {
      const result = await runQuery(this.db, sql, [thoughtId]);
      if (result.changes === 0) {
        logger.warn(`Thought with ID: ${thoughtId} not found for deletion.`);
        return false;
      }
      logger.info(`Thought with ID: ${thoughtId} and its associated data deleted successfully.`);
      return true;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error deleting thought ID ${thoughtId}: ${err.message}`);
      throw err;
    }
  }

  // --- Segment CRUD Methods (Part 1) ---

  async createSegment(thoughtId: string, data: NewSegmentData): Promise<Segment> {
    const segment_id = `seg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    const newSegment: Omit<Segment, 'fields'> & { fields: Record<string, FieldValue> } = { // Prepare for full segment object
      segment_id,
      thought_bubble_id: thoughtId,
      title: data.title,
      content: data.content,
      content_type: data.content_type || 'text',
      asset_path: data.asset_path,
      created_at: now,
      updated_at: now,
      abstraction_level: data.abstraction_level || 'Fact',
      local_priority: data.local_priority === undefined ? 0.5 : data.local_priority,
      cluster_id: data.cluster_id || 'uncategorized_cluster',
      fields: data.fields || {},
      // `embedding_vector` is not in NewSegmentData, so it's omitted here.
      // Tags are handled by addTagToSegment.
    };

    const segmentSql = `
      INSERT INTO segments (segment_id, thought_bubble_id, title, content, content_type, asset_path, created_at, updated_at, abstraction_level, local_priority, cluster_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const segmentParams = [
      newSegment.segment_id, newSegment.thought_bubble_id, newSegment.title, newSegment.content,
      newSegment.content_type, newSegment.asset_path, newSegment.created_at, newSegment.updated_at,
      newSegment.abstraction_level, newSegment.local_priority, newSegment.cluster_id,
    ];

    try {
      await runQuery(this.db, segmentSql, segmentParams);
      logger.info(`Segment created with ID: ${newSegment.segment_id} for thought ID: ${thoughtId}`);

      if (data.fields) {
        await this.updateSegmentFieldsInternal(newSegment.segment_id, data.fields, now);
      }
      
      // Fetch the complete segment to return
      const completeSegment = await this.getSegmentById(newSegment.segment_id);
      if (!completeSegment) {
        throw new Error('Failed to retrieve segment after creation.');
      }
      return completeSegment;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error creating segment for thought ID ${thoughtId}: ${err.message}`);
      throw err;
    }
  }

  async getSegmentById(segmentId: string): Promise<Segment | undefined> {
    const sql = `SELECT * FROM segments WHERE segment_id = ?`;
    try {
      const row = await getQuery<any>(this.db, sql, [segmentId]);
      if (!row) {
        logger.warn(`Segment with ID: ${segmentId} not found.`);
        return undefined;
      }

      const segment: Segment = {
        segment_id: row.segment_id,
        thought_bubble_id: row.thought_bubble_id,
        title: row.title,
        content: row.content,
        content_type: row.content_type,
        asset_path: row.asset_path,
        created_at: row.created_at,
        updated_at: row.updated_at,
        abstraction_level: row.abstraction_level,
        local_priority: row.local_priority,
        cluster_id: row.cluster_id,
        fields: await this.getFieldsForSegment(row.segment_id),
        // embedding_vector: row.embedding_vector ? JSON.parse(row.embedding_vector) : undefined,
        // Tags are not part of the Segment entity in entities.ts
        // If they were, they would be fetched here:
        // tags: await this.getTagsForSegment(row.segment_id),
      };
      logger.info(`Retrieved segment with ID: ${segmentId}`);
      return segment;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error getting segment by ID ${segmentId}: ${err.message}`);
      throw err;
    }
  }
  
  // --- Stubs for other StorageAdapter methods ---
  // --- Segment CRUD Methods (Part 2) ---

  async updateSegment(
    segmentId: string,
    updates: Partial<Omit<Segment, 'segment_id' | 'thought_bubble_id' | 'created_at' /* fields handled by updateSegmentFields */ >>
  ): Promise<Segment | undefined> {
    const setClauses: string[] = [];
    const params: any[] = [];
    const now = new Date().toISOString();

    // Standard segment fields
    if (updates.title !== undefined) { setClauses.push('title = ?'); params.push(updates.title); }
    if (updates.content !== undefined) { setClauses.push('content = ?'); params.push(updates.content); }
    if (updates.content_type !== undefined) { setClauses.push('content_type = ?'); params.push(updates.content_type); }
    if (updates.asset_path !== undefined) { setClauses.push('asset_path = ?'); params.push(updates.asset_path); }
    if (updates.abstraction_level !== undefined) { setClauses.push('abstraction_level = ?'); params.push(updates.abstraction_level); }
    if (updates.local_priority !== undefined) { setClauses.push('local_priority = ?'); params.push(updates.local_priority); }
    if (updates.cluster_id !== undefined) { setClauses.push('cluster_id = ?'); params.push(updates.cluster_id); }
    // embedding_vector is not part of Omit Segment above, so not handled here.

    if (setClauses.length > 0) {
      setClauses.push('updated_at = ?');
      params.push(now);

      const sql = `UPDATE segments SET ${setClauses.join(', ')} WHERE segment_id = ?`;
      params.push(segmentId);

      try {
        const result = await runQuery(this.db, sql, params);
        if (result.changes === 0) {
          logger.warn(`Segment with ID: ${segmentId} not found for update.`);
          // If segment not found, no point proceeding with field updates
          return undefined; 
        }
        logger.info(`Segment core fields for ID: ${segmentId} updated successfully.`);
      } catch (error) {
        const err = error as Error;
        logger.error(`Error updating core fields for segment ID ${segmentId}: ${err.message}`);
        throw err;
      }
    }

    // Handle 'fields' separately using updateSegmentFieldsInternal if present in updates
    // The Omit type for updates already excludes 'fields', so this check is more for conceptual clarity
    // if (updates.fields) { // This condition will currently always be false due to Omit
    //    await this.updateSegmentFieldsInternal(segmentId, updates.fields, now);
    // }
    // If `updates.fields` were allowed, we'd call:
    // if ('fields' in updates && updates.fields !== undefined) {
    //   await this.updateSegmentFieldsInternal(segmentId, updates.fields, now);
    //   // If only fields were updated, and no other segment props, ensure updated_at is set for the segment itself
    //   if (setClauses.length === 0) {
    //      const updateSegmentTimestampSql = `UPDATE segments SET updated_at = ? WHERE segment_id = ?`;
    //      await runQuery(this.db, updateSegmentTimestampSql, [now, segmentId]);
    //   }
    // }


    // If any updates happened (either core fields or potentially segment fields if allowed),
    // or even if no updates, we fetch the segment to return its current state.
    // If core fields update failed to find segment, we would have returned undefined already.
    // If only fields were updated, this ensures the segment's own updated_at is also current.
    if (setClauses.length > 0) { // only re-fetch if segment table itself was updated
        return this.getSegmentById(segmentId);
    } else {
        // If no updatable segment properties were provided, we still might need to check if segment exists
        const existingSegment = await this.getSegmentById(segmentId);
        if (!existingSegment) {
            logger.warn(`Segment with ID: ${segmentId} not found.`);
            return undefined;
        }
        logger.warn(`No updatable segment properties provided for segment ID: ${segmentId}. Returning current state.`);
        return existingSegment;
    }
  }

  async deleteSegment(segmentId: string): Promise<boolean> {
    logger.info(`deleteSegment called for ${segmentId}`);
    const sql = `DELETE FROM segments WHERE segment_id = ?`;
    try {
      const result = await runQuery(this.db, sql, [segmentId]);
      if (result.changes === 0) {
        logger.warn(`Segment with ID: ${segmentId} not found for deletion.`);
        return false;
      }
      logger.info(`Segment with ID: ${segmentId} deleted successfully.`);
      return true;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error deleting segment ID ${segmentId}: ${err.message}`);
      throw err;
    }
  }

  // --- Tag Management Methods ---

  // Helper to find or create a tag, returns tag_id
  private async findOrCreateTag(tagData: Tag): Promise<string | undefined> {
    const now = new Date().toISOString();
    let tagRow = await getQuery<{ tag_id: string }>(this.db, `SELECT tag_id FROM tags WHERE name = ?`, [tagData.name]);

    if (tagRow) {
      // Tag exists, check if color needs update
      if (tagData.color) {
        const currentTag = await getQuery<{ color: string }>(this.db, `SELECT color FROM tags WHERE tag_id = ?`, [tagRow.tag_id]);
        if (currentTag && currentTag.color !== tagData.color) {
          await runQuery(this.db, `UPDATE tags SET color = ?, updated_at = ? WHERE tag_id = ?`, [tagData.color, now, tagRow.tag_id]);
          logger.info(`Tag "${tagData.name}" color updated.`);
        }
      }
      return tagRow.tag_id;
    } else {
      // Tag does not exist, create it
      const tag_id = `tag_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const insertTagSql = `INSERT INTO tags (tag_id, name, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`;
      try {
        await runQuery(this.db, insertTagSql, [tag_id, tagData.name, tagData.color || '#CCCCCC', now, now]); // Default color if not provided
        logger.info(`Tag "${tagData.name}" created with ID: ${tag_id}.`);
        return tag_id;
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('UNIQUE constraint failed: tags.name')) { // Race condition check
            logger.warn(`Tag "${tagData.name}" was likely created by a concurrent operation. Fetching existing.`);
            tagRow = await getQuery<{ tag_id: string }>(this.db, `SELECT tag_id FROM tags WHERE name = ?`, [tagData.name]);
            return tagRow?.tag_id;
        }
        logger.error(`Error creating tag "${tagData.name}": ${err.message}`);
        throw err;
      }
    }
  }

  async addTagToThought(thoughtId: string, tagData: Tag): Promise<Thought | undefined> {
    try {
      const tag_id = await this.findOrCreateTag(tagData);
      if (!tag_id) {
        logger.error(`Failed to find or create tag for name: ${tagData.name}`);
        return this.getThoughtById(thoughtId); // Or throw error
      }

      const thoughtTagId = `tt_${thoughtId}_${tag_id}`;
      const insertThoughtTagSql = `INSERT INTO thought_tags (thought_tag_id, thought_id, tag_id) VALUES (?, ?, ?)`;
      try {
        await runQuery(this.db, insertThoughtTagSql, [thoughtTagId, thoughtId, tag_id]);
        logger.info(`Tag "${tagData.name}" (ID: ${tag_id}) added to thought ID: ${thoughtId}.`);
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('UNIQUE constraint failed: thought_tags.thought_id, thought_tags.tag_id')) {
          logger.warn(`Tag "${tagData.name}" already associated with thought ID: ${thoughtId}.`);
        } else {
          throw err; // Rethrow other errors
        }
      }
      // Update the thought's updated_at timestamp
      await runQuery(this.db, `UPDATE thoughts SET updated_at = ? WHERE thought_bubble_id = ?`, [new Date().toISOString(), thoughtId]);
      return this.getThoughtById(thoughtId);
    } catch (error) {
      const err = error as Error;
      logger.error(`Error adding tag "${tagData.name}" to thought ${thoughtId}: ${err.message}`);
      throw err;
    }
  }

  async removeTagFromThought(thoughtId: string, tagName: string): Promise<Thought | undefined> {
    try {
      const tagRow = await getQuery<{ tag_id: string }>(this.db, `SELECT tag_id FROM tags WHERE name = ?`, [tagName]);
      if (!tagRow) {
        logger.warn(`Tag "${tagName}" not found. Cannot remove from thought ID: ${thoughtId}.`);
        return this.getThoughtById(thoughtId);
      }

      const deleteSql = `DELETE FROM thought_tags WHERE thought_id = ? AND tag_id = ?`;
      const result = await runQuery(this.db, deleteSql, [thoughtId, tagRow.tag_id]);

      if (result.changes > 0) {
        logger.info(`Tag "${tagName}" removed from thought ID: ${thoughtId}.`);
        // Update the thought's updated_at timestamp
        await runQuery(this.db, `UPDATE thoughts SET updated_at = ? WHERE thought_bubble_id = ?`, [new Date().toISOString(), thoughtId]);
      } else {
        logger.warn(`Tag "${tagName}" was not associated with thought ID: ${thoughtId}.`);
      }
      return this.getThoughtById(thoughtId);
    } catch (error) {
      const err = error as Error;
      logger.error(`Error removing tag "${tagName}" from thought ${thoughtId}: ${err.message}`);
      throw err;
    }
  }

  async getThoughtsByTag(tagName: string): Promise<Thought[]> {
    try {
      const tagRow = await getQuery<{ tag_id: string }>(this.db, `SELECT tag_id FROM tags WHERE name = ?`, [tagName]);
      if (!tagRow) {
        logger.warn(`Tag "${tagName}" not found. Returning no thoughts.`);
        return [];
      }

      const thoughtIdsSql = `SELECT thought_id FROM thought_tags WHERE tag_id = ?`;
      const thoughtIdRows = await allQuery<{ thought_id: string }>(this.db, thoughtIdsSql, [tagRow.tag_id]);

      const thoughts: Thought[] = [];
      for (const row of thoughtIdRows) {
        const thought = await this.getThoughtById(row.thought_id);
        if (thought) {
          thoughts.push(thought);
        }
      }
      logger.info(`Retrieved ${thoughts.length} thoughts for tag "${tagName}".`);
      return thoughts;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error retrieving thoughts by tag "${tagName}": ${err.message}`);
      throw err;
    }
  }

  async addTagToSegment(segmentId: string, tagData: Tag): Promise<Segment | undefined> {
    try {
      const tag_id = await this.findOrCreateTag(tagData);
      if (!tag_id) {
        logger.error(`Failed to find or create tag for name: ${tagData.name}`);
        return this.getSegmentById(segmentId);
      }

      const segmentTagId = `st_${segmentId}_${tag_id}`;
      const insertSegmentTagSql = `INSERT INTO segment_tags (segment_tag_id, segment_id, tag_id) VALUES (?, ?, ?)`;
      try {
        await runQuery(this.db, insertSegmentTagSql, [segmentTagId, segmentId, tag_id]);
        logger.info(`Tag "${tagData.name}" (ID: ${tag_id}) added to segment ID: ${segmentId}.`);
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('UNIQUE constraint failed: segment_tags.segment_id, segment_tags.tag_id')) {
          logger.warn(`Tag "${tagData.name}" already associated with segment ID: ${segmentId}.`);
        } else {
          throw err;
        }
      }
      // Update the segment's updated_at timestamp
      await runQuery(this.db, `UPDATE segments SET updated_at = ? WHERE segment_id = ?`, [new Date().toISOString(), segmentId]);
      return this.getSegmentById(segmentId);
    } catch (error) {
      const err = error as Error;
      logger.error(`Error adding tag "${tagData.name}" to segment ${segmentId}: ${err.message}`);
      throw err;
    }
  }

  async removeTagFromSegment(segmentId: string, tagName: string): Promise<Segment | undefined> {
     try {
      const tagRow = await getQuery<{ tag_id: string }>(this.db, `SELECT tag_id FROM tags WHERE name = ?`, [tagName]);
      if (!tagRow) {
        logger.warn(`Tag "${tagName}" not found. Cannot remove from segment ID: ${segmentId}.`);
        return this.getSegmentById(segmentId);
      }

      const deleteSql = `DELETE FROM segment_tags WHERE segment_id = ? AND tag_id = ?`;
      const result = await runQuery(this.db, deleteSql, [segmentId, tagRow.tag_id]);

      if (result.changes > 0) {
        logger.info(`Tag "${tagName}" removed from segment ID: ${segmentId}.`);
         // Update the segment's updated_at timestamp
        await runQuery(this.db, `UPDATE segments SET updated_at = ? WHERE segment_id = ?`, [new Date().toISOString(), segmentId]);
      } else {
        logger.warn(`Tag "${tagName}" was not associated with segment ID: ${segmentId}.`);
      }
      return this.getSegmentById(segmentId);
    } catch (error) {
      const err = error as Error;
      logger.error(`Error removing tag "${tagName}" from segment ${segmentId}: ${err.message}`);
      throw err;
    }
  }

  async getSegmentsByTag(tagName: string): Promise<Segment[]> {
    try {
      const tagRow = await getQuery<{ tag_id: string }>(this.db, `SELECT tag_id FROM tags WHERE name = ?`, [tagName]);
      if (!tagRow) {
        logger.warn(`Tag "${tagName}" not found. Returning no segments.`);
        return [];
      }

      const segmentIdsSql = `SELECT segment_id FROM segment_tags WHERE tag_id = ?`;
      const segmentIdRows = await allQuery<{ segment_id: string }>(this.db, segmentIdsSql, [tagRow.tag_id]);

      const segments: Segment[] = [];
      for (const row of segmentIdRows) {
        const segment = await this.getSegmentById(row.segment_id);
        if (segment) {
          segments.push(segment);
        }
      }
      logger.info(`Retrieved ${segments.length} segments for tag "${tagName}".`);
      return segments;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error retrieving segments by tag "${tagName}": ${err.message}`);
      throw err;
    }
  }

  // Internal helper to manage segment fields, used by createSegment and updateSegmentFields
  private async updateSegmentFieldsInternal(segmentId: string, fields: Record<string, FieldValue>, timestamp: string): Promise<void> {
    // This transaction ensures that if any part of updating fields fails, all changes are rolled back.
    await runQuery(this.db, 'BEGIN TRANSACTION');
    try {
      const deleteSql = `DELETE FROM segment_fields WHERE segment_id = ?`;
      await runQuery(this.db, deleteSql, [segmentId]);

      const insertSql = `
        INSERT INTO segment_fields (field_id, segment_id, name, value, type, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      for (const [name, value] of Object.entries(fields)) {
        const field_id = `sf_${segmentId}_${name.replace(/[^a-zA-Z0-9_]/g, '_')}_${Date.now()}`; // Ensure unique and valid ID
        let type: string;
        let serializedValue: string;

        if (typeof value === 'string') { type = 'string'; serializedValue = value; }
        else if (typeof value === 'number') { type = 'number'; serializedValue = value.toString(); }
        else if (typeof value === 'boolean') { type = 'boolean'; serializedValue = value.toString(); }
        else if (value instanceof Date) { type = 'Date'; serializedValue = value.toISOString(); }
        else if (Array.isArray(value) && value.every(item => typeof item === 'string')) { type = 'string[]'; serializedValue = JSON.stringify(value); }
        else if (Array.isArray(value) && value.every(item => typeof item === 'number')) { type = 'number[]'; serializedValue = JSON.stringify(value); }
        else { logger.warn(`Unsupported field type for field "${name}" in segment ${segmentId}. Skipping.`); continue; }
        
        await runQuery(this.db, insertSql, [field_id, segmentId, name, serializedValue, type, timestamp, timestamp]);
      }
      await runQuery(this.db, 'COMMIT');
      logger.info(`Fields updated transactionally for segment ID: ${segmentId}`);
    } catch (error) {
      await runQuery(this.db, 'ROLLBACK');
      const err = error as Error;
      logger.error(`Error in transaction for updateSegmentFieldsInternal for segment ID ${segmentId}: ${err.message}`);
      throw err;
    }
  }
  
  async updateSegmentFields(segmentId: string, fields: Record<string, FieldValue>): Promise<Segment | undefined> {
    const now = new Date().toISOString();
    try {
      await this.updateSegmentFieldsInternal(segmentId, fields, now);
      // Also update the segment's own updated_at timestamp
      const updateSegmentSql = `UPDATE segments SET updated_at = ? WHERE segment_id = ?`;
      await runQuery(this.db, updateSegmentSql, [now, segmentId]);
      
      return this.getSegmentById(segmentId);
    } catch (error) {
      const err = error as Error;
      logger.error(`Error in updateSegmentFields for segment ID ${segmentId}: ${err.message}`);
      throw err;
    }
  }

  async getAllTags(): Promise<Tag[]> {
    logger.info('getAllTags called'); // Changed from debug to info
    const sql = `SELECT name, color FROM tags`;
    try {
      // The Tag type in entities.ts only defines name and color.
      const rows = await allQuery<Tag>(this.db, sql);
      logger.info(`Retrieved ${rows.length} tags.`);
      return rows;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error getting all tags: ${err.message}`);
      throw err;
    }
  }
  
  async getTagByName(tagName: string): Promise<Tag | undefined> {
    logger.info(`getTagByName called for ${tagName}`); // Changed from debug to info
    const sql = `SELECT name, color FROM tags WHERE name = ?`;
    try {
      // The Tag type in entities.ts only defines name and color.
      const row = await getQuery<Tag>(this.db, sql, [tagName]);
      if (!row) {
        logger.warn(`Tag with name: "${tagName}" not found.`);
      }
      return row;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error getting tag by name "${tagName}": ${err.message}`);
      throw err;
    }
  }

  async updateTag(tagName: string, newTagData: Partial<Tag>): Promise<Tag | undefined> {
    logger.info(`updateTag called for ${tagName} with data:`, newTagData); // Changed from debug to info
    
    const setClauses: string[] = [];
    const params: any[] = [];

    if (newTagData.name !== undefined) {
      setClauses.push('name = ?');
      params.push(newTagData.name);
    }
    if (newTagData.color !== undefined) {
      setClauses.push('color = ?');
      params.push(newTagData.color);
    }
    
    if (setClauses.length === 0) {
      logger.warn(`No updatable fields provided for tag: ${tagName}.`);
      return this.getTagByName(newTagData.name || tagName);
    }

    setClauses.push('updated_at = ?');
    params.push(new Date().toISOString());
    
    const sql = `UPDATE tags SET ${setClauses.join(', ')} WHERE name = ?`;
    params.push(tagName);

    try {
      const result = await runQuery(this.db, sql, params);
      if (result.changes === 0) {
        logger.warn(`Tag with name: "${tagName}" not found for update.`);
        return undefined;
      }
      logger.info(`Tag "${tagName}" updated successfully.`);
      return this.getTagByName(newTagData.name || tagName); // Fetch by new name if changed
    } catch (error) {
      const err = error as Error;
      // Handle UNIQUE constraint error for tag name if applicable
      if (err.message.includes('UNIQUE constraint failed: tags.name')) {
        logger.error(`Error updating tag "${tagName}": New name "${newTagData.name}" already exists.`);
        throw new Error(`Tag name "${newTagData.name}" already exists.`);
      }
      logger.error(`Error updating tag "${tagName}": ${err.message}`);
      throw err;
    }
  }

  async deleteTag(tagName: string): Promise<boolean> {
    logger.info(`deleteTag called for ${tagName}`); // Changed from debug to info
    // ON DELETE CASCADE on 'thought_tags' and 'segment_tags' will remove associations.
    const sql = `DELETE FROM tags WHERE name = ?`;
    try {
      const result = await runQuery(this.db, sql, [tagName]);
      if (result.changes === 0) {
        logger.warn(`Tag with name: "${tagName}" not found for deletion.`);
        return false;
      }
      logger.info(`Tag with name: "${tagName}" deleted successfully from tags table and all associations.`);
      return true;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error deleting tag "${tagName}": ${err.message}`);
      throw err;
    }
  }
}

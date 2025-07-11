import { Pool, QueryResult } from 'pg'; // Removed Client
import { StorageAdapter, NewThoughtData, NewSegmentData } from '../../../contracts/storageAdapter';
import { Segment, Thought } from '../../../contracts/entities';
import { 
  PostgresThoughtRecord, 
  PostgresSegmentRecord
  // Removed DatabaseQueryResult
} from '../../../contracts/types';

export class PostgresAdapter implements StorageAdapter {
  private pool: Pool;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Use connection pooling for better performance
    const poolUrl = databaseUrl.replace('.us-east-2', '-pooler.us-east-2');
    this.pool = new Pool({
      connectionString: poolUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async initialize(): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Create tables if they don't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS thoughts (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL DEFAULT 'anonymous',
          title TEXT NOT NULL,
          description TEXT,
          fields JSONB DEFAULT '{}',
          metadata JSONB DEFAULT '{}',
          color TEXT,
          position_x REAL,
          position_y REAL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS segments (
          id VARCHAR(36) PRIMARY KEY,
          thought_id VARCHAR(36) REFERENCES thoughts(id) ON DELETE CASCADE,
          user_id VARCHAR(100) NOT NULL DEFAULT 'anonymous',
          content TEXT NOT NULL,
          segment_type VARCHAR(50) DEFAULT 'text',
          fields JSONB DEFAULT '{}',
          metadata JSONB DEFAULT '{}',
          position_x FLOAT DEFAULT 0,
          position_y FLOAT DEFAULT 0,
          abstraction_level TEXT,
          local_priority REAL,
          cluster_id VARCHAR(255),
          sort_order INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS plugin_data (
          id VARCHAR(36) PRIMARY KEY,
          plugin_name VARCHAR(100) NOT NULL,
          user_id VARCHAR(100) NOT NULL DEFAULT 'anonymous',
          data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_segments_thought_id ON segments(thought_id);
        CREATE INDEX IF NOT EXISTS idx_segments_user_id ON segments(user_id);
        CREATE INDEX IF NOT EXISTS idx_thoughts_user_id ON thoughts(user_id);
        CREATE INDEX IF NOT EXISTS idx_thoughts_fields ON thoughts USING GIN(fields);
        CREATE INDEX IF NOT EXISTS idx_plugin_data_name ON plugin_data(plugin_name);
        CREATE INDEX IF NOT EXISTS idx_plugin_data_user ON plugin_data(user_id);
      `);
    } finally {
      client.release();
    }
  }

  async createThought(thoughtData: NewThoughtData, userId = 'anonymous'): Promise<Thought> {
    const client = await this.pool.connect();
    try {
      // TODO: Handle thoughtData.tags in createThought - requires tag table and thought_tags linking table
      const result: QueryResult<PostgresThoughtRecord> = await client.query(
        `INSERT INTO thoughts (id, user_id, title, description, fields, metadata, color, position_x, position_y)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          thoughtData.id || `thought_${Date.now()}`,
          userId,
          thoughtData.title,
          thoughtData.description || null, // Use null for DB
          JSON.stringify(thoughtData.fields || {}),
          JSON.stringify(thoughtData.metadata || {}),
          thoughtData.color || null,
          thoughtData.position?.x || null,
          thoughtData.position?.y || null
        ]
      );
      const dbRow = result.rows[0];
      const thought: Thought = {
        thought_bubble_id: dbRow.id,
        title: dbRow.title,
        created_at: dbRow.created_at,
        updated_at: dbRow.updated_at,
        tags: [],
        segments: []
      };
      if (dbRow.description !== undefined && dbRow.description !== null) thought.description = dbRow.description;
      if (dbRow.fields !== undefined) thought.fields = dbRow.fields as Record<string, unknown>;
      if (dbRow.metadata !== undefined) thought.metadata = dbRow.metadata as Record<string, unknown>;
      if (dbRow.color !== undefined && dbRow.color !== null) thought.color = dbRow.color;
      if (dbRow.position_x !== undefined && dbRow.position_x !== null &&
          dbRow.position_y !== undefined && dbRow.position_y !== null) {
        thought.position = { x: dbRow.position_x, y: dbRow.position_y };
      }
      return thought;
    } finally {
      client.release();
    }
  }

  async getThoughtById(id: string, userId = 'anonymous'): Promise<Thought | null> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<PostgresThoughtRecord> = await client.query(
        'SELECT * FROM thoughts WHERE id = $1 AND user_id = $2', 
        [id, userId]
      );
      if (result.rows.length === 0) return null;

      const dbRow = result.rows[0];
      // Parse JSON fields & map to Thought
      const thought: Thought = {
        thought_bubble_id: dbRow.id,
        title: dbRow.title,
        created_at: dbRow.created_at,
        updated_at: dbRow.updated_at,
        // segments will be populated by a separate call if needed by consumer
        // For now, tags and segments are placeholders as per Thought entity.
        tags: [],
        segments: []
      };
      if (dbRow.description !== undefined && dbRow.description !== null) thought.description = dbRow.description;
      if (dbRow.fields !== undefined) thought.fields = dbRow.fields as Record<string, unknown>;
      if (dbRow.metadata !== undefined) thought.metadata = dbRow.metadata as Record<string, unknown>;
      if (dbRow.color !== undefined && dbRow.color !== null) thought.color = dbRow.color;
      if (dbRow.position_x !== undefined && dbRow.position_x !== null &&
          dbRow.position_y !== undefined && dbRow.position_y !== null) {
        thought.position = { x: dbRow.position_x, y: dbRow.position_y };
      }
      return thought;
    } finally {
      client.release();
    }
  }

  async getAllThoughts(userId = 'anonymous'): Promise<Thought[]> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<PostgresThoughtRecord> = await client.query(
        'SELECT * FROM thoughts WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows.map(dbRow => {
        const thought: Thought = {
          thought_bubble_id: dbRow.id,
          title: dbRow.title,
          created_at: dbRow.created_at,
          updated_at: dbRow.updated_at,
          tags: [],
          segments: []
        };
        if (dbRow.description !== undefined && dbRow.description !== null) thought.description = dbRow.description;
        if (dbRow.fields !== undefined) thought.fields = dbRow.fields as Record<string, unknown>;
        if (dbRow.metadata !== undefined) thought.metadata = dbRow.metadata as Record<string, unknown>;
        if (dbRow.color !== undefined && dbRow.color !== null) thought.color = dbRow.color;
        if (dbRow.position_x !== undefined && dbRow.position_x !== null &&
            dbRow.position_y !== undefined && dbRow.position_y !== null) {
          thought.position = { x: dbRow.position_x, y: dbRow.position_y };
        }
        return thought;
      });
    } finally {
      client.release();
    }
  }

  async updateThought(id: string, thoughtData: Partial<NewThoughtData>, userId = 'anonymous'): Promise<Thought | null> {
    const client = await this.pool.connect();
    try {
      // TODO: Handle updates.tags in updateThought - requires tag table and thought_tags linking table logic (delete old, insert new)
      const updateFields = []; // Changed 'updates' to 'updateFields'
      const values = [];
      let paramCount = 1;

      if (thoughtData.title !== undefined) {
        updateFields.push(`title = $${paramCount++}`);
        values.push(thoughtData.title);
      }
      if (thoughtData.description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        values.push(thoughtData.description);
      }
      if (thoughtData.fields !== undefined) {
        updateFields.push(`fields = $${paramCount++}`);
        values.push(JSON.stringify(thoughtData.fields || {})); // Ensure not undefined
      }
      if (thoughtData.metadata !== undefined) {
        updateFields.push(`metadata = $${paramCount++}`);
        values.push(JSON.stringify(thoughtData.metadata || {})); // Ensure not undefined
      }
      if (thoughtData.color !== undefined) {
        updateFields.push(`color = $${paramCount++}`);
        values.push(thoughtData.color);
      }
      if (thoughtData.position !== undefined) {
        updateFields.push(`position_x = $${paramCount++}`);
        values.push(thoughtData.position.x);
        updateFields.push(`position_y = $${paramCount++}`);
        values.push(thoughtData.position.y);
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id); // For WHERE id =
      values.push(userId); // For WHERE user_id =

      const result: QueryResult<PostgresThoughtRecord> = await client.query(
        `UPDATE thoughts SET ${updateFields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`,
        values
      );

      if (result.rows.length === 0) return null;
      const dbRow = result.rows[0];
      const thought: Thought = {
        thought_bubble_id: dbRow.id,
        title: dbRow.title,
        created_at: dbRow.created_at,
        updated_at: dbRow.updated_at,
        tags: [],
        segments: []
      };
      if (dbRow.description !== undefined && dbRow.description !== null) thought.description = dbRow.description;
      if (dbRow.fields !== undefined) thought.fields = dbRow.fields as Record<string, unknown>;
      if (dbRow.metadata !== undefined) thought.metadata = dbRow.metadata as Record<string, unknown>;
      if (dbRow.color !== undefined && dbRow.color !== null) thought.color = dbRow.color;
      if (dbRow.position_x !== undefined && dbRow.position_x !== null &&
          dbRow.position_y !== undefined && dbRow.position_y !== null) {
        thought.position = { x: dbRow.position_x, y: dbRow.position_y };
      }
      return thought;
    } finally {
      client.release();
    }
  }

  async deleteThought(id: string, userId = 'anonymous'): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('DELETE FROM thoughts WHERE id = $1 AND user_id = $2', [id, userId]);
      return (result.rowCount || 0) > 0;
    } finally {
      client.release();
    }
  }

  async getSegmentsForThought(thoughtId: string, userId = 'anonymous'): Promise<Segment[]> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<PostgresSegmentRecord> = await client.query('SELECT * FROM segments WHERE thought_id = $1 AND user_id = $2 ORDER BY sort_order, created_at', [thoughtId, userId]); // Added explicit sort
      return result.rows.map(dbRow => {
        const segment: Segment = {
          segment_id: dbRow.id,
          thought_bubble_id: dbRow.thought_id,
          content: dbRow.content,
          created_at: dbRow.created_at,
          updated_at: dbRow.updated_at,
        };
        if (dbRow.title !== undefined && dbRow.title !== null) segment.title = dbRow.title;
        if (dbRow.segment_type !== undefined && dbRow.segment_type !== null) segment.content_type = dbRow.segment_type;
        if (dbRow.fields !== undefined) segment.fields = dbRow.fields as Record<string, unknown>;
        if (dbRow.metadata !== undefined) segment.metadata = dbRow.metadata as Record<string, unknown>;
        if (dbRow.abstraction_level !== undefined && dbRow.abstraction_level !== null) segment.abstraction_level = dbRow.abstraction_level;
        if (dbRow.local_priority !== undefined && dbRow.local_priority !== null) segment.local_priority = dbRow.local_priority;
        if (dbRow.cluster_id !== undefined && dbRow.cluster_id !== null) segment.cluster_id = dbRow.cluster_id;
        if (dbRow.sort_order !== undefined && dbRow.sort_order !== null) segment.sort_order = dbRow.sort_order;
        return segment;
      });
    } finally {
      client.release();
    }
  }

  async getSegmentById(segmentId: string, userId = 'anonymous'): Promise<Segment | null> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<PostgresSegmentRecord> = await client.query('SELECT * FROM segments WHERE id = $1 AND user_id = $2', [segmentId, userId]);
      if (result.rows.length === 0) return null;
      const dbRow = result.rows[0]; // Renamed for clarity
      const segment: Segment = {
        segment_id: dbRow.id,
        thought_bubble_id: dbRow.thought_id,
        content: dbRow.content,
        created_at: dbRow.created_at,
        updated_at: dbRow.updated_at,
      };
      if (dbRow.title !== undefined && dbRow.title !== null) segment.title = dbRow.title;
      if (dbRow.segment_type !== undefined && dbRow.segment_type !== null) segment.content_type = dbRow.segment_type;
      if (dbRow.fields !== undefined) segment.fields = dbRow.fields as Record<string, unknown>;
      if (dbRow.metadata !== undefined) segment.metadata = dbRow.metadata as Record<string, unknown>;
      if (dbRow.abstraction_level !== undefined && dbRow.abstraction_level !== null) segment.abstraction_level = dbRow.abstraction_level;
      if (dbRow.local_priority !== undefined && dbRow.local_priority !== null) segment.local_priority = dbRow.local_priority;
      if (dbRow.cluster_id !== undefined && dbRow.cluster_id !== null) segment.cluster_id = dbRow.cluster_id;
      if (dbRow.sort_order !== undefined && dbRow.sort_order !== null) segment.sort_order = dbRow.sort_order;
      return segment;
    } finally {
      client.release();
    }
  }

  async createSegment(thoughtId: string, segmentData: NewSegmentData, userId = 'anonymous'): Promise<Segment> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<PostgresSegmentRecord> = await client.query(
        `INSERT INTO segments (id, thought_id, user_id, title, content, segment_type, fields, metadata, position_x, position_y, abstraction_level, local_priority, cluster_id, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
        [
          segmentData.id || `segment_${Date.now()}`,
          thoughtId,
          userId,
          segmentData.title || null,
          segmentData.content,
          segmentData.segmentType || 'text',
          JSON.stringify(segmentData.fields || {}),
          JSON.stringify(segmentData.metadata || {}), // Use segmentData.metadata
          segmentData.positionX || 0,
          segmentData.positionY || 0,
          segmentData.abstraction_level || null,
          segmentData.local_priority || null,
          segmentData.cluster_id || null,
          0 // Default sort_order, NewSegmentData doesn't have it
        ]
      );

      const dbRow = result.rows[0];
      // Map dbRow to Segment type
      const segment: Segment = {
        segment_id: dbRow.id,
        thought_bubble_id: dbRow.thought_id,
        content: dbRow.content,
        created_at: dbRow.created_at,
        updated_at: dbRow.updated_at,
      };
      if (dbRow.title !== undefined && dbRow.title !== null) segment.title = dbRow.title;
      if (dbRow.segment_type !== undefined && dbRow.segment_type !== null) segment.content_type = dbRow.segment_type;
      if (dbRow.fields !== undefined) segment.fields = dbRow.fields as Record<string, unknown>;
      if (dbRow.metadata !== undefined) segment.metadata = dbRow.metadata as Record<string, unknown>;
      if (dbRow.abstraction_level !== undefined && dbRow.abstraction_level !== null) segment.abstraction_level = dbRow.abstraction_level;
      if (dbRow.local_priority !== undefined && dbRow.local_priority !== null) segment.local_priority = dbRow.local_priority;
      if (dbRow.cluster_id !== undefined && dbRow.cluster_id !== null) segment.cluster_id = dbRow.cluster_id;
      if (dbRow.sort_order !== undefined && dbRow.sort_order !== null) segment.sort_order = dbRow.sort_order;
      return segment;
    } finally {
      client.release();
    }
  }

  async getSegmentsByThoughtId(thoughtId: string, _userId = 'anonymous'): Promise<PostgresSegmentRecord[]> { // userId -> _userId
    const client = await this.pool.connect();
    try {
      const result: QueryResult<PostgresSegmentRecord> = await client.query(
        'SELECT * FROM segments WHERE thought_id = $1 AND user_id = $2 ORDER BY created_at',
        [thoughtId, _userId] // Changed userId to _userId
      );
      return result.rows.map(segment => ({
        ...segment,
        fields: segment.fields || {},
        metadata: segment.metadata || {}
      }));
    } finally {
      client.release();
    }
  }

  async updateSegment(thoughtId: string, segmentId: string, updates: Partial<NewSegmentData>, userId = 'anonymous'): Promise<Segment | null> { // Align with interface
    const client = await this.pool.connect();
    try {
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      if (updates.title !== undefined) { // Add title update
        updateFields.push(`title = $${paramCount++}`);
        values.push(updates.title);
      }
      if (updates.content !== undefined) {
        updateFields.push(`content = $${paramCount++}`);
        values.push(updates.content);
      }
      // segmentType is already segment_type in NewSegmentData and table
      if (updates.segmentType !== undefined) {
        updateFields.push(`segment_type = $${paramCount++}`);
        values.push(updates.segmentType);
      }
      if (updates.fields !== undefined) {
        updateFields.push(`fields = $${paramCount++}`);
        values.push(JSON.stringify(updates.fields));
      }
      if (updates.metadata !== undefined) { // Added metadata update
        updateFields.push(`metadata = $${paramCount++}`);
        values.push(JSON.stringify(updates.metadata));
      }
      if (updates.positionX !== undefined) {
        updateFields.push(`position_x = $${paramCount++}`);
        values.push(updates.positionX);
      }
      if (updates.positionY !== undefined) {
        updateFields.push(`position_y = $${paramCount++}`);
        values.push(updates.positionY);
      }
      if (updates.abstraction_level !== undefined) {
        updateFields.push(`abstraction_level = $${paramCount++}`);
        values.push(updates.abstraction_level);
      }
      if (updates.local_priority !== undefined) {
        updateFields.push(`local_priority = $${paramCount++}`);
        values.push(updates.local_priority);
      }
      if (updates.cluster_id !== undefined) {
        updateFields.push(`cluster_id = $${paramCount++}`);
        values.push(updates.cluster_id);
      }
       // TODO: Consider if sort_order needs to be updatable here. NewSegmentData does not currently include it.
      // if (updates.sort_order !== undefined) {
      //   updateFields.push(`sort_order = $${paramCount++}`);
      //   values.push(updates.sort_order);
      // }

      if (updateFields.length === 0) {
        // Optionally, still update timestamp or just return current segment data
        // For now, let's assume if no fields are provided, no update runs
        const currentSegment = await this.getSegmentById(segmentId, userId);
        return currentSegment;
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(segmentId); // For WHERE id =
      values.push(userId); // For WHERE user_id =

      const query = `
        UPDATE segments 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
        RETURNING *
      `;

      const result: QueryResult<PostgresSegmentRecord> = await client.query(query, values);
      if (result.rows.length === 0) return null;

      const dbRow = result.rows[0];
      const segment: Segment = {
        segment_id: dbRow.id,
        thought_bubble_id: dbRow.thought_id,
        content: dbRow.content,
        created_at: dbRow.created_at,
        updated_at: dbRow.updated_at,
      };
      if (dbRow.title !== undefined && dbRow.title !== null) segment.title = dbRow.title;
      if (dbRow.segment_type !== undefined && dbRow.segment_type !== null) segment.content_type = dbRow.segment_type;
      if (dbRow.fields !== undefined) segment.fields = dbRow.fields as Record<string, unknown>;
      if (dbRow.metadata !== undefined) segment.metadata = dbRow.metadata as Record<string, unknown>;
      if (dbRow.abstraction_level !== undefined && dbRow.abstraction_level !== null) segment.abstraction_level = dbRow.abstraction_level;
      if (dbRow.local_priority !== undefined && dbRow.local_priority !== null) segment.local_priority = dbRow.local_priority;
      if (dbRow.cluster_id !== undefined && dbRow.cluster_id !== null) segment.cluster_id = dbRow.cluster_id;
      if (dbRow.sort_order !== undefined && dbRow.sort_order !== null) segment.sort_order = dbRow.sort_order;
      return segment;
    } finally {
      client.release();
    }
  }

  async deleteSegment(_thoughtId: string, segmentId: string, userId = 'anonymous'): Promise<boolean> { // Prefixed unused thoughtId
    const client = await this.pool.connect();
    try {
      // _thoughtId is not used in this query as segmentId should be unique in combination with userId
      const result = await client.query('DELETE FROM segments WHERE id = $1 AND user_id = $2', [segmentId, userId]);
      return (result.rowCount || 0) > 0;
    } finally {
      client.release();
    }
  }

  // Plugin-specific methods for dev assistant
  async savePluginData(pluginName: string, data: Record<string, unknown>): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO plugin_data (id, plugin_name, data) 
         VALUES (gen_random_uuid(), $1, $2)
         ON CONFLICT (plugin_name) DO UPDATE SET 
         data = $2, updated_at = CURRENT_TIMESTAMP`,
        [pluginName, JSON.stringify(data)]
      );
    } finally {
      client.release();
    }
  }

  async getPluginData(pluginName: string): Promise<Record<string, unknown> | null> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<{ data: Record<string, unknown> }> = await client.query(
        'SELECT data FROM plugin_data WHERE plugin_name = $1 ORDER BY updated_at DESC LIMIT 1',
        [pluginName]
      );
      return result.rows.length > 0 ? result.rows[0].data : null;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
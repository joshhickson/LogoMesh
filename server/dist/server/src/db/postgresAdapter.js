"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresAdapter = void 0;
const pg_1 = require("pg");
class PostgresAdapter {
    constructor() {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is required');
        }
        // Use connection pooling for better performance
        const poolUrl = databaseUrl.replace('.us-east-2', '-pooler.us-east-2');
        this.pool = new pg_1.Pool({
            connectionString: poolUrl,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }
    async initialize() {
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
        }
        finally {
            client.release();
        }
    }
    async createThought(thoughtData, userId = 'anonymous') {
        const client = await this.pool.connect();
        try {
            const result = await client.query(`INSERT INTO thoughts (id, user_id, title, description, fields, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [
                thoughtData.id,
                userId,
                thoughtData.title,
                thoughtData.description || '',
                JSON.stringify(thoughtData.fields || {}),
                JSON.stringify(thoughtData.metadata || {})
            ]);
            const dbRow = result.rows[0];
            const thought = {
                thought_bubble_id: dbRow.id,
                title: dbRow.title,
                description: dbRow.description,
                created_at: dbRow.created_at.toISOString(),
                updated_at: dbRow.updated_at.toISOString(),
                fields: dbRow.fields || {},
                metadata: dbRow.metadata || {}, // Added metadata
                // color, position, tags, segments would need to be handled if they exist in thoughts table or are joined
            };
            return thought;
        }
        finally {
            client.release();
        }
    }
    async getThoughtById(id, userId = 'anonymous') {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT * FROM thoughts WHERE id = $1 AND user_id = $2', [id, userId]);
            if (result.rows.length === 0)
                return null;
            const dbRow = result.rows[0];
            // Parse JSON fields & map to Thought
            const thought = {
                thought_bubble_id: dbRow.id,
                title: dbRow.title,
                description: dbRow.description,
                created_at: dbRow.created_at.toISOString(),
                updated_at: dbRow.updated_at.toISOString(),
                fields: dbRow.fields || {},
                metadata: dbRow.metadata || {}, // Added metadata
                // color, position, tags, segments would need to be handled
            };
            return thought;
        }
        finally {
            client.release();
        }
    }
    async getAllThoughts(userId = 'anonymous') {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT * FROM thoughts WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
            return result.rows.map(dbRow => {
                const thought = {
                    thought_bubble_id: dbRow.id,
                    title: dbRow.title,
                    description: dbRow.description,
                    created_at: dbRow.created_at.toISOString(),
                    updated_at: dbRow.updated_at.toISOString(),
                    fields: dbRow.fields || {},
                    metadata: dbRow.metadata || {}, // Added metadata
                    // color, position, tags, segments would need to be handled
                };
                return thought;
            });
        }
        finally {
            client.release();
        }
    }
    async updateThought(id, thoughtData, userId = 'anonymous') {
        const client = await this.pool.connect();
        try {
            const updates = [];
            const values = [];
            let paramCount = 1;
            if (thoughtData.title !== undefined) {
                updates.push(`title = $${paramCount++}`);
                values.push(thoughtData.title);
            }
            if (thoughtData.description !== undefined) {
                updates.push(`description = $${paramCount++}`);
                values.push(thoughtData.description);
            }
            if (thoughtData.fields !== undefined) {
                updates.push(`fields = $${paramCount++}`);
                values.push(JSON.stringify(thoughtData.fields));
            }
            if (thoughtData.metadata !== undefined) {
                updates.push(`metadata = $${paramCount++}`);
                values.push(JSON.stringify(thoughtData.metadata));
            }
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id); // For WHERE id =
            values.push(userId); // For WHERE user_id =
            const result = await client.query(`UPDATE thoughts SET ${updates.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`, values);
            if (result.rows.length === 0)
                return null;
            const dbRow = result.rows[0];
            const thought = {
                thought_bubble_id: dbRow.id,
                title: dbRow.title,
                description: dbRow.description,
                created_at: dbRow.created_at.toISOString(),
                updated_at: dbRow.updated_at.toISOString(),
                fields: dbRow.fields || {},
                metadata: dbRow.metadata || {}, // Added metadata
                // color, position, tags, segments would need to be handled
            };
            return thought;
        }
        finally {
            client.release();
        }
    }
    async deleteThought(id, userId = 'anonymous') {
        const client = await this.pool.connect();
        try {
            const result = await client.query('DELETE FROM thoughts WHERE id = $1 AND user_id = $2', [id, userId]);
            return (result.rowCount || 0) > 0;
        }
        finally {
            client.release();
        }
    }
    async getSegmentsForThought(thoughtId, userId = 'anonymous') {
        const client = await this.pool.connect();
        try {
            // Assuming segments are user-specific indirectly through thought_id,
            // but if segments table has user_id, it should be used.
            // For now, let's assume thoughts are user-specific, so segments of that thought are also.
            // If segments have their own user_id column that needs checking, this query would change.
            // The current schema shows segments have user_id, so we should use it.
            const result = await client.query('SELECT * FROM segments WHERE thought_id = $1 AND user_id = $2', [thoughtId, userId]);
            return result.rows.map(segment => ({
                ...segment,
                fields: segment.fields || {},
                metadata: segment.metadata || {}
                // Ensure all Segment interface fields are mapped
            }));
        }
        finally {
            client.release();
        }
    }
    async getSegmentById(segmentId, userId = 'anonymous') {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT * FROM segments WHERE id = $1 AND user_id = $2', [segmentId, userId]);
            if (result.rows.length === 0)
                return null;
            const segment = result.rows[0];
            return {
                ...segment,
                fields: segment.fields || {},
                metadata: segment.metadata || {}
                // Ensure all Segment interface fields are mapped
            };
        }
        finally {
            client.release();
        }
    }
    async createSegment(thoughtId, segmentData, userId = 'anonymous') {
        const client = await this.pool.connect();
        try {
            const result = await client.query(`INSERT INTO segments (id, thought_id, user_id, content, segment_type, fields, metadata, position_x, position_y, title)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`, // Added user_id and title
            [
                segmentData.id,
                thoughtId,
                userId,
                segmentData.content,
                segmentData.segmentType || 'text',
                JSON.stringify(segmentData.fields || {}),
                JSON.stringify(segmentData.metadata || {}),
                segmentData.positionX || 0,
                segmentData.positionY || 0,
                segmentData.title || null // Add title
            ]);
            const dbRow = result.rows[0];
            // Map dbRow to Segment type
            const segment = {
                segment_id: dbRow.id,
                thought_bubble_id: dbRow.thought_id,
                // user_id: dbRow.user_id, // Not in Segment interface explicitly, but good for internal use
                title: dbRow.title,
                content: dbRow.content,
                content_type: dbRow.segment_type,
                fields: dbRow.fields || {},
                metadata: dbRow.metadata || {},
                // position_x: dbRow.position_x, // Not in Segment interface
                // position_y: dbRow.position_y, // Not in Segment interface
                created_at: dbRow.created_at.toISOString(),
                updated_at: dbRow.updated_at.toISOString(),
                // Ensure all Segment interface fields are mapped
                // abstraction_level, local_priority, cluster_id, sort_order might be missing from DB or need defaults
            };
            return segment;
        }
        finally {
            client.release();
        }
    }
    async getSegmentsByThoughtId(thoughtId, userId = 'anonymous') {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT * FROM segments WHERE thought_id = $1 ORDER BY created_at', [thoughtId]);
            return result.rows.map(segment => ({
                ...segment,
                fields: segment.fields || {},
                metadata: segment.metadata || {}
            }));
        }
        finally {
            client.release();
        }
    }
    async updateSegment(thoughtId, segmentId, updates, userId = 'anonymous') {
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
            if (updates.segmentType !== undefined) {
                updateFields.push(`segment_type = $${paramCount++}`);
                values.push(updates.segmentType);
            }
            if (updates.fields !== undefined) {
                updateFields.push(`fields = $${paramCount++}`);
                values.push(JSON.stringify(updates.fields));
            }
            if (updates.positionX !== undefined) {
                updateFields.push(`position_x = $${paramCount++}`);
                values.push(updates.positionX);
            }
            if (updates.positionY !== undefined) {
                updateFields.push(`position_y = $${paramCount++}`);
                values.push(updates.positionY);
            }
            if (updateFields.length === 0) { // No actual fields to update other than timestamp
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
            const result = await client.query(query, values);
            if (result.rows.length === 0)
                return null;
            const dbRow = result.rows[0];
            const segment = {
                segment_id: dbRow.id,
                thought_bubble_id: dbRow.thought_id,
                title: dbRow.title,
                content: dbRow.content,
                content_type: dbRow.segment_type,
                fields: dbRow.fields || {},
                metadata: dbRow.metadata || {},
                created_at: dbRow.created_at.toISOString(),
                updated_at: dbRow.updated_at.toISOString(),
            };
            return segment;
        }
        finally {
            client.release();
        }
    }
    async deleteSegment(thoughtId, segmentId, userId = 'anonymous') {
        const client = await this.pool.connect();
        try {
            // thoughtId is not used in this query as segmentId should be unique in combination with userId
            const result = await client.query('DELETE FROM segments WHERE id = $1 AND user_id = $2', [segmentId, userId]);
            return (result.rowCount || 0) > 0;
        }
        finally {
            client.release();
        }
    }
    // Plugin-specific methods for dev assistant
    async savePluginData(pluginName, data) {
        const client = await this.pool.connect();
        try {
            await client.query(`INSERT INTO plugin_data (id, plugin_name, data) 
         VALUES (gen_random_uuid(), $1, $2)
         ON CONFLICT (plugin_name) DO UPDATE SET 
         data = $2, updated_at = CURRENT_TIMESTAMP`, [pluginName, JSON.stringify(data)]);
        }
        finally {
            client.release();
        }
    }
    async getPluginData(pluginName) {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT data FROM plugin_data WHERE plugin_name = $1 ORDER BY updated_at DESC LIMIT 1', [pluginName]);
            return result.rows.length > 0 ? result.rows[0].data : null;
        }
        finally {
            client.release();
        }
    }
    async close() {
        await this.pool.end();
    }
}
exports.PostgresAdapter = PostgresAdapter;
//# sourceMappingURL=postgresAdapter.js.map
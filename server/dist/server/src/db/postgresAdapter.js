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
            return result.rows[0];
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
            const thought = result.rows[0];
            // Parse JSON fields
            thought.fields = thought.fields || {};
            thought.metadata = thought.metadata || {};
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
            return result.rows.map(thought => ({
                ...thought,
                fields: thought.fields || {},
                metadata: thought.metadata || {}
            }));
        }
        finally {
            client.release();
        }
    }
    async updateThought(id, thoughtData) {
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
            values.push(id);
            const result = await client.query(`UPDATE thoughts SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`, values);
            if (result.rows.length === 0)
                return null;
            const thought = result.rows[0];
            thought.fields = thought.fields || {};
            thought.metadata = thought.metadata || {};
            return thought;
        }
        finally {
            client.release();
        }
    }
    async deleteThought(id) {
        const client = await this.pool.connect();
        try {
            await client.query('DELETE FROM thoughts WHERE id = $1', [id]);
        }
        finally {
            client.release();
        }
    }
    async createSegment(thoughtId, segmentData) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(`INSERT INTO segments (id, thought_id, content, segment_type, fields, metadata, position_x, position_y) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [
                segmentData.id,
                thoughtId,
                segmentData.content,
                segmentData.segmentType || 'text',
                JSON.stringify(segmentData.fields || {}),
                JSON.stringify(segmentData.metadata || {}),
                segmentData.positionX || 0,
                segmentData.positionY || 0
            ]);
            const segment = result.rows[0];
            segment.fields = segment.fields || {};
            segment.metadata = segment.metadata || {};
            return segment;
        }
        finally {
            client.release();
        }
    }
    async getSegmentsByThoughtId(thoughtId) {
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
    async updateSegment(thoughtId, segmentId, segmentData) {
        const client = await this.pool.connect();
        try {
            const updates = [];
            const values = [];
            let paramCount = 1;
            if (segmentData.content !== undefined) {
                updates.push(`content = $${paramCount++}`);
                values.push(segmentData.content);
            }
            if (segmentData.segmentType !== undefined) {
                updates.push(`segment_type = $${paramCount++}`);
                values.push(segmentData.segmentType);
            }
            if (segmentData.fields !== undefined) {
                updates.push(`fields = $${paramCount++}`);
                values.push(JSON.stringify(segmentData.fields));
            }
            if (segmentData.positionX !== undefined) {
                updates.push(`position_x = $${paramCount++}`);
                values.push(segmentData.positionX);
            }
            if (segmentData.positionY !== undefined) {
                updates.push(`position_y = $${paramCount++}`);
                values.push(segmentData.positionY);
            }
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(segmentId);
            values.push(thoughtId);
            const result = await client.query(`UPDATE segments SET ${updates.join(', ')} WHERE id = $${paramCount} AND thought_id = $${paramCount + 1} RETURNING *`, values);
            if (result.rows.length === 0)
                return null;
            const segment = result.rows[0];
            segment.fields = segment.fields || {};
            segment.metadata = segment.metadata || {};
            return segment;
        }
        finally {
            client.release();
        }
    }
    async deleteSegment(thoughtId, segmentId) {
        const client = await this.pool.connect();
        try {
            await client.query('DELETE FROM segments WHERE id = $1 AND thought_id = $2', [segmentId, thoughtId]);
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
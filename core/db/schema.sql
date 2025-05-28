
-- LogoMesh Phase 1 SQLite Schema
-- Normalized schema for thoughts, segments, tags, and relationships

-- Main thoughts table
CREATE TABLE IF NOT EXISTS thoughts (
    thought_bubble_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    position_x REAL DEFAULT 0,
    position_y REAL DEFAULT 0,
    color TEXT DEFAULT '#3B82F6',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Segments table (content within thoughts)
CREATE TABLE IF NOT EXISTS segments (
    segment_id TEXT PRIMARY KEY,
    thought_bubble_id TEXT NOT NULL,
    content TEXT NOT NULL,
    segment_type TEXT DEFAULT 'text',
    position_in_thought INTEGER DEFAULT 0,
    embedding_vector BLOB, -- For future VTC use, ephemeral storage
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thought_bubble_id) REFERENCES thoughts(thought_bubble_id) ON DELETE CASCADE
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    tag_id TEXT PRIMARY KEY,
    tag_name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6B7280',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Thought-tag relationships
CREATE TABLE IF NOT EXISTS thought_tags (
    thought_bubble_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (thought_bubble_id, tag_id),
    FOREIGN KEY (thought_bubble_id) REFERENCES thoughts(thought_bubble_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

-- Segment-tag relationships
CREATE TABLE IF NOT EXISTS segment_tags (
    segment_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (segment_id, tag_id),
    FOREIGN KEY (segment_id) REFERENCES segments(segment_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

-- Segment custom fields (key-value pairs)
CREATE TABLE IF NOT EXISTS segment_fields (
    segment_id TEXT NOT NULL,
    field_key TEXT NOT NULL,
    field_value TEXT,
    PRIMARY KEY (segment_id, field_key),
    FOREIGN KEY (segment_id) REFERENCES segments(segment_id) ON DELETE CASCADE
);

-- Segment relationships/neighbors
CREATE TABLE IF NOT EXISTS segment_neighbors (
    source_segment_id TEXT NOT NULL,
    target_segment_id TEXT NOT NULL,
    relationship_type TEXT DEFAULT 'related',
    weight REAL DEFAULT 1.0,
    PRIMARY KEY (source_segment_id, target_segment_id),
    FOREIGN KEY (source_segment_id) REFERENCES segments(segment_id) ON DELETE CASCADE,
    FOREIGN KEY (target_segment_id) REFERENCES segments(segment_id) ON DELETE CASCADE
);

-- Segment related context (for CCE future use)
CREATE TABLE IF NOT EXISTS segment_related_context (
    segment_id TEXT NOT NULL,
    context_type TEXT NOT NULL,
    context_data TEXT,
    relevance_score REAL DEFAULT 0.5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (segment_id, context_type),
    FOREIGN KEY (segment_id) REFERENCES segments(segment_id) ON DELETE CASCADE
);

-- LLM interaction history for segments
CREATE TABLE IF NOT EXISTS segment_llm_history (
    history_id TEXT PRIMARY KEY,
    segment_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT,
    llm_executor TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT, -- JSON for additional context
    FOREIGN KEY (segment_id) REFERENCES segments(segment_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_segments_thought_id ON segments(thought_bubble_id);
CREATE INDEX IF NOT EXISTS idx_thought_tags_thought_id ON thought_tags(thought_bubble_id);
CREATE INDEX IF NOT EXISTS idx_segment_tags_segment_id ON segment_tags(segment_id);
CREATE INDEX IF NOT EXISTS idx_segment_fields_segment_id ON segment_fields(segment_id);
CREATE INDEX IF NOT EXISTS idx_segment_neighbors_source ON segment_neighbors(source_segment_id);
CREATE INDEX IF NOT EXISTS idx_segment_neighbors_target ON segment_neighbors(target_segment_id);
CREATE INDEX IF NOT EXISTS idx_llm_history_segment_id ON segment_llm_history(segment_id);

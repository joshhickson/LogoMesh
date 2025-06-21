
-- LogoMesh SQLite Database Schema
-- Phase 1: Core tables for thoughts, segments, tags, and relationships

-- Main thoughts table
CREATE TABLE IF NOT EXISTS thoughts (
    thought_bubble_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    position_x REAL DEFAULT 0,
    position_y REAL DEFAULT 0,
    metadata TEXT -- JSON blob for additional data
);

-- Segments within thoughts
CREATE TABLE IF NOT EXISTS segments (
    segment_id TEXT PRIMARY KEY,
    thought_bubble_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    metadata TEXT, -- JSON blob for additional data
    FOREIGN KEY (thought_bubble_id) REFERENCES thoughts(thought_bubble_id) ON DELETE CASCADE
);

-- Tags for categorization
CREATE TABLE IF NOT EXISTS tags (
    tag_id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6b7280',
    created_at TEXT NOT NULL
);

-- Many-to-many relationship between thoughts and tags
CREATE TABLE IF NOT EXISTS thought_tags (
    thought_bubble_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (thought_bubble_id, tag_id),
    FOREIGN KEY (thought_bubble_id) REFERENCES thoughts(thought_bubble_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

-- Many-to-many relationship between segments and tags
CREATE TABLE IF NOT EXISTS segment_tags (
    segment_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (segment_id, tag_id),
    FOREIGN KEY (segment_id) REFERENCES segments(segment_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

-- Custom fields for segments (flexible schema)
CREATE TABLE IF NOT EXISTS segment_fields (
    field_id TEXT PRIMARY KEY,
    segment_id TEXT NOT NULL,
    field_name TEXT NOT NULL,
    field_value TEXT,
    field_type TEXT DEFAULT 'text', -- text, number, date, boolean, etc.
    created_at TEXT NOT NULL,
    FOREIGN KEY (segment_id) REFERENCES segments(segment_id) ON DELETE CASCADE
);

-- Segment relationships/neighbors for graph connections
CREATE TABLE IF NOT EXISTS segment_neighbors (
    source_segment_id TEXT NOT NULL,
    target_segment_id TEXT NOT NULL,
    relationship_type TEXT DEFAULT 'related', -- related, contradicts, supports, etc.
    strength REAL DEFAULT 1.0, -- 0.0 to 1.0
    created_at TEXT NOT NULL,
    metadata TEXT, -- JSON blob for additional relationship data
    PRIMARY KEY (source_segment_id, target_segment_id, relationship_type),
    FOREIGN KEY (source_segment_id) REFERENCES segments(segment_id) ON DELETE CASCADE,
    FOREIGN KEY (target_segment_id) REFERENCES segments(segment_id) ON DELETE CASCADE
);

-- Related context for segments (for future AI/LLM features)
CREATE TABLE IF NOT EXISTS segment_related_context (
    context_id TEXT PRIMARY KEY,
    segment_id TEXT NOT NULL,
    context_type TEXT NOT NULL, -- embedding, summary, analysis, etc.
    context_data TEXT, -- JSON blob or text data
    source TEXT, -- AI model, manual, import, etc.
    created_at TEXT NOT NULL,
    expires_at TEXT, -- For ephemeral data like embeddings
    FOREIGN KEY (segment_id) REFERENCES segments(segment_id) ON DELETE CASCADE
);

-- LLM interaction history for segments
CREATE TABLE IF NOT EXISTS segment_llm_history (
    history_id TEXT PRIMARY KEY,
    segment_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT,
    llm_model TEXT NOT NULL,
    interaction_type TEXT DEFAULT 'prompt', -- prompt, analysis, generation, etc.
    metadata TEXT, -- JSON blob for additional interaction data
    created_at TEXT NOT NULL,
    FOREIGN KEY (segment_id) REFERENCES segments(segment_id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_thoughts_created_at ON thoughts(created_at);
CREATE INDEX IF NOT EXISTS idx_segments_thought_id ON segments(thought_bubble_id);
CREATE INDEX IF NOT EXISTS idx_segments_created_at ON segments(created_at);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_segment_fields_segment_id ON segment_fields(segment_id);
CREATE INDEX IF NOT EXISTS idx_segment_fields_name ON segment_fields(field_name);
CREATE INDEX IF NOT EXISTS idx_segment_neighbors_source ON segment_neighbors(source_segment_id);
CREATE INDEX IF NOT EXISTS idx_segment_neighbors_target ON segment_neighbors(target_segment_id);
CREATE INDEX IF NOT EXISTS idx_segment_context_segment_id ON segment_related_context(segment_id);
CREATE INDEX IF NOT EXISTS idx_segment_context_type ON segment_related_context(context_type);
CREATE INDEX IF NOT EXISTS idx_segment_llm_segment_id ON segment_llm_history(segment_id);

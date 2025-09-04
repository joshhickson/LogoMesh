-- =============================================================================
-- SCHEMA FOR THE BIBLICAL INGESTION ENGINE
-- =============================================================================
-- This schema is designed to store the rich, multi-layered data from the
-- EnrichedVerse data model in a normalized and efficient way.

-- Enable the vector extension if it's not already enabled.
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. The central table for the canonical, version-agnostic verse.
CREATE TABLE IF NOT EXISTS canonical_verses (
    canonical_id UUID PRIMARY KEY,
    osis_ref VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_osis_ref ON canonical_verses(osis_ref);

-- 2. Stores the text for each verse in multiple Bible versions.
CREATE TABLE IF NOT EXISTS verse_texts (
    verse_text_id SERIAL PRIMARY KEY,
    canonical_id UUID NOT NULL REFERENCES canonical_verses(canonical_id) ON DELETE CASCADE,
    version_abbreviation VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    UNIQUE(canonical_id, version_abbreviation)
);
CREATE INDEX IF NOT EXISTS idx_verse_texts_canonical_id ON verse_texts(canonical_id);

-- 3. Stores the detailed lexical information for each word in the original language text.
CREATE TABLE IF NOT EXISTS original_language_words (
    word_id SERIAL PRIMARY KEY,
    canonical_id UUID NOT NULL REFERENCES canonical_verses(canonical_id) ON DELETE CASCADE,
    word_position SMALLINT NOT NULL, -- The 1-based position of the word in the verse
    text VARCHAR(100) NOT NULL,
    transliteration VARCHAR(100),
    lemma VARCHAR(100),
    strongs_number VARCHAR(10),
    morphology VARCHAR(20),
    contextual_vector VECTOR(768), -- Assuming a 768-dimension embedding vector
    UNIQUE(canonical_id, word_position)
);
CREATE INDEX IF NOT EXISTS idx_words_canonical_id ON original_language_words(canonical_id);
-- Optional: Add an IVFFlat index for faster similarity search on vectors, once we have data.
-- CREATE INDEX ON original_language_words USING ivfflat (contextual_vector vector_l2_ops) WITH (lists = 100);


-- 4. Stores the mapping from our canonical ID to various versification schemes.
CREATE TABLE IF NOT EXISTS versification_maps (
    map_id SERIAL PRIMARY KEY,
    canonical_id UUID NOT NULL REFERENCES canonical_verses(canonical_id) ON DELETE CASCADE,
    scheme VARCHAR(50) NOT NULL, -- e.g., 'eng_kjv', 'lxx', 'vulgate'
    reference VARCHAR(255) NOT NULL,
    UNIQUE(canonical_id, scheme)
);
CREATE INDEX IF NOT EXISTS idx_maps_canonical_id ON versification_maps(canonical_id);

-- Note: The Knowledge Graph entities (people, places, concepts) will be stored
-- in a separate Neo4j graph database, not in PostgreSQL. The link between them
-- will be managed at the application layer.

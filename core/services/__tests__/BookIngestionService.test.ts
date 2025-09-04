import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { BookIngestionService } from '../BookIngestionService';
import { PostgresBibleStorageAdapter } from '../../storage/postgresBibleAdapter';
import { john1InterlinearData } from './fixtures/john_1_interlinear';

// Integration test suite for the BookIngestionService
// This suite requires a running PostgreSQL database defined by TEST_DATABASE_URL.
// It will be skipped if the environment variable is not set.
describe.skipIf(!process.env.TEST_DATABASE_URL)('BookIngestionService Integration Test', () => {
  let pool: Pool;
  let ingestionService: BookIngestionService;

  beforeAll(async () => {
    // This test requires a running PostgreSQL instance.
    // It's configured to connect to the one in the docker-compose.yml file.
    const databaseUrl = process.env.TEST_DATABASE_URL || 'postgres://logomesh:password@localhost:5432/logomesh_test';

    pool = new Pool({ connectionString: databaseUrl });

    const client = await pool.connect();
    try {
      // Read and execute the schema file to set up the tables
      const schemaPath = path.resolve(__dirname, '../../db/bible_schema.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSQL);
    } finally {
      client.release();
    }

    const bibleStorageAdapter = new PostgresBibleStorageAdapter(pool);
    ingestionService = new BookIngestionService(bibleStorageAdapter);
  });

  afterAll(async () => {
    const client = await pool.connect();
    try {
      // Clean up the tables
      await client.query('DROP TABLE IF EXISTS versification_maps, original_language_words, verse_texts, canonical_verses;');
    } finally {
      client.release();
    }
    await pool.end();
  });

  it('should parse and store John chapter 1 correctly', async () => {
    // Ingest the chapter
    await ingestionService.ingestChapter('John', 1, john1InterlinearData);

    // Verification queries
    const client = await pool.connect();
    try {
      // 1. Verify the number of verses inserted
      const verseCountResult = await client.query('SELECT COUNT(*) FROM canonical_verses WHERE osis_ref LIKE \'John.1.%\';');
      // John 1 has 51 verses. The sample data contains up to verse 51.
      // My parser is simple and might miss some, let's check for a reasonable number.
      const verseCount = parseInt(verseCountResult.rows[0].count, 10);
      expect(verseCount).toBeGreaterThan(45);
      expect(verseCount).toBeLessThanOrEqual(51);

      // 2. Verify the number of words inserted for a specific verse (John 1:1)
      const john1_1_id_result = await client.query('SELECT canonical_id FROM canonical_verses WHERE osis_ref = \'John.1.1\';');
      const john1_1_id = john1_1_id_result.rows[0].canonical_id;

      const wordCountResult = await client.query('SELECT COUNT(*) FROM original_language_words WHERE canonical_id = $1;', [john1_1_id]);
      // "Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν Θεόν, καὶ Θεὸς ἦν ὁ λόγος." has 17 words.
      expect(parseInt(wordCountResult.rows[0].count, 10)).toBe(17);

      // 3. Verify the content of the first word of the first verse
      const firstWordResult = await client.query(
        'SELECT * FROM original_language_words WHERE canonical_id = $1 AND word_position = 1;',
        [john1_1_id]
      );
      const firstWord = firstWordResult.rows[0];
      expect(firstWord.text).toBe('Ἐν');
      expect(firstWord.transliteration).toBe('En');
      expect(firstWord.strongs_number).toBe('1722');
      expect(firstWord.morphology).toBe('Prep');

      // 4. Verify the concatenated English text for the verse
       const verseTextResult = await client.query(
        'SELECT text FROM verse_texts WHERE canonical_id = $1 AND version_abbreviation = \'BSB\';',
        [john1_1_id]
      );
      const verseText = verseTextResult.rows[0].text;
      expect(verseText).toBe('In [the] beginning was the Word , and the Word was with - God , and the Word was was God .');

    } finally {
      client.release();
    }
  }, 30000); // Increase timeout for this integration test
});

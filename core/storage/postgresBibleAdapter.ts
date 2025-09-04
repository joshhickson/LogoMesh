import { Pool } from 'pg';
import { BibleStorageAdapter } from '../../contracts/bibleStorageAdapter';
import { EnrichedVerse } from '../../contracts/entities';
import { logger } from '../utils/logger';

export class PostgresBibleStorageAdapter implements BibleStorageAdapter {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async saveEnrichedVerse(verse: EnrichedVerse): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert into canonical_verses
      const verseInsertQuery = `
        INSERT INTO canonical_verses (canonical_id, osis_ref)
        VALUES ($1, $2)
        ON CONFLICT (osis_ref) DO NOTHING;
      `;
      await client.query(verseInsertQuery, [verse.canonicalId, verse.osisRef]);

      // 2. Insert into verse_texts
      for (const [version, text] of Object.entries(verse.texts)) {
        const textInsertQuery = `
          INSERT INTO verse_texts (canonical_id, version_abbreviation, text)
          VALUES ($1, $2, $3)
          ON CONFLICT (canonical_id, version_abbreviation) DO NOTHING;
        `;
        await client.query(textInsertQuery, [verse.canonicalId, version, text]);
      }

      // 3. Insert into original_language_words
      for (let i = 0; i < verse.originalLanguageWords.length; i++) {
        const word = verse.originalLanguageWords[i];
        const wordInsertQuery = `
          INSERT INTO original_language_words (canonical_id, word_position, text, transliteration, lemma, strongs_number, morphology, contextual_vector)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (canonical_id, word_position) DO NOTHING;
        `;
        // pgvector expects a string representation of the array
        const vectorString = word.contextualVector ? `[${word.contextualVector.join(',')}]` : null;
        await client.query(wordInsertQuery, [
          verse.canonicalId,
          i + 1, // 1-based positioning
          word.text,
          word.transliteration,
          word.lemma,
          word.strongsNumber,
          word.morphology,
          vectorString,
        ]);
      }

      // 4. Insert into versification_maps
      for (const [scheme, reference] of Object.entries(verse.versificationMap)) {
          const mapInsertQuery = `
            INSERT INTO versification_maps (canonical_id, scheme, reference)
            VALUES ($1, $2, $3)
            ON CONFLICT (canonical_id, scheme) DO NOTHING;
          `;
          await client.query(mapInsertQuery, [verse.canonicalId, scheme, reference]);
      }

      await client.query('COMMIT');
      logger.debug(`[PostgresBibleStorageAdapter] Successfully saved verse: ${verse.osisRef}`);
    } catch (e) {
      await client.query('ROLLBACK');
      logger.error(`[PostgresBibleStorageAdapter] Error saving verse ${verse.osisRef}:`, e);
      throw e;
    } finally {
      client.release();
    }
  }
}

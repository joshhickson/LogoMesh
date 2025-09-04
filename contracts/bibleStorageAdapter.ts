import { EnrichedVerse } from './entities';

/**
 * Defines the interface for storing and retrieving data related to the
 * biblical text ingestion engine.
 */
export interface BibleStorageAdapter {
  /**
   * Saves a fully processed and enriched verse to the database.
   * This method is responsible for handling the transactional insertion
   * into all relevant tables (`canonical_verses`, `verse_texts`, `original_language_words`, etc.).
   * @param verse - The EnrichedVerse object to save.
   */
  saveEnrichedVerse(verse: EnrichedVerse): Promise<void>;

  // Future methods might include:
  // getEnrichedVerse(osisRef: string): Promise<EnrichedVerse | null>;
  // findSimilarWords(vector: number[]): Promise<OriginalLanguageWord[]>;
}

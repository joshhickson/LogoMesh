import { EnrichedVerse, OriginalLanguageWord, VersificationMap } from '../../contracts/entities';
import { BibleStorageAdapter } from '../../contracts/bibleStorageAdapter';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * BookIngestionService is responsible for fetching biblical texts from various sources,
 * combining them into the EnrichedVerse format, and saving them to the database.
 */
export class BookIngestionService {
  private bibleStorage: BibleStorageAdapter;

  constructor(bibleStorage: BibleStorageAdapter) {
    this.bibleStorage = bibleStorage;
    logger.info('[BookIngestionService] Initialized');
  }

  /**
   * The main public method to trigger the ingestion of a full chapter's data.
   * @param bookOsisRef - The OSIS reference for the book (e.g., "John").
   * @param chapterNum - The chapter number.
   * @param chapterData - A raw string containing the tab-separated interlinear data.
   */
  public async ingestChapter(bookOsisRef: string, chapterNum: number, chapterData: string): Promise<void> {
    logger.info(`[BookIngestionService] Starting ingestion for ${bookOsisRef} ${chapterNum}`);
    const parsedData = this._parseChapterData(chapterData);

    const enrichedVerses: EnrichedVerse[] = [];

    for (const [verseNum, words] of parsedData.entries()) {
      const canonicalId = uuidv4();
      const osisRef = `${bookOsisRef}.${chapterNum}.${verseNum}`;

      const originalLanguageWords: OriginalLanguageWord[] = words.map(word => ({
        text: word.greekWord,
        transliteration: word.translit,
        lemma: '', // The raw data doesn't contain the lemma directly, would need a lexicon lookup.
        strongsNumber: word.strongsNum,
        morphology: word.parsing,
      }));

      const englishText = words.map(word => word.bsbGloss).join(' ').replace(/\s+/g, ' ').trim();

      const verse: EnrichedVerse = {
        canonicalId,
        osisRef,
        versificationMap: {
            'berean': `${bookOsisRef} ${chapterNum}:${verseNum}` // Placeholder
        },
        texts: {
            'BSB': englishText
        },
        originalLanguageWords
      };
      enrichedVerses.push(verse);
    }

    logger.info(`[BookIngestionService] Created ${enrichedVerses.length} enriched verse objects.`);

    for (const verse of enrichedVerses) {
      await this.bibleStorage.saveEnrichedVerse(verse);
    }

    logger.info(`[BookIngestionService] Completed ingestion for ${bookOsisRef} ${chapterNum}`);
    await Promise.resolve();
  }

  /**
   * Parses the raw tab-separated interlinear data into a structured map.
   * @param rawData - The raw TSV string.
   * @returns A map where the key is the verse number and the value is an array of word objects.
   * @private
   */
  private _parseChapterData(rawData: string): Map<number, any[]> {
    const verses = new Map<number, any[]>();
    const rows = rawData.trim().split('\n');

    for (const row of rows) {
      const columns = row.split('\t');
      if (columns.length < 16) {
        continue; // Skip malformed or empty rows
      }

      const verseRef = columns[3];
      const greekWord = columns[6];
      const translit = columns[8];
      const parsing = columns[9];
      const strongsNum = columns[11];
      const bsbGloss = columns[15];

      // Skip rows that don't have a valid Greek word (e.g., empty formatting rows)
      if (!greekWord) {
        continue;
      }

      const verseMatch = verseRef.match(/:(\d+)$/);
      if (!verseMatch) {
        continue;
      }
      const verseNum = parseInt(verseMatch[1], 10);

      if (!verses.has(verseNum)) {
        verses.set(verseNum, []);
      }

      // The raw data has some extra columns that can mess up the gloss.
      // We'll take the BSB version column and clean it up.
      const cleanedGloss = bsbGloss.replace(/<[^>]*>/g, '').trim();

      verses.get(verseNum)?.push({
        greekWord,
        translit,
        parsing,
        strongsNum,
        bsbGloss: cleanedGloss,
      });
    }

    return verses;
  }
}

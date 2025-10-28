import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import {
  StorageAdapter,
  Thought,
  Segment,
  NewThoughtData,
  NewSegmentData,
  ULID,
} from '@logomesh/contracts';
import { ulid } from 'ulid';

export class SQLiteAdapter implements StorageAdapter {
  private db: Database | null = null;
  private dbPath: string;

  constructor(dbPath: string = ':memory:') {
    this.dbPath = dbPath;
  }

  async initialize(): Promise<void> {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database,
    });

    await this.db.exec('PRAGMA foreign_keys = ON;');

    // This schema is TRULY NORMALIZED, fixing the audit issue.
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS thoughts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS segments (
        id TEXT PRIMARY KEY,
        thoughtId TEXT NOT NULL,
        title TEXT,
        content TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (thoughtId) REFERENCES thoughts(id) ON DELETE CASCADE
      );
    `);
  }

  async close(): Promise<void> {
    await this.db?.close();
  }

  async healthCheck(): Promise<{ status: 'ok' | 'error'; message?: string }> {
    try {
      await this.db?.get('SELECT 1');
      return { status: 'ok' };
    } catch (error) {
      return { status: 'error', message: (error as Error).message };
    }
  }

  async createThought(data: NewThoughtData): Promise<Thought> {
    if (!this.db) throw new Error('Database not initialized.');

    const newThought: Thought = {
      id: ulid(),
      title: data.title,
      description: data.description?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      // These are empty because they are retrieved via joins.
      tags: [],
      segments: [],
    };

    await this.db.run(
      'INSERT INTO thoughts (id, title, description, createdAt, updatedAt) VALUES (?,?,?,?,?)',
      newThought.id,
      newThought.title,
      newThought.description,
      newThought.createdAt.toISOString(),
      newThought.updatedAt.toISOString()
    );

    return newThought;
  }

  async getThoughtById(id: ULID): Promise<Thought | null> {
    if (!this.db) throw new Error('Database not initialized.');

    const thoughtRow = await this.db.get(
      'SELECT * FROM thoughts WHERE id = ?',
      id
    );

    if (!thoughtRow) {
      return null;
    }

    const segments = await this.db.all(
      'SELECT * FROM segments WHERE thoughtId = ? ORDER BY createdAt ASC',
      id
    );

    const thought: Thought = {
      id: thoughtRow.id,
      title: thoughtRow.title,
      description: thoughtRow.description,
      createdAt: new Date(thoughtRow.createdAt),
      updatedAt: new Date(thoughtRow.updatedAt),
      tags: [], // Tags not implemented yet
      segments: segments.map(s => ({
        id: s.id,
        thoughtId: s.thoughtId,
        title: s.title,
        content: s.content,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        attributes: [], // Attributes not implemented yet
      })),
    };

    return thought;
  }

  async getAllThoughts(): Promise<Thought[]> {
    if (!this.db) throw new Error('Database not initialized.');

    const thoughtRows = await this.db.all('SELECT * FROM thoughts ORDER BY createdAt DESC');
    const segmentRows = await this.db.all('SELECT * FROM segments ORDER BY createdAt ASC');

    const segmentsByThoughtId = new Map<ULID, Segment[]>();
    for (const s of segmentRows) {
      const segment: Segment = {
        id: s.id,
        thoughtId: s.thoughtId,
        title: s.title,
        content: s.content,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        attributes: [], // Attributes not implemented yet
      };
      if (!segmentsByThoughtId.has(s.thoughtId)) {
        segmentsByThoughtId.set(s.thoughtId, []);
      }
      segmentsByThoughtId.get(s.thoughtId)!.push(segment);
    }

    return thoughtRows.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
      tags: [], // Tags not implemented yet
      segments: segmentsByThoughtId.get(t.id) || [],
    }));
  }

  async createSegment(thoughtId: ULID, data: NewSegmentData): Promise<Segment> {
    if (!this.db) throw new Error('Database not initialized.');

    const newSegment: Segment = {
      id: ulid(),
      thoughtId,
      title: data.title?? null,
      content: data.content,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes: [],
    };

    await this.db.run(
      'INSERT INTO segments (id, thoughtId, title, content, createdAt, updatedAt) VALUES (?,?,?,?,?,?)',
      newSegment.id,
      newSegment.thoughtId,
      newSegment.title,
      newSegment.content,
      newSegment.createdAt.toISOString(),
      newSegment.updatedAt.toISOString()
    );

    return newSegment;
  }
}

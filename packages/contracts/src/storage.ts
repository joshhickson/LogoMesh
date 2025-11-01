import { Thought, Segment, ULID } from './entities';

/**
 * Input type for creating a new thought (excludes generated fields).
 */
export interface NewThoughtData {
  title: string;
  description?: string | null;
}

/**
 * Input type for creating a new segment (excludes generated fields).
 */
export interface NewSegmentData {
  title?: string | null;
  content: string;
}

/**
 * Storage adapter interface for persistent data operations.
 * Provides async CRUD methods for Thoughts and Segments.
 */
export interface StorageAdapter {
  initialize(): Promise<void>;
  close(): Promise<void>;
  healthCheck(): Promise<{ status: 'ok' | 'error'; message?: string }>;

  // Thought operations
  createThought(data: NewThoughtData): Promise<Thought>;
  getThoughtById(id: ULID): Promise<Thought | null>;
  getAllThoughts(): Promise<Thought[]>;

  // Segment operations
  createSegment(thoughtId: ULID, data: NewSegmentData): Promise<Segment>;
}

import { Thought, Segment } from './entities';

/**
 * Input type for creating a new thought (excludes generated fields)
 */
export interface NewThoughtData {
  id?: string;
  title: string;
  content?: string;
  description?: string;
  embedding?: number[];
  tags?: Array<{ name: string; color: string }>;
  position?: { x: number; y: number };
  color?: string;
  fields?: Record<string, unknown>; // Changed from any
  metadata?: Record<string, unknown>; // Changed from any
}

/**
 * Input type for creating a new segment (excludes generated fields)
 */
export interface NewSegmentData {
  id?: string;
  title?: string;
  content: string;
  content_type?: string;
  asset_path?: string;
  fields?: Record<string, unknown>; // Changed from any
  abstraction_level?: string;
  local_priority?: number;
  cluster_id?: string;
  thoughtId?: string;
  segmentType?: string;
  metadata?: Record<string, unknown>; // Changed from any
  positionX?: number;
  positionY?: number;
}

/**
 * Storage adapter interface for persistent data operations
 * Provides async CRUD methods for Thoughts and Segments
 */
export interface StorageAdapter {
  // Thought operations
  getAllThoughts(_userId?: string): Promise<Thought[]>;
  getThoughtById(_thoughtId: string, _userId?: string): Promise<Thought | null>;
  createThought(_thoughtData: NewThoughtData, _userId?: string): Promise<Thought>;
  updateThought(_thoughtId:string, _updates: Partial<NewThoughtData>, _userId?: string): Promise<Thought | null>;
  deleteThought(_thoughtId: string, _userId?: string): Promise<boolean>;
  findSimilarThoughts(embedding: number[], maxResults: number, userId?: string): Promise<Thought[]>;

  // Segment operations
  getSegmentsForThought(_thoughtId: string, _userId?: string): Promise<Segment[]>;
  getSegmentById(_segmentId: string, _userId?: string): Promise<Segment | null>;
  createSegment(_thoughtId: string, _segmentData: NewSegmentData, _userId?: string): Promise<Segment>;
  updateSegment(_thoughtId: string, _segmentId: string, _updates: Partial<NewSegmentData>, _userId?: string): Promise<Segment | null>;
  deleteSegment(_thoughtId: string, _segmentId: string, _userId?: string): Promise<boolean>;

  // Utility operations
  initialize(): Promise<void>;
  close(): Promise<void>;
}
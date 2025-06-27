import { Thought, Segment, NewThoughtData, NewSegmentData } from './entities';

// Define update types inline since they're missing from entities
export interface UpdateThoughtData {
  id?: string;
  title?: string;
  content?: string;
  tags?: string[];
  parentId?: string | null;
  metadata?: Record<string, any>;
}

export interface UpdateSegmentData {
  id?: string;
  title?: string;
  content?: string;
  segmentType?: string;
  metadata?: Record<string, any>;
}

// Re-export types for API service
export type { NewThoughtData, NewSegmentData } from './entities';

export interface StorageAdapter {
  // Thought operations
  createThought(thoughtData: NewThoughtData, userId: string): Promise<Thought>;
  getThoughtById(id: string): Promise<Thought | null>;
  getAllThoughts(): Promise<Thought[]>;
  updateThought(id: string, updates: Partial<NewThoughtData>): Promise<Thought | null>;
  deleteThought(id: string): Promise<boolean>;

  // Segment operations
  createSegment(thoughtId: string, segmentData: NewSegmentData): Promise<Segment | null>;
  updateSegment(thoughtId: string, segmentId: string, updates: Partial<NewSegmentData>): Promise<Segment | null>;
  deleteSegment(thoughtId: string, segmentId: string): Promise<boolean>;

  // Utility operations
  initialize(): Promise<void>;
  close(): Promise<void>;
}
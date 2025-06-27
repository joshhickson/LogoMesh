
// Frontend contracts for storage operations
export interface NewThoughtData {
  title: string;
  content: string;
  tags?: string[];
}

export interface NewSegmentData {
  content: string;
  position?: number;
  tags?: string[];
}

export interface UpdateThoughtData {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface UpdateSegmentData {
  content?: string;
  position?: number;
  tags?: string[];
}
import { Thought, Segment, NewThoughtData, NewSegmentData } from './entities';

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

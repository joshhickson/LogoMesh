
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

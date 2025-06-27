
// Frontend contracts for entities
export interface Thought {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  segments?: Segment[];
}

export interface Segment {
  id: string;
  thought_id: string;
  content: string;
  position: number;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  created_at: string;
}

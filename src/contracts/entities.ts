
// Single, consistent interface definitions
export interface Thought {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: Tag[];
  segments: Segment[];
  userId: string;
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
}

export interface Segment {
  id: string;
  title: string;
  content: string;
  thought_id: string;
  thoughtId: string;
  position: number;
  attributes: SegmentAttribute[];
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface SegmentAttribute {
  fieldName: string;
  fieldValue: string;
  fieldType: 'text' | 'number' | 'boolean' | 'date';
}

export interface NewThoughtData {
  title: string;
  description: string;
  content: string;
  tags?: Tag[];
}

export interface NewSegmentData {
  title: string;
  content: string;
  position?: number;
  attributes?: SegmentAttribute[];
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

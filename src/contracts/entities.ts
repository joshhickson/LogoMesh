
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
export interface Thought {
  id: string;
  title: string;
  description: string;
  tags: Tag[];
  segments: Segment[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Segment {
  id: string;
  title: string;
  content: string;
  thoughtId: string;
  attributes: SegmentAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface SegmentAttribute {
  fieldName: string;
  fieldValue: string;
  fieldType: 'text' | 'number' | 'boolean' | 'date';
}

export interface NewThoughtData {
  title: string;
  description: string;
  tags?: Tag[];
}

export interface NewSegmentData {
  title: string;
  content: string;
  attributes?: SegmentAttribute[];
}

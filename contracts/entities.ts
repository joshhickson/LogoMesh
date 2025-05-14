/**
 * Core entity interfaces and types
 */
export type PredefinedContentType = 'text' | 'image' | 'audio' | 'video' | 'link';
export type ContentType = PredefinedContentType | string;

export interface Tag {
  name: string;
  color: string;
}

export interface Segment {
  segment_id: string;
  thought_bubble_id: string;
  title: string;  
  content: string;
  content_type: ContentType;
  created_at: string;
  updated_at: string;
  fields?: Record<string, string | number | boolean | Date | string[] | number[]>;
  embedding_vector?: number[];
  abstraction_level?: string;
  cluster_id?: string;
  local_priority?: number;
}

export interface Thought {
  thought_bubble_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  segments?: Segment[];
  position?: {
    x: number;
    y: number;
  };
  color?: string;
}

export interface ExportMetadata {
  version: string;
  export_date: string;
  author?: string;
  tool?: string;
}

export interface ThoughtWebExport {
  export_metadata: ExportMetadata;
  thoughts: Thought[];
}
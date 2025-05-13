
/**
 * Core entity interfaces for ThoughtWeb
 */

export interface Tag {
  name: string;
  color: string;
}

export interface Segment {
  segment_id: string;
  title: string;
  content?: string;
  relationship?: string;
  fields?: Record<string, string>;
  embedding_vector?: number[];
  sourcePosition?: {
    x: number;
    y: number;
  };
}

export interface Thought {
  thought_bubble_id: string;
  title: string;
  description?: string;
  created_at: string;
  tags: Tag[];
  segments: Segment[];
  position?: {
    x: number;
    y: number;
  };
  color?: string;
}

export interface ExportMetadata {
  version: string;
  exported_at: string;
  author: string;
  tool: string;
}

export interface ThoughtWebExport {
  export_metadata: ExportMetadata;
  thoughts: Thought[];
}

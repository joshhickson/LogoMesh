
/**
 * Core entity interfaces for ThoughtWeb
 */

export type PredefinedContentType = 'text' | 'image' | 'audio' | 'video' | 'link';
export type CustomContentType = string & { _brand?: 'CustomContentType' };
export type ContentType = PredefinedContentType | CustomContentType;

export type PredefinedAbstractionLevel = 'Fact' | 'Idea' | 'Theme' | 'Goal';
export type CustomAbstractionLevel = string & { _brand?: 'CustomAbstractionLevel' };
export type AbstractionLevel = PredefinedAbstractionLevel | CustomAbstractionLevel;

export type FieldValue = string | number | boolean | Date | string[] | number[];

export interface Tag {
  name: string;
  color: string;
  created_at?: string;
}

export interface Segment {
  segment_id: string;
  thought_bubble_id: string;
  title: string;
  content?: string;
  content_type: ContentType;
  abstraction_level: AbstractionLevel;
  relationship?: string;
  fields: Record<string, FieldValue>;
  embedding_vector?: number[];
  sourcePosition?: {
    x: number;
    y: number;
  };
  created_at: string;
  updated_at?: string;
  local_priority?: number;
  cluster_id?: string;
}

export interface Thought {
  thought_bubble_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  tags: Tag[];
  segments: Segment[];
  position?: {
    x: number;
    y: number;
  };
  color?: string;
  local_priority?: number;
  cluster_id?: string;
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

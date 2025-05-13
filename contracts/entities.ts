
/**
 * Core entity interfaces and types for ThoughtWeb
 */

/** Represents predefined content types supported by the system */
export type PredefinedContentType = 'text' | 'image' | 'audio' | 'video' | 'link';

/** Allows for custom content type extensions */
export type CustomContentType = string & { _brand?: 'CustomContentType' };

/** Union type of all supported content types */
export type ContentType = PredefinedContentType | CustomContentType;

/** Represents predefined levels of thought abstraction */
export type PredefinedAbstractionLevel = 'Fact' | 'Idea' | 'Theme' | 'Goal';

/** Allows for custom abstraction level extensions */
export type CustomAbstractionLevel = string & { _brand?: 'CustomAbstractionLevel' };

/** Union type of all supported abstraction levels */
export type AbstractionLevel = PredefinedAbstractionLevel | CustomAbstractionLevel;

/** Supported field value types for segment metadata */
export type FieldValue = string | number | boolean | Date | string[] | number[];

/** Represents a tag with name and color */
export interface Tag {
  name: string;
  color: string;
}

/** Represents a segment within a thought bubble */
export interface Segment {
  segment_id: string;
  thought_bubble_id: string;
  title: string;
  content: string;
  content_type: ContentType;
  asset_path?: string;
  /** 
   * Key-value store for custom data fields associated with the segment.
   * Assembled by the data layer from normalized storage.
   * This can also be used for analytical dimensions like "Who", "What", "When", "Where", "Why", "How".
   */
  fields: Record<string, FieldValue>;
  embedding_vector?: number[];
  created_at: string;
  updated_at: string;
  abstraction_level: AbstractionLevel;
  local_priority: number;
  cluster_id: string;
}

/** Represents a thought bubble containing segments and metadata */
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

/** Metadata for export operations */
export interface ExportMetadata {
  version: string;
  exported_at: string;
  author: string;
  tool: string;
}

/** Complete export structure */
export interface ThoughtWebExport {
  export_metadata: ExportMetadata;
  thoughts: Thought[];
}

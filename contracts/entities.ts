
/**
 * Core entity interfaces and types for ThoughtWeb
 */

/** Predefined content types supported by the system */
export type PredefinedContentType = 'text' | 'image' | 'audio' | 'video' | 'link';
/** Custom content type with branded type for type safety */
export type CustomContentType = string & { _brand?: 'CustomContentType' };
/** Union type of all possible content types */
export type ContentType = PredefinedContentType | CustomContentType;

/** Predefined abstraction levels for organizing thoughts */
export type PredefinedAbstractionLevel = 'Fact' | 'Idea' | 'Theme' | 'Goal';
/** Custom abstraction level with branded type for type safety */
export type CustomAbstractionLevel = string & { _brand?: 'CustomAbstractionLevel' };
/** Union type of all possible abstraction levels */
export type AbstractionLevel = PredefinedAbstractionLevel | CustomAbstractionLevel;

/** Value types that can be stored in segment fields */
export type FieldValue = string | number | boolean | Date | string[] | number[];

/** Basic metadata for categorizing and displaying thoughts */
export interface Tag {
  name: string;
  color: string;
}

/** 
 * A segment represents a discrete piece of content within a thought
 * Can contain different types of content and custom fields
 */
export interface Segment {
  segment_id: string;
  thought_bubble_id: string;
  title: string;
  content: string;
  content_type: ContentType;
  created_at: string;
  updated_at: string;
  /**
   * Key-value store for custom data fields associated with the segment.
   * Assembled by the data layer from normalized storage.
   * This can also be used for analytical dimensions like "Who", "What", "When", "Where", "Why", "How".
   */
  fields?: Record<string, string | number | boolean | Date | string[] | number[]>;
}

/**
 * A thought represents a complete idea or concept
 * Contains metadata and optional segments of content
 */
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

/** 
 * Metadata about the export file itself
 * @property version - Schema version (e.g., "1.0")
 * @property export_date - ISO date string (e.g., "2025-05-03T00:00Z")
 * @property author - Optional: Name of person/system exporting
 * @property tool - Optional: Name of tool used for export
 */
export interface ExportMetadata {
  version: string;
  export_date: string;
  author?: string;
  tool?: string;
}

/** Complete export format including metadata and thoughts */
export interface ThoughtWebExport {
  export_metadata: ExportMetadata;
  thoughts: Thought[];
}


/**
 * Core entity interfaces and types for ThoughtWeb
 */

/** Predefined content types that are natively supported by the system */
export type PredefinedContentType = 'text' | 'image' | 'audio' | 'video' | 'link';

/** Allows extending content types with custom string-based types */
export type CustomContentType = string & { _brand?: 'CustomContentType' };

/** Union of all supported content types, both predefined and custom */
export type ContentType = PredefinedContentType | CustomContentType;

/** Standard levels of thought abstraction in the system hierarchy */
export type PredefinedAbstractionLevel = 'Fact' | 'Idea' | 'Theme' | 'Goal';

/** Allows extending abstraction levels with custom string-based types */
export type CustomAbstractionLevel = string & { _brand?: 'CustomAbstractionLevel' };

/** Union of all supported abstraction levels, both predefined and custom */
export type AbstractionLevel = PredefinedAbstractionLevel | CustomAbstractionLevel;

/** Valid data types for segment field values */
export type FieldValue = string | number | boolean | Date | string[] | number[];

/** Represents a tag for categorizing and filtering thoughts */
export interface Tag {
  /** Unique identifier for the tag */
  name: string;
  /** Color code for visual representation */
  color: string;
}

/** Represents a segment within a thought bubble */
export interface Segment {
  /** Unique identifier for the segment */
  segment_id: string;
  /** Reference to the parent thought bubble */
  thought_bubble_id: string;
  /** Display title of the segment */
  title: string;
  /** Main content of the segment */
  content: string;
  /** The modality of the segment's content (e.g., 'text', 'image', 'link'). Defaults to 'text'. Allows for custom string types. */
  content_type: ContentType;
  /** Optional path to associated media asset */
  asset_path?: string;
  /** 
   * Key-value store for custom data fields associated with the segment.
   * Assembled by the data layer from normalized storage.
   * This can also be used for analytical dimensions like "Who", "What", "When", "Where", "Why", "How".
   */
  fields: Record<string, FieldValue>;
  /** Vector representation for semantic search and clustering */
  embedding_vector?: number[];
  /** ISO date string of creation timestamp */
  created_at: string;
  /** ISO date string of last modification */
  updated_at: string;
  /** The level of abstraction this segment represents */
  abstraction_level: AbstractionLevel;
  /** Priority score for local context (0.0 to 1.0) */
  local_priority: number;
  /** Identifier for the cluster this segment belongs to */
  cluster_id: string;
}

/** Represents a thought bubble containing segments and metadata */
export interface Thought {
  /** Unique identifier for the thought bubble */
  thought_bubble_id: string;
  /** Display title of the thought */
  title: string;
  /** Optional detailed description */
  description?: string;
  /** ISO date string of creation timestamp */
  created_at: string;
  /** ISO date string of last modification */
  updated_at: string;
  /** Optional array of associated tags */
  tags?: Tag[];
  /** Optional array of contained segments */
  segments?: Segment[];
  /** Optional position in the visual graph */
  position?: {
    x: number;
    y: number;
  };
  /** Optional color for visual representation */
  color?: string;
}

/** Metadata defining version and timing of thought web exports */
export interface ExportMetadata {
  /** Schema version identifier (e.g., "1.0") */
  version: string;
  /** ISO date string of export timestamp */
  export_date: string;
  /** Optional identifier of the exporting user/system */
  author?: string;
  /** Optional identifier of the exporting tool/version */
  tool?: string;
}

/** Complete export structure for thought web data */
export interface ThoughtWebExport {
  /** Metadata about the export itself */
  export_metadata: ExportMetadata;
  /** Array of all thought bubbles in the export */
  thoughts: Thought[];
}

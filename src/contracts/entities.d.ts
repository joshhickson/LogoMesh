/**
 * Core entity interfaces and types for ThoughtWeb
 */
/** Predefined content types natively supported by the system */
export type PredefinedContentType = 'text' | 'image' | 'audio' | 'video' | 'link';
/** Custom content type with type branding for safety */
export type CustomContentType = string & {
    _brand?: 'CustomContentType';
};
/** Union of predefined and custom content types */
export type ContentType = PredefinedContentType | CustomContentType;
/** Standard abstraction levels for organizing thoughts */
export type PredefinedAbstractionLevel = 'Fact' | 'Idea' | 'Theme' | 'Goal';
/** Custom abstraction level with type branding for safety */
export type CustomAbstractionLevel = string & {
    _brand?: 'CustomAbstractionLevel';
};
/** Union of predefined and custom abstraction levels */
export type AbstractionLevel = PredefinedAbstractionLevel | CustomAbstractionLevel;
/** Allowed value types for segment fields */
export type FieldValue = string | number | boolean | Date | string[] | number[];
/** Metadata for categorizing and visually identifying thoughts */
export interface Tag {
    /** Unique identifier for the tag */
    name: string;
    /** Color in hex format (e.g., "#ff0000") for visual distinction */
    color: string;
}
/**
 * A segment represents a discrete piece of content within a thought.
 * Can contain different types of content and custom fields.
 */
export interface Segment {
    /** Unique identifier for the segment */
    segment_id: string;
    /** Reference to parent thought */
    thought_bubble_id: string;
    /** Display name for the segment */
    title: string;
    /** Main content of the segment */
    content: string;
    /** The modality of the segment's content (e.g., 'text', 'image', 'link'). Defaults to 'text'. Allows for custom string types. */
    content_type: ContentType;
    /** Optional path to a local asset for non-text content types */
    asset_path?: string;
    /**
     * Key-value store for custom data fields associated with the segment.
     * Assembled by the data layer from normalized storage.
     * This can also be used for analytical dimensions like "Who", "What", "When", "Where", "Why", "How".
     */
    fields: Record<string, FieldValue>;
    /** Optional vector representation of the segment's content */
    embedding_vector?: number[];
    /** ISO timestamp of creation */
    created_at: string;
    /** ISO timestamp of last update */
    updated_at: string;
    /** The defined abstraction level of the segment (e.g., 'Fact', 'Idea'). Defaults to 'Fact'. */
    abstraction_level: AbstractionLevel;
    /** Importance score for LLM chunking and attention. Defaults to 0.5. */
    local_priority: number;
    /** ID for grouping by theme/narrative. Defaults to 'uncategorized_cluster'. */
    cluster_id: string;
}
/**
 * A thought represents a complete idea or concept.
 * Contains metadata and optional segments of content.
 */
export interface Thought {
    /** Unique identifier for the thought */
    thought_bubble_id: string;
    /** Display name for the thought */
    title: string;
    /** Optional longer description of the thought */
    description?: string;
    /** ISO timestamp of creation */
    created_at: string;
    /** ISO timestamp of last update */
    updated_at: string;
    /** Optional categorization tags */
    tags?: Tag[];
    /** Optional content segments */
    segments?: Segment[];
    /** Optional position in 2D space */
    position?: {
        x: number;
        y: number;
    };
    /** Optional display color in hex format */
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
    /** Metadata about the export itself */
    export_metadata: ExportMetadata;
    /** Array of exported thoughts */
    thoughts: Thought[];
}
//# sourceMappingURL=entities.d.ts.map
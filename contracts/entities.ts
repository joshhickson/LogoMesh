// Placeholder for core entities
// TODO: Define proper entity interfaces/types

export interface Thought {
  thought_bubble_id: string;
  title: string;
  description?: string | null;
  content?: string; // For embedding purposes, not always populated
  embedding?: number[];
  created_at: Date; // string -> Date
  updated_at: Date; // string -> Date
  color?: string | null;
  position?: { x: number; y: number };
  fields?: Record<string, unknown>; // Added
  metadata?: Record<string, unknown>; // Added
  tags?: Tag[];
  segments?: Segment[];
}

export interface Segment {
  segment_id: string;
  thought_bubble_id: string;
  title?: string | null;
  content: string;
  content_type?: string; // e.g., 'text', 'code', 'mermaid'
  fields?: Record<string, unknown>; // For custom metadata
  metadata?: Record<string, unknown>; // Added to match NewSegmentData and PostgresAdapter usage
  created_at: Date; // string -> Date
  updated_at: Date; // string -> Date
  abstraction_level?: string;
  local_priority?: number;
  cluster_id?: string;
  sort_order?: number;
}

export interface Tag {
  tag_id?: string; // Made optional as it might be generated based on name
  name: string;
  color?: string;
  created_at?: string;
  // any other relevant fields
}

export interface Edge {
  edge_id: string;
  source_thought_id: string;
  target_thought_id: string;
  label?: string;
  created_at: string;
  updated_at: string;
  // any other relevant fields
}

export interface UserSettings {
  user_id: string;
  settings: Record<string, unknown>;
  // any other relevant fields
}

export interface GraphState {
  // Define structure for graph state if needed
  zoom_level?: number;
  viewport_position?: { x: number; y: number };
}

export interface NodePosition {
  node_id: string;
  x: number;
  y: number;
}

// =============================================================================
// TYPES FOR BIBLICAL INGESTION ENGINE
// =============================================================================

export interface VersificationMap {
  [scheme: string]: string; // e.g., { "eng_kjv": "Ps.23.1", "lxx": "Ps.22.1" }
}

export interface OriginalLanguageWord {
  text: string;
  transliteration: string;
  lemma: string;
  strongsNumber: string;
  morphology: string; // e.g., "N-NSM"
  // syntax?: any; // To be defined later
  contextualVector?: number[];
}

export interface EnrichedVerse {
  canonicalId: string; // UUID
  osisRef: string; // e.g., "Gen.1.1"
  versificationMap: VersificationMap;

  texts: {
    [versionAbbreviation: string]: string; // e.g., { "KJV": "The LORD is my shepherd...", "SBLGNT": "..." }
  };

  originalLanguageWords: OriginalLanguageWord[];

  entities?: {
    entityId: string;
    type: 'person' | 'place' | 'concept';
    wordIndices: number[];
  }[];
}

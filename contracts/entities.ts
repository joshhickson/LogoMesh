// Placeholder for core entities
// TODO: Define proper entity interfaces/types

export interface Thought {
  thought_bubble_id: string;
  title: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  color?: string | null;
  position?: { x: number; y: number };
  tags?: Tag[];
  segments?: Segment[];
}

export interface Segment {
  segment_id: string;
  thought_bubble_id: string;
  title?: string | null;
  content: string;
  content_type?: string; // e.g., 'text', 'code', 'mermaid'
  fields?: Record<string, any>; // For custom metadata
  created_at: string;
  updated_at: string;
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
  settings: Record<string, any>;
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

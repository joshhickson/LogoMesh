
/**
 * Core Type Definitions for LogoMesh System
 * Replaces `any` types throughout the codebase with proper TypeScript interfaces
 */

// Cognitive Context Engine Types
export interface CognitiveContext {
  id: string;
  data: Record<string, unknown>;
  metadata: ContextMetadata;
  timestamp: Date;
  relevanceScore: number;
}

export interface ContextMetadata {
  timestamp: string;
  source: string;
  confidence: number;
  compressionLevel?: 'none' | 'basic' | 'semantic' | 'aggressive';
  clusterId?: string;
}

export interface RelatedContext {
  directConnections: string[];
  semanticSimilarity: string[];
  conceptualClusters: string[];
  traversalDepth: number;
}

export interface ContextCluster {
  id: string;
  contexts: CognitiveContext[];
  similarity: number;
  metadata: Record<string, unknown>;
}

// Data Export/Import Types
export interface ExportData {
  metadata: ExportMetadata;
  thoughts: ThoughtData[];
}

export interface ExportMetadata {
  exportDate: string;
  version: string;
  compressionOptions?: SemanticCompressionOptions;
  thoughtCount: number;
  segmentCount: number;
}

export interface ThoughtData {
  thought_bubble_id: string;
  title: string;
  description: string;
  segments?: SegmentData[];
  tags?: TagData[];
  abstraction_level?: string;
  local_priority?: number;
  cluster_id?: string;
  created_at: string;
  updated_at: string;
  position?: Position;
  metadata?: Record<string, unknown>;
}

export interface SegmentData {
  segment_id: string;
  thought_bubble_id: string;
  title: string;
  content: string;
  content_type: string;
  abstraction_level?: string;
  local_priority?: number;
  cluster_id?: string;
  sort_order?: number;
  tags?: TagData[];
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface TagData {
  name: string;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface Position {
  x: number;
  y: number;
}

// Database Query Types
export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  command: string;
  fields?: QueryField[];
}

export interface QueryField {
  name: string;
  dataTypeID: number;
  format: string;
}

export interface DatabaseRow {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  fields: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface ThoughtRecord extends DatabaseRow {
  title: string;
  description: string;
}

export interface SegmentRecord extends DatabaseRow {
  thought_id: string;
  content: string;
  segment_type: string;
  position_x: number;
  position_y: number;
  title?: string;
}

// Compression and Filtering Types
export interface SemanticCompressionOptions {
  abstractionLevelFilter?: string[];
  localPriorityThreshold?: number;
  clusterIdFilter?: string[];
  maxDepth?: number;
  includeRelatedContext?: boolean;
  compressionLevel?: 'none' | 'basic' | 'semantic' | 'aggressive';
}

export interface CompressionResult {
  compressed: boolean;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  essentialContext?: string;
  keyInsights?: string[];
  semanticSummary?: string;
  keyConceptsRetained?: string[];
}

// Error and Response Types
export interface ServiceError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ServiceError;
  metadata?: Record<string, unknown>;
}

// Plugin and LLM Types
export interface PluginData {
  id: string;
  plugin_name: string;
  user_id: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
  baseUrl?: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

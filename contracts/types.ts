/**
 * Core Type Definitions for LogoMesh System
 * Replaces `any` types throughout the codebase with proper TypeScript interfaces
 */

// Cognitive Context Engine Types
export interface CognitiveContext {
  id: string;
  data: Record<string, unknown>; // Consider making this generic if specific data shapes are common
  metadata: ContextMetadata;
  relevanceScore: number; // Score indicating relevance to a query or other contexts
}

export interface ContextMetadata {
  timestamp: Date; // Unified to Date object, serialization handled at boundaries
  source: string; // Origin of the context data (e.g., user input, plugin, LLM)
  confidence: number; // Confidence score (0.0 to 1.0) in the accuracy/relevance of the context
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
  id: string;
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

// Removed DatabaseRow, ThoughtRecord, and SegmentRecord as they were causing TSC errors
// and SQLite adapter now uses SQLiteThoughtRecord and SQLiteSegmentRecord.

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

// ================================
// DATABASE TYPES
// ================================

export interface DatabaseQueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
  command?: string;
  fields?: Array<{ name: string; dataTypeID: number }>;
}

export interface SQLiteRunResult {
  lastID: number;
  changes: number;
}

export interface SQLiteThoughtRecord {
  thought_bubble_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  color: string | null;
  position_x: number | null;
  position_y: number | null;
  tags_str?: string | null; // Renamed and clarified
  fields?: string | null;   // Assuming TEXT column for JSON
  metadata?: string | null; // Assuming TEXT column for JSON
}

export interface SQLiteSegmentRecord {
  segment_id: string;
  thought_bubble_id: string;
  title: string | null;
  content: string;
  content_type?: string | null; // Added
  created_at: string;
  updated_at: string;
  sort_order?: number;
  metadata?: string | null; // JSON string, made nullable
  abstraction_level?: string | null; // Added
  local_priority?: number | null;    // Added
  cluster_id?: string | null;        // Added
}

export interface TagRecord {
  tag_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface PostgresThoughtRecord {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  fields: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: Date; // PostgreSQL returns Date objects, converted to string when mapping to entities
  updated_at: Date; // PostgreSQL returns Date objects, converted to string when mapping to entities
  color?: string | null;
  position_x?: number | null;
  position_y?: number | null;
}

export interface PostgresSegmentRecord {
  id: string;
  thought_id: string;
  user_id: string;
  title: string | null;
  content: string;
  segment_type: string;
  fields: Record<string, unknown>;
  metadata: Record<string, unknown>;
  position_x: number;
  position_y: number;
  created_at: Date; // PostgreSQL returns Date objects, converted to string when mapping to entities
  updated_at: Date; // PostgreSQL returns Date objects, converted to string when mapping to entities
  abstraction_level?: string | null;
  local_priority?: number | null;
  cluster_id?: string | null;
  sort_order?: number | null;
}

// ================================
// LLM & AI TYPES
// ================================

export interface LLMRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  systemPrompt?: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  finishReason?: 'stop' | 'length' | 'content_filter' | 'function_call';
}

export interface LLMExecutionContext {
  requestId: string;
  timestamp: Date;
  model: string;
  prompt: string;
  response?: string;
  error?: string;
  duration?: number;
}

// ================================
// PLUGIN TYPES
// ================================

export interface PluginManifest {
  id: string; // Unique identifier for the plugin
  name: string; // Display name of the plugin
  version: string; // Version of the plugin (e.g., "1.0.0")
  description?: string; // Optional description
  author?: string; // Optional author information
  permissions: PluginPermission[]; // Permissions requested by the plugin
  capabilities: PluginCapability[]; // Capabilities provided by the plugin
  entryPoint: string; // Main execution file for the plugin (e.g., "index.js")
  configSchema?: Record<string, unknown>; // Optional JSON schema for plugin configuration
}

export type PluginPermission =
  | 'readThoughts'
  | 'writeThoughts'
  | 'deleteThoughts'
  | 'executeLLM'
  | 'accessFileSystem'
  | 'networkRequest';

export type PluginCapability =
  | 'onThoughtCreated'
  | 'onThoughtUpdated'
  | 'onThoughtDeleted'
  | 'customCommand';

// ================================
// DATABASE CONFIGURATION TYPES
// ================================

export interface DatabaseConfig {
  type: 'sqlite' | 'postgres' | 'memory'; // Added 'memory' for testing/ephemeral
  connectionString?: string; // Optional for memory, required for others
  filePath?: string; // For SQLite, if not in connectionString
  options?: Record<string, unknown>; // Driver-specific options
  debug?: boolean; // Enable debug logging for queries
}

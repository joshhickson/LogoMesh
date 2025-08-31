export interface SemanticCompressionOptions {
  abstractionLevelFilter?: string[];
  localPriorityThreshold?: number;
  clusterIdFilter?: string[];
  maxDepth?: number;
  compressionLevel?: 'none' | 'basic' | 'semantic' | 'aggressive';
  includeMetadata?: boolean;
  preserveRelationships?: boolean;
}

import { ExportData, ServiceResponse } from "./types"; // Import necessary types

export interface ThoughtExportProvider {
  exportData(_options?: SemanticCompressionOptions): Promise<ServiceResponse<ExportData>>;
  importData(_jsonData: ExportData): Promise<ServiceResponse<{ imported: number; skipped: number }>>;

  // Enhanced methods for semantic compression
  exportWithCompression?(_options: SemanticCompressionOptions): Promise<ServiceResponse<ExportData>>; // Assuming similar return type
  getSemanticSummary?(_thoughtId: string, _options?: SemanticCompressionOptions): Promise<string>;
}
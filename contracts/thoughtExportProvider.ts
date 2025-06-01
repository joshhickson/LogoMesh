export interface SemanticCompressionOptions {
  abstractionLevelFilter?: string[];
  localPriorityThreshold?: number;
  clusterIdFilter?: string[];
  maxDepth?: number;
  compressionLevel?: 'none' | 'basic' | 'semantic' | 'aggressive';
  includeMetadata?: boolean;
  preserveRelationships?: boolean;
}

export interface ThoughtExportProvider {
  exportData(options?: SemanticCompressionOptions): Promise<any>;
  importData(data: any): Promise<void>;

  // Enhanced methods for semantic compression
  exportWithCompression?(options: SemanticCompressionOptions): Promise<any>;
  getSemanticSummary?(thoughtId: string, options?: SemanticCompressionOptions): Promise<string>;
}
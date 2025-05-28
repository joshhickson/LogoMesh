
export interface SemanticCompressionOptions {
  abstractionLevelFilter?: string[];
  localPriorityThreshold?: number;
  clusterIdFilter?: string[];
  maxDepth?: number;
  maxTokens?: number;
}

export interface ThoughtExportProvider {
  exportData(options?: SemanticCompressionOptions): Promise<any>;
  exportThought(thoughtId: string, options?: SemanticCompressionOptions): Promise<any>;
  exportCluster(clusterId: string, options?: SemanticCompressionOptions): Promise<any>;
}

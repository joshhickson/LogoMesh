/**
 * @module CognitiveContextEngine
 * @description Planned for Phase 2+. Responsible for dynamically assembling and refining contextually relevant information from the knowledge graph.
 * Acts as a semantic lens and compression engine for LLM interactions.
 * (Enhanced stub for Phase 1 - preparing for semantic context generation)
 */
export interface ContextGenerationOptions {
    abstractionLevelFilter?: string[];
    localPriorityThreshold?: number;
    clusterIdFilter?: string[];
    maxDepth?: number;
    includeRelatedContext?: boolean;
    compressionLevel?: 'none' | 'basic' | 'semantic' | 'aggressive';
}
export interface GeneratedContext {
    thoughtId: string;
    query: string;
    contextSummary: string;
    relatedThoughts: string[];
    semanticClusters: string[];
    compressionApplied: string;
    relevanceScore: number;
    timestamp: string;
}
export declare class CognitiveContextEngine {
    private ideaManager?;
    private meshGraphEngine?;
    private vtc?;
    constructor(ideaManager?: any, meshGraphEngine?: any, vtc?: any);
    /**
     * Primary method for generating contextually relevant information for LLM interactions
     * This method will leverage ThoughtExportProvider and potentially VTC in future phases
     */
    generateContextForLLM(thoughtId: string, query: string, options?: ContextGenerationOptions): Promise<GeneratedContext>;
    /**
     * Retrieves related context for a given thought or segment
     * Will use MeshGraphEngine traversal in future phases
     */
    getRelatedContext(thoughtId: string, options?: ContextGenerationOptions): Promise<any>;
    /**
     * Applies semantic compression to context data
     * Will integrate with VTC in future phases for advanced compression
     */
    compressContext(contextData: any, compressionLevel?: 'none' | 'basic' | 'semantic' | 'aggressive'): Promise<any>;
    /**
     * Evaluates context relevance for a given query
     * Stub for future semantic relevance scoring
     */
    evaluateContextRelevance(context: any, query: string): Promise<number>;
    /**
     * Clusters context data by semantic similarity
     * Placeholder for VTC-powered clustering in future phases
     */
    clusterContextBySemantic(contexts: any[], options?: ContextGenerationOptions): Promise<Record<string, any[]>>;
}
//# sourceMappingURL=cognitiveContextEngine.d.ts.map
import { Thought } from '../../src/contracts/entities';
import { StorageAdapter } from '../../contracts/storageAdapter';
export declare class MeshGraphEngine {
    private storage;
    private weightThreshold;
    constructor(storage: StorageAdapter);
    getRelatedThoughts(thoughtId: string, maxResults?: number): Promise<Thought[]>;
    /**
     * Cluster thoughts by tag similarity
     * Enhanced stub implementation for CCE clustering support
     */
    clusterThoughtsByTag(thoughts: any[], options?: {
        minClusterSize?: number;
        semanticGrouping?: boolean;
    }): Promise<Record<string, any[]>>;
    /**
     * Traverse graph semantically from a starting thought
     * New method for CCE semantic context building
     */
    traverseSemanticGraph(startingThoughtId: string, options?: {
        maxDepth?: number;
        semanticThreshold?: number;
        includeBacklinks?: boolean;
        filterByAbstraction?: string[];
    }): Promise<any>;
    /**
     * Find semantic bridges between thoughts
     * New method for identifying conceptual connections
     */
    findSemanticBridges(thoughtId1: string, thoughtId2: string, options?: {
        maxHops?: number;
        bridgeStrengthThreshold?: number;
    }): Promise<any[]>;
    /**
     * Enhanced clustering with configurable algorithms
     */
    clusterThoughts(thoughts: any[], algorithm?: string): Promise<any[]>;
}
//# sourceMappingURL=meshGraphEngine.d.ts.map
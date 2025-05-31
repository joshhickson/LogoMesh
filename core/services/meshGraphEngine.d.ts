import { Thought } from '../../src/contracts/entities';
import { StorageAdapter } from '../../contracts/storageAdapter';
export declare class MeshGraphEngine {
    private storage;
    constructor(storage: StorageAdapter);
    getRelatedThoughts(thoughtId: string, maxResults?: number): Promise<Thought[]>;
    clusterThoughtsByTag(tag: string): Promise<Thought[]>;
    analyzeGraphMetrics(): Promise<any>;
}
//# sourceMappingURL=meshGraphEngine.d.ts.map
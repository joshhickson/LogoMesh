import { StorageAdapter, NewThoughtData, NewSegmentData } from '../../../contracts/storageAdapter';
import { Segment, Thought } from '../../../contracts/entities';
export declare class PostgresAdapter implements StorageAdapter {
    private pool;
    constructor();
    initialize(): Promise<void>;
    createThought(thoughtData: NewThoughtData, userId?: string): Promise<Thought>;
    getThoughtById(id: string, userId?: string): Promise<Thought | null>;
    getAllThoughts(userId?: string): Promise<Thought[]>;
    updateThought(id: string, thoughtData: Partial<NewThoughtData>, userId?: string): Promise<Thought | null>;
    deleteThought(id: string, userId?: string): Promise<boolean>;
    getSegmentsForThought(thoughtId: string, userId?: string): Promise<Segment[]>;
    getSegmentById(segmentId: string, userId?: string): Promise<Segment | null>;
    createSegment(thoughtId: string, segmentData: NewSegmentData, userId?: string): Promise<Segment>;
    getSegmentsByThoughtId(thoughtId: string, userId?: string): Promise<any[]>;
    updateSegment(thoughtId: string, segmentId: string, updates: Partial<NewSegmentData>, userId?: string): Promise<Segment | null>;
    deleteSegment(thoughtId: string, segmentId: string, userId?: string): Promise<boolean>;
    savePluginData(pluginName: string, data: any): Promise<void>;
    getPluginData(pluginName: string): Promise<any>;
    close(): Promise<void>;
}
//# sourceMappingURL=postgresAdapter.d.ts.map
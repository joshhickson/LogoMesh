import { StorageAdapter, NewThoughtData, NewSegmentData } from '../../../contracts/storageAdapter';
import { Segment } from '../../../contracts/entities';
export declare class PostgresAdapter implements StorageAdapter {
    private pool;
    constructor();
    initialize(): Promise<void>;
    createThought(thoughtData: NewThoughtData, userId?: string): Promise<any>;
    getThoughtById(id: string, userId?: string): Promise<any>;
    getAllThoughts(userId?: string): Promise<any[]>;
    updateThought(id: string, thoughtData: Partial<NewThoughtData>): Promise<any>;
    deleteThought(id: string): Promise<boolean>;
    getSegmentsForThought(thoughtId: string): Promise<Segment[]>;
    getSegmentById(segmentId: string): Promise<Segment | null>;
    createSegment(thoughtId: string, segmentData: NewSegmentData): Promise<any>;
    getSegmentsByThoughtId(thoughtId: string): Promise<any[]>;
    updateSegment(thoughtId: string, segmentId: string, updates: Partial<NewSegmentData>): Promise<any>;
    deleteSegment(segmentId: string): Promise<boolean>;
    savePluginData(pluginName: string, data: any): Promise<void>;
    getPluginData(pluginName: string): Promise<any>;
    close(): Promise<void>;
}
//# sourceMappingURL=postgresAdapter.d.ts.map
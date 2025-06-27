import { StorageAdapter, NewThoughtData, NewSegmentData } from 'contracts/storageAdapter';
import { Thought, Segment } from 'contracts/entities';
/**
 * SQLite implementation of the StorageAdapter interface
 * Handles all database operations with proper DTO <-> DB mapping
 */
export declare class SQLiteStorageAdapter implements StorageAdapter {
    private dbPath;
    private db;
    constructor(dbPath: string);
    initialize(): Promise<void>;
    close(): Promise<void>;
    getAllThoughts(userId?: string): Promise<Thought[]>;
    getThoughtById(thoughtId: string, userId?: string): Promise<Thought | null>;
    createThought(thoughtData: NewThoughtData, userId?: string): Promise<Thought>;
    updateThought(thoughtId: string, updates: Partial<NewThoughtData>, userId?: string): Promise<Thought | null>;
    deleteThought(thoughtId: string, userId?: string): Promise<boolean>;
    getSegmentsForThought(thoughtId: string, userId?: string): Promise<Segment[]>;
    getSegmentById(segmentId: string, userId?: string): Promise<Segment | null>;
    createSegment(thoughtId: string, segmentData: NewSegmentData, userId?: string): Promise<Segment>;
    updateSegment(thoughtId: string, segmentId: string, updates: Partial<NewSegmentData>, userId?: string): Promise<Segment | null>;
    deleteSegment(thoughtId: string, segmentId: string, userId?: string): Promise<boolean>;
    private parseTagsFromRow;
    private associateTagsWithThought;
    private updateThoughtTags;
}
//# sourceMappingURL=sqliteAdapter.d.ts.map
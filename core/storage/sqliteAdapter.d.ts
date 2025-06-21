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
    getAllThoughts(): Promise<Thought[]>;
    getThoughtById(thoughtId: string): Promise<Thought | null>;
    createThought(thoughtData: NewThoughtData): Promise<Thought>;
    updateThought(thoughtId: string, updates: Partial<NewThoughtData>): Promise<Thought | null>;
    deleteThought(thoughtId: string): Promise<boolean>;
    getSegmentsForThought(thoughtId: string): Promise<Segment[]>;
    getSegmentById(segmentId: string): Promise<Segment | null>;
    createSegment(thoughtId: string, segmentData: NewSegmentData): Promise<Segment>;
    updateSegment(segmentId: string, updates: Partial<NewSegmentData>): Promise<Segment | null>;
    deleteSegment(segmentId: string): Promise<boolean>;
    private parseTagsFromRow;
    private associateTagsWithThought;
    private updateThoughtTags;
}
//# sourceMappingURL=sqliteAdapter.d.ts.map
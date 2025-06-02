import { Thought, Segment } from './entities';
/**
 * Input type for creating a new thought (excludes generated fields)
 */
export interface NewThoughtData {
    title: string;
    description?: string;
    tags?: Array<{
        name: string;
        color: string;
    }>;
    position?: {
        x: number;
        y: number;
    };
    color?: string;
}
/**
 * Input type for creating a new segment (excludes generated fields)
 */
export interface NewSegmentData {
    title: string;
    content: string;
    content_type?: string;
    asset_path?: string;
    fields?: Record<string, any>;
    abstraction_level?: string;
    local_priority?: number;
    cluster_id?: string;
}
/**
 * Storage adapter interface for persistent data operations
 * Provides async CRUD methods for Thoughts and Segments
 */
export interface StorageAdapter {
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
    initialize(): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=storageAdapter.d.ts.map
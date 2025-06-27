import { Thought, Segment } from './entities';
/**
 * Input type for creating a new thought (excludes generated fields)
 */
export interface NewThoughtData {
    id?: string;
    title: string;
    content?: string;
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
    fields?: Record<string, any>;
    metadata?: Record<string, any>;
}
/**
 * Input type for creating a new segment (excludes generated fields)
 */
export interface NewSegmentData {
    id?: string;
    title?: string;
    content: string;
    content_type?: string;
    asset_path?: string;
    fields?: Record<string, any>;
    abstraction_level?: string;
    local_priority?: number;
    cluster_id?: string;
    thoughtId?: string;
    segmentType?: string;
    metadata?: Record<string, any>;
    positionX?: number;
    positionY?: number;
}
/**
 * Storage adapter interface for persistent data operations
 * Provides async CRUD methods for Thoughts and Segments
 */
export interface StorageAdapter {
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
    initialize(): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=storageAdapter.d.ts.map
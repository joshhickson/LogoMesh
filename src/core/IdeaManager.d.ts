import { Thought, Segment } from '@contracts/entities';
import { StorageAdapter } from '../../contracts/storageAdapter';
/**
 * Manages thought data and operations, providing a centralized interface
 * for data manipulation while abstracting storage details via StorageAdapter.
 */
export declare class IdeaManager {
    private storage;
    constructor(storage: StorageAdapter);
    /**
     * Returns all thoughts from storage
     */
    getThoughts(): Promise<Thought[]>;
    /**
     * Returns a specific thought by ID from storage
     */
    getThoughtById(id: string): Promise<Thought | undefined>;
    /**
     * Creates a new thought using the storage adapter
     */
    addThought(thoughtData: Omit<Thought, 'thought_bubble_id' | 'created_at' | 'updated_at'>): Promise<Thought>;
    /**
     * Updates an existing thought using the storage adapter
     */
    updateThought(thoughtId: string, updates: Partial<Omit<Thought, 'thought_bubble_id' | 'created_at'>>): Promise<Thought | undefined>;
    /**
     * Deletes a thought using the storage adapter
     */
    deleteThought(thoughtId: string): Promise<boolean>;
    /**
     * Creates a new segment for a thought using the storage adapter
     */
    addSegment(thoughtId: string, segmentData: Omit<Segment, 'segment_id' | 'thought_bubble_id' | 'created_at' | 'updated_at'>): Promise<Segment | undefined>;
    /**
     * Updates an existing segment using the storage adapter
     */
    updateSegment(thoughtId: string, segmentId: string, updates: Partial<Omit<Segment, 'segment_id' | 'thought_bubble_id' | 'created_at'>>): Promise<Segment | undefined>;
    /**
     * Deletes a segment using the storage adapter
     */
    deleteSegment(thoughtId: string, segmentId: string): Promise<boolean>;
    /**
     * Legacy compatibility methods - these maintain the original interface
     * but now delegate to the async storage methods
     */
    /**
     * @deprecated Use addThought instead
     */
    upsertThought(thought: Thought): void;
    /**
     * @deprecated Use deleteThought instead
     */
    removeThought(id: string): void;
}
//# sourceMappingURL=IdeaManager.d.ts.map
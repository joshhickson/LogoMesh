import { StorageAdapter, NewThoughtData, NewSegmentData } from '../contracts/storageAdapter';
import { Thought, Segment } from '../contracts/entities';
export declare class IdeaManager {
    private storageAdapter;
    constructor(storageAdapter?: StorageAdapter);
    getThoughtById(id: string, userId: string): Promise<Thought | null>;
    createThought(thoughtData: any): Promise<Thought>;
    getThoughts(userId?: string): Promise<Thought[]>;
    addThought(userId: string, thoughtData: any): Promise<Thought>;
    updateThought(userId: string, id: string, updates: Partial<NewThoughtData>): Promise<Thought | null>;
    deleteThought(userId: string, id: string): Promise<boolean>;
    addSegment(userId: string, thoughtId: string, segmentData: any): Promise<Segment | null>;
    updateSegment(thoughtId: string, segmentId: string, updates: Partial<NewSegmentData>): Promise<Segment | null>;
    deleteSegment(thoughtId: string, segmentId: string): Promise<boolean>;
}
//# sourceMappingURL=IdeaManager.d.ts.map
import { StorageAdapter, NewThoughtData, NewSegmentData } from '../contracts/storageAdapter';
import { Thought, Segment } from '../contracts/entities';
export declare class IdeaManager {
    private storageAdapter;
    constructor(storageAdapter: StorageAdapter);
    getThoughtById(id: string): Promise<Thought | null>;
    createThought(thoughtData: any): Promise<Thought>;
    getThoughts(): Promise<Thought[]>;
    addThought(thoughtData: any): Promise<Thought>;
    updateThought(id: string, updates: Partial<NewThoughtData>): Promise<Thought | null>;
    deleteThought(id: string): Promise<boolean>;
    addSegment(thoughtId: string, segmentData: any): Promise<Segment | null>;
    updateSegment(thoughtId: string, segmentId: string, updates: Partial<NewSegmentData>): Promise<Segment | null>;
    deleteSegment(thoughtId: string, segmentId: string): Promise<boolean>;
}
//# sourceMappingURL=IdeaManager.d.ts.map
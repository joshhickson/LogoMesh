
import { NewThoughtData } from "@contracts/storageAdapter";
import { Thought } from "@contracts/entities";

// Mock API service for tests
export const apiService = {
  getThoughts: () => Promise.resolve([] as Thought[]),
  createThought: (thought: NewThoughtData) => Promise.resolve({ id: '1', ...thought } as Thought),
  updateThought: (id: string, updates: Partial<NewThoughtData>) => Promise.resolve({ id, ...updates } as Thought),
  deleteThought: () => Promise.resolve({ success: true }),
  getGraph: () => Promise.resolve({ nodes: [], edges: [] })
};

export default apiService;

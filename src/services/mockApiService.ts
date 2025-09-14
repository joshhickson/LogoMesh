import { Thought, Segment } from '@contracts/entities';
import { NewThoughtData, NewSegmentData } from '@contracts/storageAdapter';
import { User } from './authService';

let thoughts: Thought[] = [
  {
    id: 'thought_1',
    title: 'Welcome to LogoMesh',
    description: 'This is a mock thought for development.',
    tags: [{name: 'welcome', color: 'blue'}],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    segments: [],
  }
];

export const mockApiService = {
  async fetchThoughts(): Promise<Thought[]> {
    return Promise.resolve(thoughts);
  },

  async getThoughtById(thoughtId: string): Promise<Thought | null> {
    const thought = thoughts.find(t => t.id === thoughtId);
    return Promise.resolve(thought || null);
  },

  async createThoughtApi(thoughtData: NewThoughtData): Promise<Thought> {
    const newThought: Thought = {
      id: `thought_${Date.now()}`,
      ...thoughtData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      segments: [],
    };
    thoughts.push(newThought);
    return Promise.resolve(newThought);
  },

  async updateThoughtApi(thoughtId: string, thoughtData: Partial<NewThoughtData>): Promise<Thought | null> {
    const index = thoughts.findIndex(t => t.id === thoughtId);
    if (index !== -1) {
      thoughts[index] = { ...thoughts[index], ...thoughtData, updated_at: new Date().toISOString() };
      return Promise.resolve(thoughts[index]);
    }
    return Promise.resolve(null);
  },

  async deleteThoughtApi(thoughtId: string): Promise<void> {
    const index = thoughts.findIndex(t => t.id === thoughtId);
    if (index !== -1) {
      thoughts.splice(index, 1);
    }
    return Promise.resolve();
  },

  async createSegmentApi(thoughtId: string, segmentData: NewSegmentData): Promise<Segment> {
    const newSegment: Segment = {
      segment_id: `segment_${Date.now()}`,
      thought_bubble_id: thoughtId,
      ...segmentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const thought = thoughts.find(t => t.id === thoughtId);
    if (thought) {
      if (!thought.segments) {
        thought.segments = [];
      }
      thought.segments.push(newSegment);
    }
    return Promise.resolve(newSegment);
  },

  async updateSegmentApi(thoughtId: string, segmentId: string, segmentData: Partial<NewSegmentData>): Promise<Segment | null> {
    const thought = thoughts.find(t => t.id === thoughtId);
    if (thought && thought.segments) {
      const index = thought.segments.findIndex(s => s.segment_id === segmentId);
      if (index !== -1) {
        thought.segments[index] = { ...thought.segments[index], ...segmentData, updated_at: new Date().toISOString() };
        return Promise.resolve(thought.segments[index]);
      }
    }
    return Promise.resolve(null);
  },

  async deleteSegmentApi(thoughtId: string, segmentId: string): Promise<void> {
    const thought = thoughts.find(t => t.id === thoughtId);
    if (thought && thought.segments) {
      const index = thought.segments.findIndex(s => s.segment_id === segmentId);
      if (index !== -1) {
        thought.segments.splice(index, 1);
      }
    }
    return Promise.resolve();
  },

  async exportDataApi(): Promise<unknown> {
    return Promise.resolve({ thoughts });
  },

  async importDataApi(_file: File): Promise<unknown> {
    return Promise.resolve({ message: 'Import successful' });
  },

  async triggerBackupApi(): Promise<unknown> {
    return Promise.resolve({ message: 'Backup triggered' });
  },

  async getLLMStatus(): Promise<unknown> {
    return Promise.resolve({ status: 'ok' });
  },

  async callLLMApi(_prompt: string, _metadata?: Record<string, unknown>): Promise<unknown> {
    return Promise.resolve({ response: 'This is a mock LLM response.' });
  },

  async analyzeSegment(_segmentId: string, _analysisType = 'general'): Promise<unknown> {
    return Promise.resolve({ analysis: 'This is a mock analysis.' });
  },

  async getCurrentUser(): Promise<User> {
    return Promise.resolve({ id: 'user_1', email: 'dev@logomesh.com', name: 'Dev User', isAuthenticated: true, roles: 'developer' });
  },

  // Legacy method names for backward compatibility
  async updateThought(id: string, updates: Partial<NewThoughtData>): Promise<Thought | null> {
    return this.updateThoughtApi(id, updates);
  },

  async createThought(thoughtData: NewThoughtData): Promise<Thought> {
    return this.createThoughtApi(thoughtData);
  },

  async deleteThought(id: string): Promise<void> {
    return this.deleteThoughtApi(id);
  },

  baseURL: 'http://localhost:3001/api/v1/mock',
};

export default mockApiService;

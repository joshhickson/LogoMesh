
// Mock API service for tests
export const apiService = {
  getThoughts: () => Promise.resolve([]),
  createThought: (thought) => Promise.resolve({ id: '1', ...thought }),
  updateThought: (id, updates) => Promise.resolve({ id, ...updates }),
  deleteThought: () => Promise.resolve({ success: true }),
  getGraph: () => Promise.resolve({ nodes: [], edges: [] })
};

export default apiService;

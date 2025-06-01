
// Mock API service for development when backend is not available
const thoughts = [
  {
    id: 'thought_1',
    content: 'Welcome to LogoMesh',
    tags: ['welcome'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockApiService = {
  async getThoughts() {
    return { success: true, data: thoughts };
  },

  async createThought(thoughtData) {
    const newThought = {
      id: `thought_${Date.now()}`,
      ...thoughtData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    thoughts.push(newThought);
    return { success: true, data: newThought };
  },

  async updateThought(id, thoughtData) {
    const index = thoughts.findIndex(t => t.id === id);
    if (index !== -1) {
      thoughts[index] = { ...thoughts[index], ...thoughtData, updatedAt: new Date().toISOString() };
      return { success: true, data: thoughts[index] };
    }
    return { success: false, error: 'Thought not found' };
  },

  async deleteThought(id) {
    const index = thoughts.findIndex(t => t.id === id);
    if (index !== -1) {
      thoughts.splice(index, 1);
      return { success: true };
    }
    return { success: false, error: 'Thought not found' };
  }
};

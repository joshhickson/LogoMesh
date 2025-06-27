
// API Service for communicating with the backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Thoughts API
  async fetchThoughts() {
    try {
      return await this.makeRequest('/thoughts');
    } catch (error) {
      console.warn('Failed to fetch thoughts from backend, falling back to mock data');
      return [];
    }
  }

  async createThought(thoughtData) {
    try {
      return await this.makeRequest('/thoughts', {
        method: 'POST',
        body: JSON.stringify(thoughtData),
      });
    } catch (error) {
      console.warn('Failed to create thought via backend');
      throw error;
    }
  }

  async updateThought(id, updates) {
    try {
      return await this.makeRequest(`/thoughts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.warn('Failed to update thought via backend');
      throw error;
    }
  }

  async deleteThought(id) {
    try {
      return await this.makeRequest(`/thoughts/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Failed to delete thought via backend');
      throw error;
    }
  }

  // User API
  async getCurrentUser() {
    try {
      return await this.makeRequest('/user/current');
    } catch (error) {
      console.warn('Failed to get current user from backend');
      return { isAuthenticated: false };
    }
  }

  // LLM API
  async getLLMStatus() {
    try {
      return await this.makeRequest('/llm/status');
    } catch (error) {
      console.warn('Failed to get LLM status');
      return { status: 'unavailable' };
    }
  }

  async callLLMApi(prompt, options = {}) {
    try {
      return await this.makeRequest('/llm/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt, ...options }),
      });
    } catch (error) {
      console.warn('Failed to call LLM API');
      throw error;
    }
  }

  // Additional methods that might be used by components
  async getThoughtById(id) {
    try {
      return await this.makeRequest(`/thoughts/${id}`);
    } catch (error) {
      console.warn('Failed to get thought by ID');
      throw error;
    }
  }

  async createSegmentApi(segmentData) {
    try {
      return await this.makeRequest('/segments', {
        method: 'POST',
        body: JSON.stringify(segmentData),
      });
    } catch (error) {
      console.warn('Failed to create segment');
      throw error;
    }
  }

  async updateSegmentApi(id, updates) {
    try {
      return await this.makeRequest(`/segments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.warn('Failed to update segment');
      throw error;
    }
  }

  async deleteSegmentApi(id) {
    try {
      return await this.makeRequest(`/segments/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Failed to delete segment');
      throw error;
    }
  }

  async exportDataApi() {
    try {
      return await this.makeRequest('/portability/export');
    } catch (error) {
      console.warn('Failed to export data');
      throw error;
    }
  }

  async importDataApi(data) {
    try {
      return await this.makeRequest('/portability/import', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Failed to import data');
      throw error;
    }
  }

  async triggerBackupApi() {
    try {
      return await this.makeRequest('/admin/backup', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Failed to trigger backup');
      throw error;
    }
  }

  async analyzeSegment(segmentData) {
    try {
      return await this.makeRequest('/llm/analyze', {
        method: 'POST',
        body: JSON.stringify(segmentData),
      });
    } catch (error) {
      console.warn('Failed to analyze segment');
      throw error;
    }
  }
}

// Create and export the service instance
export const apiService = new ApiService();
export default apiService;

import { Thought, Segment } from '../contracts/entities';
import { NewThoughtData, NewSegmentData } from '../../contracts/storageAdapter';

// Use a custom interface to avoid conflicts
interface ApiRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || (
  // In Replit, check if we're in development and use the same origin with port 3001
  window.location.hostname.includes('replit.dev') 
    ? `${window.location.protocol}//${window.location.hostname.replace('-00-', '-01-')}`
    : 'http://localhost:3001/api/v1'
);

console.log('[API Service] Using API base URL:', API_BASE_URL);

class ApiService {
  private async request<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: options?.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: options?.body,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed for', endpoint + ':', error);
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        url: `${API_BASE_URL}${endpoint}`,
        options
      });
      throw error;
    }
  }

  // Thought operations
  async fetchThoughts(): Promise<Thought[]> {
    return this.request<Thought[]>('/thoughts');
  }

  async createThoughtApi(data: NewThoughtData): Promise<Thought> {
    return this.request<Thought>('/thoughts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateThoughtApi(thoughtId: string, data: Partial<Thought>): Promise<Thought> {
    return this.request<Thought>(`/thoughts/${thoughtId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteThoughtApi(thoughtId: string): Promise<void> {
    return this.request<void>(`/thoughts/${thoughtId}`, {
      method: 'DELETE',
    });
  }

  async getThoughtById(thoughtId: string): Promise<Thought> {
    return this.request<Thought>(`/thoughts/${thoughtId}`);
  }

  // Segment operations
  async createSegmentApi(thoughtId: string, data: NewSegmentData): Promise<Segment> {
    return this.request<Segment>(`/thoughts/${thoughtId}/segments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSegmentApi(thoughtId: string, segmentId: string, data: Partial<Segment>): Promise<Segment> {
    return this.request<Segment>(`/thoughts/${thoughtId}/segments/${segmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSegmentApi(thoughtId: string, segmentId: string): Promise<void> {
    return this.request<void>(`/thoughts/${thoughtId}/segments/${segmentId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
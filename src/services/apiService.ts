
// API Service for LogoMesh Backend Communication
import { Thought, Segment } from '@contracts/entities';
import { NewThoughtData, NewSegmentData } from '@contracts/storageAdapter';
import { User } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

console.log('[API Service] Using API base URL:', API_BASE_URL);

if (process.env.NODE_ENV === 'development') {
  console.log('Development mode');
}

interface FetchOptions extends globalThis.RequestInit {
  timeout?: number;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: globalThis.RequestInit = {}
): Promise<T> {
  const config: globalThis.RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(API_BASE_URL + endpoint, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text() as T;
    }
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    let errorStack = undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.log('API request failed for', endpoint + ':', errorMessage);
    console.log('Full error details:', {
      message: errorMessage,
      stack: errorStack,
      originalError: error,
      url: API_BASE_URL + endpoint
    });
    throw error;
  }
}

// Thought API functions
export async function fetchThoughts() {
  return apiRequest<Thought[]>('/thoughts');
}

export async function getThoughtById(thoughtId: string) {
  return apiRequest<Thought | null>(`/thoughts/${thoughtId}`);
}

export async function createThoughtApi(thoughtData: NewThoughtData) {
  return apiRequest<Thought>('/thoughts', {
    method: 'POST',
    body: JSON.stringify(thoughtData),
  });
}

export async function updateThoughtApi(thoughtId: string, thoughtData: Partial<NewThoughtData>) {
  return apiRequest<Thought | null>(`/thoughts/${thoughtId}`, {
    method: 'PUT',
    body: JSON.stringify(thoughtData),
  });
}

export async function deleteThoughtApi(thoughtId: string) {
  return apiRequest<void>(`/thoughts/${thoughtId}`, {
    method: 'DELETE',
  });
}

// Segment API functions
export async function createSegmentApi(thoughtId: string, segmentData: NewSegmentData) {
  return apiRequest<Segment>(`/thoughts/${thoughtId}/segments`, {
    method: 'POST',
    body: JSON.stringify(segmentData),
  });
}

export async function updateSegmentApi(thoughtId: string, segmentId: string, segmentData: Partial<NewSegmentData>) {
  return apiRequest<Segment | null>(`/thoughts/${thoughtId}/segments/${segmentId}`, {
    method: 'PUT',
    body: JSON.stringify(segmentData),
  });
}

export async function deleteSegmentApi(thoughtId: string, segmentId: string) {
  return apiRequest<void>(`/thoughts/${thoughtId}/segments/${segmentId}`, {
    method: 'DELETE',
  });
}

// Import/Export API functions
export async function exportDataApi() {
  return apiRequest<unknown>('/export/json');
}

export async function importDataApi(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return fetch(`${API_BASE_URL}/import/json`, {
    method: 'POST',
    body: formData,
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json() as Promise<unknown>;
  });
}

// Admin API functions
export async function triggerBackupApi() {
  return apiRequest('/admin/backup', {
    method: 'POST',
  });
}

// LLM API functions
export async function getLLMStatus() {
  return apiRequest<unknown>('/llm/status');
}

export async function callLLMApi(prompt: string, metadata?: Record<string, unknown>) {
  return apiRequest<unknown>('/llm/prompt', {
    method: 'POST',
    body: JSON.stringify({ prompt, metadata }),
  });
}

export const analyzeSegment = async (segmentId: string, analysisType = 'general'): Promise<unknown> => {
  return apiRequest<unknown>('/llm/analyze-segment', {
    method: 'POST',
    body: JSON.stringify({ segmentId, analysisType }),
  });
};

// Legacy method names for backward compatibility
export async function updateThought(id: string, updates: Partial<NewThoughtData>) {
  return updateThoughtApi(id, updates);
}

export async function createThought(thoughtData: NewThoughtData) {
  return createThoughtApi(thoughtData);
}

export async function deleteThought(id: string) {
  return deleteThoughtApi(id);
}

export async function getCurrentUser() {
  try {
    return await apiRequest<User>('/user/current');
  } catch (error) {
    console.warn('Failed to get current user from backend');
    throw error;
  }
}

// Export the main apiService object with all functions
export const apiService = {
  fetchThoughts,
  getThoughtById,
  createThoughtApi,
  updateThoughtApi,
  deleteThoughtApi,
  createThought,
  updateThought,
  deleteThought,
  createSegmentApi,
  updateSegmentApi,
  deleteSegmentApi,
  exportDataApi,
  importDataApi,
  triggerBackupApi,
  getLLMStatus,
  callLLMApi,
  analyzeSegment,
  getCurrentUser,
  baseURL: API_BASE_URL,
};

export default apiService;

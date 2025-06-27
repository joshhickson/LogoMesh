<<<<<<< HEAD

import { Thought, Segment } from '../contracts/entities';
import { NewThoughtData, NewSegmentData } from '../../contracts/storageAdapter';

// Use the built-in RequestInit type from the DOM lib

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers as Record<string, string>),
        },
        ...options,
      });
=======
// API Service for LogoMesh Backend Communication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

console.log('[API Service] Using API base URL:', API_BASE_URL);
>>>>>>> 3403cf5b63841c313abceb57e49cc1a4a5949a68

if (process.env.NODE_ENV === 'development') {
  console.log('Development mode');
}

import { NewThoughtData, NewSegmentData } from '../../contracts/storageAdapter';

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
      originalError: error, // Log the original error object too
      url: API_BASE_URL + endpoint
    });
    // Re-throw the original error or a new standardized error
    // For now, re-throwing original to maintain current behavior pattern
    throw error;
  }
}

import { Thought, Segment } from '../../contracts/entities'; // Import Thought and Segment types

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
  // Delete typically returns status or nothing, ensure apiRequest handles non-JSON
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
  // Delete typically returns status or nothing
  return apiRequest<void>(`/thoughts/${thoughtId}/segments/${segmentId}`, {
    method: 'DELETE',
  });
}

// Import/Export API functions
export async function exportDataApi() {
  return apiRequest<any>('/export/json'); // Keeping any for now, as export structure is unknown
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
    return response.json();
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
  return apiRequest<any>('/llm/status'); // Return type unknown, keeping 'any'
}

export async function callLLMApi(prompt: string, metadata?: Record<string, any>) {
  return apiRequest<any>('/llm/prompt', { // Return type unknown, keeping 'any'
    method: 'POST',
    body: JSON.stringify({ prompt, metadata }),
  });
}

export const analyzeSegment = async (segmentId: string, analysisType = 'general'): Promise<any> => { // Return type unknown
  return apiRequest<any>('/llm/analyze-segment', { // Return type unknown, keeping 'any'
    method: 'POST',
    body: JSON.stringify({ segmentId, analysisType }),
  });
};

// Export the main apiService object with all functions
export const apiService = {
  fetchThoughts,
  getThoughtById,
  createThoughtApi,
  updateThoughtApi,
  deleteThoughtApi,
  createSegmentApi,
  updateSegmentApi,
  deleteSegmentApi,
  exportDataApi,
  importDataApi,
  triggerBackupApi,
  getLLMStatus,
  callLLMApi,
  analyzeSegment,
  baseURL: API_BASE_URL, // Export for testing
};
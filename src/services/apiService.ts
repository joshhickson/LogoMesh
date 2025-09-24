
import config from '@contracts/../core/config';
import { Thought, Segment } from '@contracts/entities';
import { NewThoughtData, NewSegmentData } from '@contracts/storageAdapter';
import { User } from './authService';

const API_BASE_URL = config.frontend.apiUrl;

console.log('[API Service] Using API base URL:', API_BASE_URL);

if (config.nodeEnv === 'development') {
  console.log('Development mode');
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const reqConfig: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(API_BASE_URL + endpoint, reqConfig);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    } else {
      return response.text() as unknown as T;
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.log('API request failed for', endpoint + ':', err.message);
    console.log('Full error details:', {
      message: err.message,
      stack: err.stack,
      originalError: error,
      url: API_BASE_URL + endpoint
    });
    throw error;
  }
}

export async function fetchThoughts(): Promise<Thought[]> {
  return apiRequest<Thought[]>('/thoughts');
}

export async function getThoughtById(thoughtId: string): Promise<Thought | null> {
  return apiRequest<Thought | null>(`/thoughts/${thoughtId}`);
}

export async function createThoughtApi(thoughtData: NewThoughtData): Promise<Thought> {
  return apiRequest<Thought>('/thoughts', {
    method: 'POST',
    body: JSON.stringify(thoughtData),
  });
}

export async function updateThoughtApi(thoughtId: string, thoughtData: Partial<NewThoughtData>): Promise<Thought | null> {
  return apiRequest<Thought | null>(`/thoughts/${thoughtId}`, {
    method: 'PUT',
    body: JSON.stringify(thoughtData),
  });
}

export async function deleteThoughtApi(thoughtId: string): Promise<void> {
  return apiRequest<void>(`/thoughts/${thoughtId}`, {
    method: 'DELETE',
  });
}

export async function createSegmentApi(thoughtId: string, segmentData: NewSegmentData): Promise<Segment> {
  return apiRequest<Segment>(`/thoughts/${thoughtId}/segments`, {
    method: 'POST',
    body: JSON.stringify(segmentData),
  });
}

export async function updateSegmentApi(thoughtId: string, segmentId: string, segmentData: Partial<NewSegmentData>): Promise<Segment | null> {
  return apiRequest<Segment | null>(`/thoughts/${thoughtId}/segments/${segmentId}`, {
    method: 'PUT',
    body: JSON.stringify(segmentData),
  });
}

export async function deleteSegmentApi(thoughtId: string, segmentId: string): Promise<void> {
  return apiRequest<void>(`/thoughts/${thoughtId}/segments/${segmentId}`, {
    method: 'DELETE',
  });
}

export async function exportDataApi(): Promise<unknown> {
  return apiRequest<unknown>('/export/json');
}

export async function importDataApi(file: File): Promise<unknown> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/import/json`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

export async function triggerBackupApi(): Promise<unknown> {
  return apiRequest('/admin/backup', {
    method: 'POST',
  });
}

export async function getLLMStatus(): Promise<unknown> {
  return apiRequest<unknown>('/llm/status');
}

export async function callLLMApi(prompt: string, metadata?: Record<string, unknown>): Promise<unknown> {
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

export async function updateThought(id: string, updates: Partial<NewThoughtData>): Promise<Thought | null> {
  return updateThoughtApi(id, updates);
}

export async function createThought(thoughtData: NewThoughtData): Promise<Thought> {
  return createThoughtApi(thoughtData);
}

export async function deleteThought(id: string): Promise<void> {
  return deleteThoughtApi(id);
}

export async function getCurrentUser(): Promise<User | null> {
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

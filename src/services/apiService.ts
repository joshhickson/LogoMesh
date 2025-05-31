Fixing TypeScript issues, default exports, and named exports in apiService.ts.
```

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

console.log('[API Service] Using API base URL:', API_BASE_URL);

// Type definitions for API requests
interface NewThoughtData {
  title: string;
  description?: string;
  tags?: string[];
  position?: { x: number; y: number };
}

interface NewSegmentData {
  title: string;
  content: string;
  fields?: Record<string, any>;
}

interface UpdateThoughtData {
  title?: string;
  description?: string;
  tags?: string[];
  position?: { x: number; y: number };
}

interface UpdateSegmentData {
  title?: string;
  content?: string;
  fields?: Record<string, any>;
}

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('API request failed for', endpoint, error);
    console.error('Full error details:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      url: url
    });
    throw error;
  }
}

// Thoughts API
export async function fetchThoughts() {
  return apiRequest('/thoughts');
}

export async function createThoughtApi(data: NewThoughtData) {
  return apiRequest('/thoughts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getThoughtById(thoughtId: string) {
  return apiRequest(`/thoughts/${thoughtId}`);
}

export async function updateThoughtApi(thoughtId: string, updates: UpdateThoughtData) {
  return apiRequest(`/thoughts/${thoughtId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteThoughtApi(thoughtId: string) {
  return apiRequest(`/thoughts/${thoughtId}`, {
    method: 'DELETE',
  });
}

// Segments API
export async function createSegmentApi(thoughtId: string, data: NewSegmentData) {
  return apiRequest(`/thoughts/${thoughtId}/segments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSegmentApi(thoughtId: string, segmentId: string, updates: UpdateSegmentData) {
  return apiRequest(`/thoughts/${thoughtId}/segments/${segmentId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteSegmentApi(thoughtId: string, segmentId: string) {
  return apiRequest(`/thoughts/${thoughtId}/segments/${segmentId}`, {
    method: 'DELETE',
  });
}

// LLM API
export const callLLMApi = async (prompt: string, metadata?: Record<string, any>): Promise<any> => {
  return apiRequest('/llm/prompt', {
    method: 'POST',
    body: JSON.stringify({ prompt, metadata }),
  });
}

// Admin API
export async function triggerBackupApi() {
  return apiRequest('/admin/backup', {
    method: 'POST',
  });
}

// Export/Import API
export async function exportDataApi() {
  const response = await fetch(`${API_BASE_URL}/export/json`);
  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`);
  }
  return await response.blob();
}

export const importDataApi = async (jsonData: Record<string, any>): Promise<void> => {
  const formData = new FormData();
  formData.append('file', jsonData as unknown as File);

  const response = await fetch(`${API_BASE_URL}/import/json`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Import failed: ${errorText}`);
  }

  return await response.json();
}

// LLM Status API
export async function getLLMStatus() {
  return apiRequest('/llm/status');
}

export const analyzeSegment = async (segmentId: string, analysisType = 'general'): Promise<any> => {
  return apiRequest('/llm/analyze-segment', {
    method: 'POST',
    body: JSON.stringify({ segmentId, analysisType }),
  });
}

// Create apiService object
const apiService = {
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
  analyzeSegment
};

// Export individual functions and the main apiService object
export {
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
  apiService
};

// Default export
export default apiService;
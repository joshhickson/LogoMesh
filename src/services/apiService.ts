
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
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
  } catch (error) {
    console.error('API request failed for', endpoint, error);
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
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
export async function callLLMApi(prompt: string, metadata?: Record<string, any>) {
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

export async function importDataApi(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
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

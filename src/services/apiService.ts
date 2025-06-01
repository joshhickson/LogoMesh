// API Service for LogoMesh Backend Communication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

console.log('[API Service] Using API base URL:', API_BASE_URL);

if (process.env.NODE_ENV === 'development') {
  console.log('Development mode');
}

// Generic API request function
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error: any) {
    console.log('API request failed for', endpoint + ':', error);
    console.log('Full error details:', {
      message: error.message,
      stack: error.stack,
      url: url
    });
    throw error;
  }
}

// Thought API functions
export async function fetchThoughts() {
  return apiRequest('/thoughts');
}

export async function getThoughtById(thoughtId: string) {
  return apiRequest(`/thoughts/${thoughtId}`);
}

export async function createThoughtApi(thoughtData: any) {
  return apiRequest('/thoughts', {
    method: 'POST',
    body: JSON.stringify(thoughtData),
  });
}

export async function updateThoughtApi(thoughtId: string, thoughtData: any) {
  return apiRequest(`/thoughts/${thoughtId}`, {
    method: 'PUT',
    body: JSON.stringify(thoughtData),
  });
}

export async function deleteThoughtApi(thoughtId: string) {
  return apiRequest(`/thoughts/${thoughtId}`, {
    method: 'DELETE',
  });
}

// Segment API functions
export async function createSegmentApi(thoughtId: string, segmentData: any) {
  return apiRequest(`/thoughts/${thoughtId}/segments`, {
    method: 'POST',
    body: JSON.stringify(segmentData),
  });
}

export async function updateSegmentApi(thoughtId: string, segmentId: string, segmentData: any) {
  return apiRequest(`/thoughts/${thoughtId}/segments/${segmentId}`, {
    method: 'PUT',
    body: JSON.stringify(segmentData),
  });
}

export async function deleteSegmentApi(thoughtId: string, segmentId: string) {
  return apiRequest(`/thoughts/${thoughtId}/segments/${segmentId}`, {
    method: 'DELETE',
  });
}

// Import/Export API functions
export async function exportDataApi() {
  return apiRequest('/export/json');
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
  return apiRequest('/llm/status');
}

export async function callLLMApi(prompt: string, metadata?: Record<string, any>) {
  return apiRequest('/llm/prompt', {
    method: 'POST',
    body: JSON.stringify({ prompt, metadata }),
  });
}

export const analyzeSegment = async (segmentId: string, analysisType = 'general'): Promise<any> => {
  return apiRequest('/llm/analyze-segment', {
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
};
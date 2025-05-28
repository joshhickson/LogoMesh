import { Thought, Segment } from '../contracts/entities';
import { NewThoughtData, NewSegmentData } from '../contracts/storageAdapter';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// Helper function to handle common fetch logic
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // For 404, we might want to return undefined rather than throw,
    // but specific functions will handle that decision for now.
    const errorData = await response.text().catch(() => 'Could not parse error response');
    throw new Error(`API request failed with status ${response.status}: ${errorData || response.statusText}`);
  }
  if (response.status === 204) { // No Content
    return undefined as T; // Or handle appropriately if T cannot be undefined
  }
  // Check if response has content before trying to parse
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json() as Promise<T>;
  } else {
    return undefined as T; // Or handle non-JSON responses as needed
  }
}

// --- Thought Functions ---

export async function fetchThoughts(): Promise<Thought[]> {
  const response = await fetch(`${API_BASE_URL}/thoughts`);
  return handleResponse<Thought[]>(response);
}

export async function createThoughtApi(data: NewThoughtData): Promise<Thought> {
  const response = await fetch(`${API_BASE_URL}/thoughts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Thought>(response);
}

export async function fetchThoughtById(thoughtId: string): Promise<Thought | undefined> {
  const response = await fetch(`${API_BASE_URL}/thoughts/${thoughtId}`);
  if (response.status === 404) {
    return undefined;
  }
  return handleResponse<Thought>(response);
}

export async function updateThoughtApi(
  thoughtId: string,
  updates: Partial<Omit<Thought, 'thought_bubble_id' | 'created_at' | 'segments' | 'tags'>>
): Promise<Thought> {
  const response = await fetch(`${API_BASE_URL}/thoughts/${thoughtId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  return handleResponse<Thought>(response);
}

export async function deleteThoughtApi(thoughtId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/thoughts/${thoughtId}`, {
    method: 'DELETE',
  });
  // delete returns 204 No Content, which handleResponse will return as undefined.
  // Casting to Promise<void> is fine.
  await handleResponse<void>(response);
}

// --- Segment Functions ---

export async function createSegmentApi(
  thoughtId: string,
  data: Omit<NewSegmentData, 'segment_id' | 'thought_bubble_id'>
): Promise<Segment> {
  const response = await fetch(`${API_BASE_URL}/thoughts/${thoughtId}/segments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Segment>(response);
}

export async function updateSegmentApi(
  thoughtId: string,
  segmentId: string,
  updates: Partial<Omit<Segment, 'segment_id' | 'thought_bubble_id' | 'created_at'>>
): Promise<Segment> {
  const response = await fetch(`${API_BASE_URL}/thoughts/${thoughtId}/segments/${segmentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  return handleResponse<Segment>(response);
}

export async function deleteSegmentApi(thoughtId: string, segmentId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/thoughts/${thoughtId}/segments/${segmentId}`, {
    method: 'DELETE',
  });
  await handleResponse<void>(response);
}

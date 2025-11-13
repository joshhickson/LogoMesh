import { describe, it, expect, vi, beforeEach } from 'vitest';
import { A2AClient } from './a2aClient';
import { A2ATaskPayload, A2ASubmissionPayload } from '@logomesh/contracts';

// Mock the global fetch function
global.fetch = vi.fn();

describe('A2AClient', () => {
  const client = new A2AClient();
  const mockEndpoint = 'http://mock-purple-agent.com/a2a';
  const mockTask: A2ATaskPayload = {
    taskId: 'task-123',
    requirement: 'Test requirement',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send a task and receive a valid submission', async () => {
    const mockSubmission: A2ASubmissionPayload = {
      taskId: 'task-123',
      sourceCode: 'const a = 1;',
      rationale: 'A simple implementation.',
    };

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockSubmission,
    });

    const submission = await client.sendTask(mockEndpoint, mockTask);
    expect(submission).toEqual(mockSubmission);
    expect(fetch).toHaveBeenCalledWith(mockEndpoint, expect.any(Object));
  });

  it('should throw an error if the network request fails', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500 });
    await expect(client.sendTask(mockEndpoint, mockTask)).rejects.toThrow('A2A request failed with status: 500');
  });

  it('should throw an error if the submission has a mismatched task ID', async () => {
    const mismatchedSubmission: A2ASubmissionPayload = {
      taskId: 'task-456', // Mismatched ID
      sourceCode: 'const a = 1;',
      rationale: 'A simple implementation.',
    };

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mismatchedSubmission,
    });

    await expect(client.sendTask(mockEndpoint, mockTask)).rejects.toThrow('Received submission for the wrong task ID.');
  });
});

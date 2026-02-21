import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAiLlmClient } from './OpenAiLlmClient';

describe('OpenAiLlmClient', () => {
  const baseUrl = 'https://api.openai.com/v1';
  const apiKey = 'test-api-key';
  const modelName = 'gpt-4o';
  let client: OpenAiLlmClient;

  beforeEach(() => {
    client = new OpenAiLlmClient(baseUrl, apiKey, modelName);
    // Mock global fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully call the API and return content', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: 'Test response content',
          },
        },
      ],
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await client.prompt('System prompt', 'User prompt');

    expect(result).toBe('Test response content');
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/chat/completions`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: 'System prompt' },
            { role: 'user', content: 'User prompt' },
          ],
          temperature: 0.0,
        }),
      }),
    );
  });

  it('should throw an error if the API response is not ok', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });

    await expect(client.prompt('System', 'User')).rejects.toThrow(
      'LLM API request failed with status 500: Internal Server Error',
    );
  });

  it('should throw an error if the response content is missing', async () => {
    const mockResponse = {
      choices: [], // Empty choices
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await expect(client.prompt('System', 'User')).rejects.toThrow(
      'LLM API response missing content',
    );
  });
});

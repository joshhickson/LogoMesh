import { LlmClient } from '../analyzers';

export class OpenAiLlmClient implements LlmClient {
  private baseUrl: string;
  private apiKey: string;
  private modelName: string;

  constructor(baseUrl: string, apiKey: string, modelName: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
    this.apiKey = apiKey;
    this.modelName = modelName;
  }

  async prompt(systemMessage: string, userMessage: string): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const body = JSON.stringify({
      model: this.modelName,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.0, // Deterministic output for consistent analysis
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `LLM API request failed with status ${response.status}: ${errorText}`,
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('LLM API response missing content');
      }

      return content;
    } catch (error) {
      console.error('LlmClient prompt failed:', error);
      throw error;
    }
  }
}

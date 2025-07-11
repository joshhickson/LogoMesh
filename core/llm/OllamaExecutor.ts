import { LLMExecutor } from '../../contracts/llmExecutor';

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[]; // Optional context array
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class OllamaExecutor implements LLMExecutor {
  private baseUrl = 'http://localhost:11434';
  private modelName: string;

  constructor(modelName = 'ollama-mock') {
    this.modelName = modelName;
  }

  async executePrompt(prompt: string, metadata?: Record<string, unknown>): Promise<string> { // any -> unknown
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            ...metadata
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as OllamaGenerateResponse;
      return data.response || 'No response received';
    } catch (error) {
      console.warn(`[OllamaExecutor] Failed to connect to Ollama, using fallback: ${error instanceof Error ? error.message : String(error)}`);
      // Fallback to mock for development
      return `[MOCK - Ollama not available] Response for: ${prompt}`;
    }
  }

  async execute(prompt: string, options?: import('../../contracts/llmExecutor').LLMExecutionOptions): Promise<import('../../contracts/llmExecutor').LLMFullResponse> {
    const responseString = await this.executePrompt(prompt, options?.metadata);
    return {
      response: responseString,
      model: this.modelName,
      tokensUsed: responseString.length, // Mock token usage
    };
  }

  get supportsStreaming(): boolean {
    return false;
  }

  getModelName(): string {
    return this.modelName;
  }

  // Future VTC compatibility - ensure no hardcoded embedding assumptions
  async executeWithContext(
    prompt: string,
    context?: unknown[], // any[] -> unknown[]
    metadata?: Record<string, unknown> // any -> unknown
  ): Promise<string> {
    // This method is designed to accept context that could originate from VTC
    let contextPrefix = '';
    if (context && context.length > 0) {
      contextPrefix = `[Context: ${context.length} items] `; // .length is safe on unknown[]
    }

    return this.executePrompt(`${contextPrefix}${prompt}`, metadata);
  }
}
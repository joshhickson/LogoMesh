import { LLMExecutor } from '../../contracts/llmExecutor';

export class OllamaExecutor implements LLMExecutor {
  private baseUrl = 'http://localhost:11434';
  private modelName: string;

  constructor(modelName: string = 'ollama-mock') {
    this.modelName = modelName;
  }

  async executePrompt(prompt: string, metadata?: Record<string, any>): Promise<string> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Return mocked response
    return `Mocked response for: ${prompt}`;
  }

  get supportsStreaming(): boolean {
    return false;
  }

  getModelName(): string {
    return this.modelName;
  }

  // Future VTC compatibility - ensure no hardcoded embedding assumptions
  async executeWithContext(prompt: string, context?: any[], metadata?: Record<string, any>): Promise<string> {
    // This method is designed to accept context that could originate from VTC
    let contextPrefix = '';
    if (context && context.length > 0) {
      contextPrefix = `[Context: ${context.length} items] `;
    }

    return this.executePrompt(`${contextPrefix}${prompt}`, metadata);
  }
}
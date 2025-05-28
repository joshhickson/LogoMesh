
import { LLMExecutor } from '../contracts/llmExecutor';
import { logger } from '../utils/logger';

export class OllamaExecutor implements LLMExecutor {
  private modelName: string;

  constructor(modelName: string = 'llama2') {
    this.modelName = modelName;
  }

  async executePrompt(prompt: string): Promise<string> {
    // Mock response for Phase 1 - future implementation will call actual Ollama API
    const mockResponse = `Mocked response for: ${prompt}`;
    
    logger.log(`[OllamaExecutor] Mock execution for model: ${this.modelName}`);
    logger.log(`[OllamaExecutor] Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockResponse;
  }

  get supportsStreaming(): boolean {
    return false; // Will be true in future implementation
  }

  getModelInfo(): { name: string; version?: string } {
    return {
      name: this.modelName,
      version: 'mock-1.0'
    };
  }
}

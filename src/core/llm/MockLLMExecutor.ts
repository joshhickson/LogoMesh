import { LLMExecutor, LLMResponse, PromptMetadata } from '@contracts/llmExecutor';
import { logger } from '@core/utils/logger'; // Named import

export class MockLLMExecutor implements LLMExecutor {
  public readonly supportsStreaming: boolean = false;
  private modelName: string = 'mock-llm-general';

  constructor() {
    logger.info(`[MockLLMExecutor] Initialized MockLLMExecutor. Model: ${this.modelName}`);
  }

  async executePrompt(prompt: string, metadata?: PromptMetadata): Promise<LLMResponse> {
    logger.info(`[MockLLMExecutor] Executing prompt (mocked for ${this.modelName}): "${prompt.substring(0, 100)}..."`);
    const requestTimestamp = new Date();
    
    // Simulate some network delay or processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 20)); // Random delay 20-70ms
    
    const responseTimestamp = new Date();
    const latencyMs = responseTimestamp.getTime() - requestTimestamp.getTime();

    const responseText = `Mocked response from MockLLMExecutor for prompt: "${prompt}". Model: ${this.modelName}.`;
    
    const estimatedPromptTokens = Math.ceil(prompt.length / 4);
    const estimatedCompletionTokens = Math.ceil(responseText.length / 4);
    const estimatedTotalTokens = estimatedPromptTokens + estimatedCompletionTokens;

    const response: LLMResponse = {
      responseText,
      model: this.modelName,
      status: 'success',
      requestTimestamp,
      responseTimestamp,
      latencyMs,
      cost: 0, // Mocked
      promptTokens: estimatedPromptTokens,
      completionTokens: estimatedCompletionTokens,
      totalTokens: estimatedTotalTokens,
      metadata: {
        ...metadata,
        engine: 'MockLLMExecutor',
        replyId: crypto.randomUUID(),
      }
    };

    logger.debug(`[MockLLMExecutor] Mocked response generated for model ${this.modelName}:`, response);
    return response;
  }

  getModelName(): string {
    return this.modelName;
  }

  // Example of another method if the interface had it
  // async generateEmbeddings(text: string, metadata?: PromptMetadata): Promise<any> { // Replace 'any' with actual EmbeddingResponse type
  //   logger.warn('[MockLLMExecutor] generateEmbeddings is not implemented for this mock executor.');
  //   throw new Error('generateEmbeddings not implemented in MockLLMExecutor.');
  // }
}

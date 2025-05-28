import { LLMExecutor, LLMResponse, PromptMetadata } from '@contracts/llmExecutor';
import { logger } from '@core/utils/logger'; // Named import

export class OllamaExecutor implements LLMExecutor {
  public readonly supportsStreaming: boolean = false;
  private modelName: string = 'ollama-mock'; // As specified in the example

  constructor() {
    logger.info(`[OllamaExecutor] Initialized OllamaExecutor (mock implementation). Model: ${this.modelName}`);
  }

  async executePrompt(prompt: string, metadata?: PromptMetadata): Promise<LLMResponse> {
    logger.info(`[OllamaExecutor] Executing prompt (mocked for ${this.modelName}): "${prompt.substring(0, 100)}..."`);
    const requestTimestamp = new Date();
    
    // Simulate some network delay or processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50)); // Random delay 50-150ms
    
    const responseTimestamp = new Date();
    const latencyMs = responseTimestamp.getTime() - requestTimestamp.getTime();

    // Mocked response generation
    const responseText = `Mocked Ollama response for prompt: "${prompt}". Model: ${this.modelName}.`;
    
    // Rough estimation for token counts (very approximate)
    const estimatedPromptTokens = Math.ceil(prompt.length / 4);
    const estimatedCompletionTokens = Math.ceil(responseText.length / 4);
    const estimatedTotalTokens = estimatedPromptTokens + estimatedCompletionTokens;

    const response: LLMResponse = {
      responseText,
      model: this.modelName,
      status: 'success', // Can be 'error' or other statuses based on real scenarios
      requestTimestamp,
      responseTimestamp,
      latencyMs,
      cost: 0, // Mocked, as Ollama is typically self-hosted
      promptTokens: estimatedPromptTokens,
      completionTokens: estimatedCompletionTokens,
      totalTokens: estimatedTotalTokens,
      metadata: {
        ...metadata, // Preserve incoming metadata
        engine: 'OllamaExecutorMock', // Specific metadata from this executor
        replyId: crypto.randomUUID(), // Example of additional metadata
      }
    };

    logger.debug(`[OllamaExecutor] Mocked response generated for model ${this.modelName}:`, response);
    return response;
  }

  // Optional: if your interface requires a getModelName method
  // This can be useful for logging or selection if the executor handles multiple models.
  getModelName(): string {
    return this.modelName;
  }

  // If the LLMExecutor interface requires other methods, they should be stubbed here.
  // For example, if `generateEmbeddings` is part of the interface:
  // async generateEmbeddings(text: string, metadata?: PromptMetadata): Promise<EmbeddingResponse> {
  //   logger.warn('[OllamaExecutor] generateEmbeddings is not implemented for this mock executor.');
  //   throw new Error('generateEmbeddings not implemented in OllamaExecutor mock.');
  // }
}

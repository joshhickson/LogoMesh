
import { LLMExecutor } from '../contracts/llmExecutor';
import { logLLMInteraction } from '../logger/llmAuditLogger';
import { logger } from '../utils/logger';

export class LLMTaskRunner {
  constructor(private executor: LLMExecutor) {}

  async run(prompt: string, metadata?: Record<string, any>): Promise<string> {
    try {
      logger.log(`[LLMTaskRunner] Executing prompt with ${this.executor.getModelInfo().name}`);
      
      const startTime = Date.now();
      const response = await this.executor.executePrompt(prompt);
      const duration = Date.now() - startTime;

      // Log the interaction
      logLLMInteraction(
        prompt,
        response,
        this.executor.getModelInfo().name,
        duration,
        metadata
      );

      return response;
    } catch (error) {
      logger.error(`[LLMTaskRunner] Error executing prompt: ${error}`);
      throw error;
    }
  }

  async runPromptWithStreaming?(prompt: string, metadata?: Record<string, any>): Promise<AsyncIterable<string>> {
    // Stub for future streaming implementation
    throw new Error('Streaming not yet implemented');
  }
}

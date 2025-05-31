import { LLMExecutor } from '../../contracts/llmExecutor';
import { logLLMInteraction } from '../../src/core/logger/llmAuditLogger';

export class LLMTaskRunner {
  private executor: LLMExecutor;
  private totalRequests: number = 0;
  private lastHealthCheck?: Date;

  constructor(executor: LLMExecutor) {
    this.executor = executor;
  }

  async run(prompt: string, metadata?: Record<string, any>): Promise<string> {
    const startTime = Date.now();

    try {
      // Execute the prompt
      const response = await this.executor.executePrompt(prompt, metadata);

      // Log the interaction
      await logLLMInteraction({
        prompt,
        response,
        model: this.executor.getModelName(),
        metadata,
        duration: Date.now() - startTime,
        success: true
      });

      return response;
    } catch (error) {
      // Log the failed interaction
      await logLLMInteraction({
        prompt,
        response: null,
        model: this.executor.getModelName(),
        metadata,
        duration: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });

      throw error;
    }
  }

  // Stub for future streaming support
  async runPromptWithStreaming?(
    prompt: string, 
    onChunk: (chunk: string) => void, 
    metadata?: Record<string, any>
  ): Promise<string> {
    // For now, just call the regular run method and simulate streaming
    const response = await this.run(prompt, metadata);

    // Simulate streaming by sending chunks
    const chunks = response.split(' ');
    let fullResponse = '';

    for (const chunk of chunks) {
      onChunk(chunk + ' ');
      fullResponse += chunk + ' ';
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate delay
    }

    return fullResponse.trim();
  }
  async executePrompt(prompt: string, metadata?: Record<string, any>): Promise<LLMResponse> {
    try {
      this.totalRequests++;
      logger.info('[LLMTaskRunner] Executing prompt', { 
        promptLength: prompt.length, 
        metadata,
        totalRequests: this.totalRequests
      });

      const startTime = Date.now();
      const response = await this.executor.execute(prompt, { metadata });
      const executionTime = Date.now() - startTime;

      const result: LLMResponse = {
        response: response.response,
        model: response.model || 'unknown',
        executionTimeMs: executionTime,
        tokensUsed: response.tokensUsed
      };

      logger.info('[LLMTaskRunner] Prompt executed successfully', { 
        executionTimeMs: executionTime,
        responseLength: result.response.length,
        totalRequests: this.totalRequests
      });

      return result;
    } catch (error) {
      logger.error('[LLMTaskRunner] Error executing prompt:', error);
      throw new Error(`LLM execution failed: ${error.message}`);
    }
  }

  async getStatus(): Promise<{
    isConnected: boolean;
    currentModel: string;
    lastHealthCheck?: Date;
    totalRequests: number;
  }> {
    try {
      // Simple health check - try to execute a minimal prompt
      const healthCheckPrompt = "Reply with 'OK'";
      const startTime = Date.now();

      const response = await this.executor.execute(healthCheckPrompt, {});
      const executionTime = Date.now() - startTime;

      this.lastHealthCheck = new Date();

      return {
        isConnected: true,
        currentModel: response.model || 'unknown',
        lastHealthCheck: this.lastHealthCheck,
        totalRequests: this.totalRequests
      };
    } catch (error) {
      logger.warn('[LLMTaskRunner] Health check failed:', error);
      return {
        isConnected: false,
        currentModel: 'unknown',
        lastHealthCheck: this.lastHealthCheck,
        totalRequests: this.totalRequests
      };
    }
  }
}
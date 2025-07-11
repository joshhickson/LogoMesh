import { LLMExecutor, LLMExecutionOptions } from '../../contracts/llmExecutor'; // Added LLMExecutionOptions
import { logLLMInteraction, LLMAuditEntry } from '../logger/llmAuditLogger'; // Added LLMAuditEntry
import { logger } from '../utils/logger';

// Define LLMResponse type
export interface LLMResponse {
  response: string;
  model: string;
  executionTimeMs: number;
  tokensUsed?: number;
}

export class LLMTaskRunner {
  private executor: LLMExecutor;
  private totalRequests = 0;
  private lastHealthCheck?: Date;

  constructor(executor: LLMExecutor) {
    this.executor = executor;
  }

  async run(prompt: string, metadata?: Record<string, unknown>): Promise<string> { // any -> unknown
    const startTime = Date.now();

    try {
      // Execute the prompt
      const response = await this.executor.executePrompt(prompt, metadata);

      // Log the interaction
      const logEntrySuccess: Omit<LLMAuditEntry, 'id' | 'timestamp'> = {
        prompt,
        response,
        model: this.executor.getModelName(),
        duration: Date.now() - startTime,
        success: true
      };
      if (metadata !== undefined) {
        logEntrySuccess.metadata = metadata;
      }
      await logLLMInteraction(logEntrySuccess);

      return response;
    } catch (error) {
      // Log the failed interaction
      const logEntryError: Omit<LLMAuditEntry, 'id' | 'timestamp'> = {
        prompt,
        response: null,
        model: this.executor.getModelName(),
        duration: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
      if (metadata !== undefined) {
        logEntryError.metadata = metadata;
      }
      await logLLMInteraction(logEntryError);

      throw error;
    }
  }

  // Stub for future streaming support
  async runPromptWithStreaming?(
    prompt: string, 
    onChunk: (chunk: string) => void, 
    metadata?: Record<string, unknown> // any -> unknown
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
  async executePrompt(prompt: string, metadata?: Record<string, unknown>): Promise<LLMResponse> { // any -> unknown
    try {
      this.totalRequests++;
      logger.info('[LLMTaskRunner] Executing prompt', { 
        promptLength: prompt.length, 
        metadata,
        totalRequests: this.totalRequests
      });

      const startTime = Date.now();
      const executeOptions: LLMExecutionOptions = {}; // Used imported LLMExecutionOptions
      if (metadata !== undefined) {
        executeOptions.metadata = metadata;
      }
      const response = await this.executor.execute(prompt, executeOptions);
      const executionTime = Date.now() - startTime;

      const resultObject: LLMResponse = {
        response: response.response,
        model: response.model || 'unknown',
        executionTimeMs: executionTime,
      };
      if (response.tokensUsed !== undefined) {
        resultObject.tokensUsed = response.tokensUsed;
      }

      logger.info('[LLMTaskRunner] Prompt executed successfully', { 
        executionTimeMs: executionTime,
        responseLength: resultObject.response.length, // Changed result to resultObject
        totalRequests: this.totalRequests
      });

      return resultObject;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('[LLMTaskRunner] Error executing prompt:', { message: errorMessage, error });
      throw new Error(`LLM execution failed: ${errorMessage}`);
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
      // const startTime = Date.now(); // Removed as executionTime which used it is removed

      const response = await this.executor.execute(healthCheckPrompt, {});
      // const executionTime = Date.now() - startTime; // This was unused

      this.lastHealthCheck = new Date();

      return {
        isConnected: true,
        currentModel: response.model || 'unknown',
        lastHealthCheck: this.lastHealthCheck,
        totalRequests: this.totalRequests
      };
    } catch (error: unknown) { // implicit any -> unknown
      logger.warn('[LLMTaskRunner] Health check failed:', error instanceof Error ? error.message : String(error), error);
      const statusOffline: {
        isConnected: boolean;
        currentModel: string;
        lastHealthCheck?: Date; // Make it optional here for construction
        totalRequests: number;
      } = {
        isConnected: false,
        currentModel: 'unknown',
        totalRequests: this.totalRequests
      };
      if (this.lastHealthCheck !== undefined) {
        statusOffline.lastHealthCheck = this.lastHealthCheck;
      }
      return statusOffline;
    }
  }
}
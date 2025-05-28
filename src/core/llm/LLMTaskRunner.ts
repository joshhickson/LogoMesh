import { LLMExecutor, LLMResponse, PromptMetadata } from '@contracts/llmExecutor'; // Adjust as needed
import { logLLMInteraction, LLMInteractionLog } from '@core/logger/llmAuditLogger'; // Adjust as needed
import { logger } from '@core/utils/logger'; // Named import

export class LLMTaskRunner {
  constructor(private executor: LLMExecutor, private taskName: string = 'UnnamedTask') {}

  async run(prompt: string, callMetadata?: Record<string, any>): Promise<string> {
    logger.info(`[LLMTaskRunner] Running task "${this.taskName}" with prompt: "${prompt.substring(0,50)}..."`);
    
    // Construct PromptMetadata, ensuring taskId is present
    const promptMetadata: PromptMetadata = { 
        taskId: callMetadata?.taskId || crypto.randomUUID(), // Generate UUID if not provided
        taskName: this.taskName, 
        initiator: callMetadata?.initiator || 'system', // Default initiator
        customData: callMetadata // Pass along any other custom data
    };

    try {
      const response: LLMResponse = await this.executor.executePrompt(prompt, promptMetadata);
      
      // Prepare log entry using spread for common fields and explicit for others
      // This assumes LLMInteractionLog is compatible with LLMResponse structure
      // and may require additional fields or transformations.
      const logEntry: LLMInteractionLog = {
        ...response,
        prompt, // Ensure the original prompt is logged
        provider: this.executor.constructor.name, // e.g., "OllamaExecutor", "MockLLMExecutor"
        // model: response.model, // This should already be in 'response'
        // responseText: response.responseText, // This should already be in 'response'
        // timestamp: response.responseTimestamp, // This should already be in 'response'
        // All other fields from LLMResponse are spread.
        // Ensure metadata from promptMetadata is included if not already part of response.metadata
        metadata: {
            ...(response.metadata || {}), // existing metadata from response
            ...promptMetadata // ensure promptMetadata is included/overrides as necessary
        }
      };
      logLLMInteraction(logEntry); // Log the successful interaction
      
      // Check for application-level errors indicated in the response status
      if (response.status === 'error') {
        // Use error message from response if available, otherwise a generic message
        const errorMessage = response.error?.message || 'LLM execution indicated an error status.';
        logger.error(`[LLMTaskRunner] Task "${this.taskName}" resulted in error status: ${errorMessage}`);
        throw new Error(errorMessage);
      }
      return response.responseText;

    } catch (error: any) { // Catch errors from executePrompt or the error thrown above
      logger.error(`[LLMTaskRunner] Error in task "${this.taskName}":`, error.message, error.stack);
      
      // Log the error interaction
      logLLMInteraction({
        prompt,
        provider: this.executor.constructor.name,
        // Check if getModelName method exists on the executor
        model: typeof (this.executor as any).getModelName === 'function' ? (this.executor as any).getModelName() : 'unknown',
        status: 'error',
        error: { message: error.message, code: error.code, stack: error.stack },
        requestTimestamp: promptMetadata.customData?.requestTimestamp || new Date(), // Use provided or current
        responseTimestamp: new Date(),
        latencyMs: promptMetadata.customData?.requestTimestamp ? new Date().getTime() - (promptMetadata.customData.requestTimestamp as Date).getTime() : 0,
        cost: 0, // Error usually means no cost from provider, or it's unknown
        promptTokens: Math.ceil(prompt.length / 4), // Rough estimate
        completionTokens: 0,
        totalTokens: Math.ceil(prompt.length / 4),
        responseText: '', // No responseText on error
        metadata: promptMetadata // Log the metadata associated with the failed prompt
      });
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  async runPromptWithStreaming?(
    prompt: string, 
    callMetadata?: Record<string, any>,
    // streamCallback: (chunk: string) => void // Example, actual signature might vary
  ): Promise<string> {
    if (!this.executor.supportsStreaming) {
      logger.warn(`[LLMTaskRunner] Attempted to use streaming with executor ${this.executor.constructor.name} that does not support it. Falling back to non-streaming execution.`);
      return this.run(prompt, callMetadata); // Fallback to non-streaming version
    }
    
    // If executor supports streaming, but this runner's streaming logic is not implemented:
    logger.error(`[LLMTaskRunner] Task "${this.taskName}" with streaming is not implemented yet for executor ${this.executor.constructor.name}.`);
    throw new Error(`Streaming not implemented in LLMTaskRunner for ${this.executor.constructor.name}.`);
    
    // Placeholder for actual streaming logic:
    // const promptMetadata: PromptMetadata = { /* ... */ };
    // return this.executor.executePromptStream(prompt, promptMetadata, streamCallback);
  }
}

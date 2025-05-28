
import { LLMExecutor } from '../../contracts/llmExecutor';
import { logLLMInteraction } from '../../src/core/logger/llmAuditLogger';

export class LLMTaskRunner {
  constructor(private executor: LLMExecutor) {}

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
}

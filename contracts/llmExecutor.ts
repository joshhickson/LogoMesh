// Placeholder for LLM Executor interface
// TODO: Define a proper interface for LLM execution

export interface LLMExecutionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>; // any -> unknown
  // other options
}

export interface LLMFullResponse {
  response: string;
  model?: string; // Model that generated the response
  tokensUsed?: number;
  // any other details from the LLM provider
}

export interface LLMExecutor {
  /**
   * Executes a given prompt and returns the LLM's response.
   * @param prompt The prompt string to send to the LLM.
   * @param options Optional parameters for execution.
   * @returns A promise that resolves to the LLM's output as a string.
   */
  executePrompt(_prompt: string, _options?: LLMExecutionOptions): Promise<string>;

  /**
   * Executes a given prompt and returns a more detailed response object.
   * @param prompt The prompt string to send to the LLM.
   * @param options Optional parameters for execution.
   * @returns A promise that resolves to an LLMFullResponse object.
   */
  execute(_prompt: string, _options?: LLMExecutionOptions): Promise<LLMFullResponse>;


  /**
   * Gets the model name being used by the executor.
   */
  getModelName(): string;
}

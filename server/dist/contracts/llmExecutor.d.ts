export interface LLMExecutionOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    metadata?: Record<string, any>;
}
export interface LLMFullResponse {
    response: string;
    model?: string;
    tokensUsed?: number;
}
export interface LLMExecutor {
    /**
     * Executes a given prompt and returns the LLM's response.
     * @param prompt The prompt string to send to the LLM.
     * @param options Optional parameters for execution.
     * @returns A promise that resolves to the LLM's output as a string.
     */
    executePrompt(prompt: string, options?: LLMExecutionOptions): Promise<string>;
    /**
     * Executes a given prompt and returns a more detailed response object.
     * @param prompt The prompt string to send to the LLM.
     * @param options Optional parameters for execution.
     * @returns A promise that resolves to an LLMFullResponse object.
     */
    execute(prompt: string, options?: LLMExecutionOptions): Promise<LLMFullResponse>;
    /**
     * Gets the model name being used by the executor.
     */
    getModelName(): string;
}
//# sourceMappingURL=llmExecutor.d.ts.map
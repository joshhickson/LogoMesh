
/**
 * Interface defining common structure for LLM integrations.
 * Allows plugging in different LLM providers (Claude, Gemini, Qwen, etc.)
 * without changing business logic.
 */
export interface LLMExecutor {
  /** Unique identifier for the LLM provider */
  name: string;

  /** Whether this LLM supports streaming responses */
  supportsStreaming: boolean;

  /** Execute a prompt and return the complete response */
  executePrompt(prompt: string): Promise<string>;

  /** Stream response tokens (optional for providers supporting streaming) */
  streamPrompt?(prompt: string): AsyncGenerator<string>;

  /** Generate Mermaid diagram markup from context (optional capability) */
  generateMermaid?(context: any): Promise<string>;
}

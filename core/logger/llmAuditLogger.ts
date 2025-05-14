
/**
 * Defines metadata structure for LLM interactions
 */
export interface LLMMetadata {
  temperature?: number;
  model?: string;
  duration?: number;
  tokens?: number;
  [key: string]: unknown;
}

/**
 * Logs interaction with an LLM agent.
 * Future-proof: this will be redirected to SQLite or Postgres in Phase 2.
 * 
 * @param agent - Name/identifier of the LLM agent
 * @param prompt - Input prompt sent to the LLM
 * @param output - Response received from the LLM
 * @param metadata - Optional metadata about the interaction (temperature, model, tokens, etc.)
 */
export function logLLMInteraction(
  agent: string,
  prompt: string,
  output: string,
  metadata?: Record<string, unknown>
): void {
  console.log(`[LLM ${agent}]`, {
    prompt,
    output,
    metadata,
    timestamp: new Date().toISOString(),
  });
}

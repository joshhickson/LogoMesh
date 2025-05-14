/**
 * Logs interaction with an LLM agent.
 * Future-proof: this will be redirected to SQLite or Postgres in Phase 2.
 */
export function logLLMInteraction(
  agent: string,
  prompt: string,
  output: string,
  metadata?: Record<string, any>
): void {
  console.log(`[LLM ${agent}]`, {
    prompt,
    output,
    metadata,
    timestamp: new Date().toISOString(),
  });
}
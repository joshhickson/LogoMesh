
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

export interface LLMInteractionData {
  prompt?: string;
  response?: string;
  metadata?: Record<string, unknown>;
}

export function logLLMInteraction(data: LLMInteractionData): void {
  console.log(`[LLM ${agent}]`, {
    prompt: data.prompt,
    output: data.response,
    metadata: data.metadata,
    timestamp: new Date().toISOString(),
  });
}
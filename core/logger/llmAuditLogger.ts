export interface LLMMetadata {
  temperature?: number;
  model?: string;
  duration?: number;
  tokens?: number;
  [key: string]: unknown;
}

export function logLLMInteraction(
  agent: string,
  prompt: string,
  output: string,
  metadata?: LLMMetadata
): void {
  console.log(`[LLM ${agent}]`, {
    prompt: prompt,
    output: output,
    metadata: metadata,
    timestamp: new Date().toISOString(),
  });
}
/**
 * Logs interaction with an LLM agent.
 * Future-proof: this will be redirected to SQLite or Postgres in Phase 2.
 */
export function logLLMInteraction(
  agent: string,
  prompt: string,
  output: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any> // TODO: Replace 'any' with a more specific type if possible
): void {
  console.log(`[LLM ${agent}]`, {
    prompt,
    output,
    metadata,
    timestamp: new Date().toISOString(),
  });
}

export const llmAuditLogger = {
  // TODO: Replace 'any' with a more specific type if possible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[LLM Audit ${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },

  // TODO: Replace 'any' with a more specific type if possible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[LLM Audit Error ${timestamp}] ${message}`, error);
  },

  // TODO: Replace 'any' with a more specific type if possible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.debug(`[LLM Audit Debug ${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },

  logPromptRequest: async (requestData: {
    prompt: string;
    // TODO: Replace 'any' with a more specific type if possible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: any;
    timestamp: string;
    requestId: string;
  }) => {
    const { prompt, metadata, timestamp, requestId } = requestData;
    console.log(`[LLM Audit Request ${timestamp}] ID: ${requestId}`, {
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      metadata
    });
  },

  logPromptResponse: async (responseData: {
    // TODO: Replace 'any' with a more specific type if possible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any;
    timestamp: string;
    executionTimeMs: number;
  }) => {
    const { result, timestamp, executionTimeMs } = responseData;
    console.log(`[LLM Audit Response ${timestamp}]`, {
      responseLength: typeof result === 'string' ? result.length : JSON.stringify(result).length,
      executionTimeMs,
      responsePreview: typeof result === 'string' 
        ? result.substring(0, 100) + (result.length > 100 ? '...' : '')
        : JSON.stringify(result).substring(0, 100) + '...'
    });
  },

  logError: async (errorData: {
    error: string;
    stack?: string;
    timestamp: string;
  }) => {
    const { error, stack, timestamp } = errorData;
    console.error(`[LLM Audit Error ${timestamp}]`, {
      error,
      stack: stack ? stack.substring(0, 500) + '...' : 'No stack trace'
    });
  }
};
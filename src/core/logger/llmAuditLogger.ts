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

export const llmAuditLogger = {
  log: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[LLM Audit ${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },

  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[LLM Audit Error ${timestamp}] ${message}`, error);
  },

  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.debug(`[LLM Audit Debug ${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },

  logPromptRequest: async (requestData: {
    prompt: string;
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
/**
 * Logs interaction with an LLM agent.
 * Future-proof: this will be redirected to SQLite or Postgres in Phase 2.
 */
export declare function logLLMInteraction(agent: string, prompt: string, output: string, metadata?: Record<string, any>): void;
export declare const llmAuditLogger: {
    log: (message: string, data?: any) => void;
    error: (message: string, error?: any) => void;
    debug: (message: string, data?: any) => void;
    logPromptRequest: (requestData: {
        prompt: string;
        metadata: any;
        timestamp: string;
        requestId: string;
    }) => Promise<void>;
    logPromptResponse: (responseData: {
        result: any;
        timestamp: string;
        executionTimeMs: number;
    }) => Promise<void>;
    logError: (errorData: {
        error: string;
        stack?: string;
        timestamp: string;
    }) => Promise<void>;
};
//# sourceMappingURL=llmAuditLogger.d.ts.map
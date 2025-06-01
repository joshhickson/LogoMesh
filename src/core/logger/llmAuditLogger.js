"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmAuditLogger = exports.logLLMInteraction = void 0;
/**
 * Logs interaction with an LLM agent.
 * Future-proof: this will be redirected to SQLite or Postgres in Phase 2.
 */
function logLLMInteraction(agent, prompt, output, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
metadata // TODO: Replace 'any' with a more specific type if possible
) {
    console.log(`[LLM ${agent}]`, {
        prompt,
        output,
        metadata,
        timestamp: new Date().toISOString(),
    });
}
exports.logLLMInteraction = logLLMInteraction;
exports.llmAuditLogger = {
    // TODO: Replace 'any' with a more specific type if possible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log: (message, data) => {
        const timestamp = new Date().toISOString();
        console.log(`[LLM Audit ${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    },
    // TODO: Replace 'any' with a more specific type if possible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (message, error) => {
        const timestamp = new Date().toISOString();
        console.error(`[LLM Audit Error ${timestamp}] ${message}`, error);
    },
    // TODO: Replace 'any' with a more specific type if possible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debug: (message, data) => {
        if (process.env.NODE_ENV === 'development') {
            const timestamp = new Date().toISOString();
            console.debug(`[LLM Audit Debug ${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
        }
    },
    logPromptRequest: async (requestData) => {
        const { prompt, metadata, timestamp, requestId } = requestData;
        console.log(`[LLM Audit Request ${timestamp}] ID: ${requestId}`, {
            promptLength: prompt.length,
            promptPreview: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
            metadata
        });
    },
    logPromptResponse: async (responseData) => {
        const { result, timestamp, executionTimeMs } = responseData;
        console.log(`[LLM Audit Response ${timestamp}]`, {
            responseLength: typeof result === 'string' ? result.length : JSON.stringify(result).length,
            executionTimeMs,
            responsePreview: typeof result === 'string'
                ? result.substring(0, 100) + (result.length > 100 ? '...' : '')
                : JSON.stringify(result).substring(0, 100) + '...'
        });
    },
    logError: async (errorData) => {
        const { error, stack, timestamp } = errorData;
        console.error(`[LLM Audit Error ${timestamp}]`, {
            error,
            stack: stack ? stack.substring(0, 500) + '...' : 'No stack trace'
        });
    }
};
//# sourceMappingURL=llmAuditLogger.js.map
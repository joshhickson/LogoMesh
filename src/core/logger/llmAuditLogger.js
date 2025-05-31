"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logLLMInteraction = void 0;
/**
 * Logs interaction with an LLM agent.
 * Future-proof: this will be redirected to SQLite or Postgres in Phase 2.
 */
function logLLMInteraction(agent, prompt, output, metadata) {
    console.log(`[LLM ${agent}]`, {
        prompt,
        output,
        metadata,
        timestamp: new Date().toISOString(),
    });
}
exports.logLLMInteraction = logLLMInteraction;
//# sourceMappingURL=llmAuditLogger.js.map
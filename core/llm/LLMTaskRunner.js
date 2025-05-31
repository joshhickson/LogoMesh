"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMTaskRunner = void 0;
const llmAuditLogger_1 = require("../../src/core/logger/llmAuditLogger");
class LLMTaskRunner {
    constructor(executor) {
        this.executor = executor;
    }
    async run(prompt, metadata) {
        const startTime = Date.now();
        try {
            // Execute the prompt
            const response = await this.executor.executePrompt(prompt, metadata);
            // Log the interaction
            await (0, llmAuditLogger_1.logLLMInteraction)({
                prompt,
                response,
                model: this.executor.getModelName(),
                metadata,
                duration: Date.now() - startTime,
                success: true
            });
            return response;
        }
        catch (error) {
            // Log the failed interaction
            await (0, llmAuditLogger_1.logLLMInteraction)({
                prompt,
                response: null,
                model: this.executor.getModelName(),
                metadata,
                duration: Date.now() - startTime,
                success: false,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
    // Stub for future streaming support
    async runPromptWithStreaming(prompt, onChunk, metadata) {
        // For now, just call the regular run method and simulate streaming
        const response = await this.run(prompt, metadata);
        // Simulate streaming by sending chunks
        const chunks = response.split(' ');
        let fullResponse = '';
        for (const chunk of chunks) {
            onChunk(chunk + ' ');
            fullResponse += chunk + ' ';
            await new Promise(resolve => setTimeout(resolve, 50)); // Simulate delay
        }
        return fullResponse.trim();
    }
}
exports.LLMTaskRunner = LLMTaskRunner;
//# sourceMappingURL=LLMTaskRunner.js.map
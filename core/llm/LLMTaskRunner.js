"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMTaskRunner = void 0;
const llmAuditLogger_1 = require("../../src/core/logger/llmAuditLogger");
const logger_1 = require("../../src/core/utils/logger");
class LLMTaskRunner {
    constructor(executor) {
        this.totalRequests = 0;
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
    async executePrompt(prompt, metadata) {
        try {
            this.totalRequests++;
            logger_1.logger.info('[LLMTaskRunner] Executing prompt', {
                promptLength: prompt.length,
                metadata,
                totalRequests: this.totalRequests
            });
            const startTime = Date.now();
            const response = await this.executor.execute(prompt, { metadata });
            const executionTime = Date.now() - startTime;
            const result = {
                response: response.response,
                model: response.model || 'unknown',
                executionTimeMs: executionTime,
                tokensUsed: response.tokensUsed
            };
            logger_1.logger.info('[LLMTaskRunner] Prompt executed successfully', {
                executionTimeMs: executionTime,
                responseLength: result.response.length,
                totalRequests: this.totalRequests
            });
            return result;
        }
        catch (error) {
            logger_1.logger.error('[LLMTaskRunner] Error executing prompt:', error);
            throw new Error(`LLM execution failed: ${error.message}`);
        }
    }
    async getStatus() {
        try {
            // Simple health check - try to execute a minimal prompt
            const healthCheckPrompt = "Reply with 'OK'";
            const startTime = Date.now();
            const response = await this.executor.execute(healthCheckPrompt, {});
            const executionTime = Date.now() - startTime;
            this.lastHealthCheck = new Date();
            return {
                isConnected: true,
                currentModel: response.model || 'unknown',
                lastHealthCheck: this.lastHealthCheck,
                totalRequests: this.totalRequests
            };
        }
        catch (error) {
            logger_1.logger.warn('[LLMTaskRunner] Health check failed:', error);
            return {
                isConnected: false,
                currentModel: 'unknown',
                lastHealthCheck: this.lastHealthCheck,
                totalRequests: this.totalRequests
            };
        }
    }
}
exports.LLMTaskRunner = LLMTaskRunner;
//# sourceMappingURL=LLMTaskRunner.js.map
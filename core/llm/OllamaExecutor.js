"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaExecutor = void 0;
class OllamaExecutor {
    constructor(modelName = 'ollama-mock') {
        this.modelName = modelName;
    }
    async executePrompt(prompt, metadata) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 100));
        // Return mocked response
        return `Mocked response for: ${prompt}`;
    }
    get supportsStreaming() {
        return false;
    }
    getModelName() {
        return this.modelName;
    }
    // Future VTC compatibility - ensure no hardcoded embedding assumptions
    async executeWithContext(prompt, context, metadata) {
        // This method is designed to accept context that could originate from VTC
        let contextPrefix = '';
        if (context && context.length > 0) {
            contextPrefix = `[Context: ${context.length} items] `;
        }
        return this.executePrompt(`${contextPrefix}${prompt}`, metadata);
    }
}
exports.OllamaExecutor = OllamaExecutor;
//# sourceMappingURL=OllamaExecutor.js.map
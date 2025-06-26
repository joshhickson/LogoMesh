"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaExecutor = void 0;
class OllamaExecutor {
    constructor(modelName = 'ollama-mock') {
        this.baseUrl = 'http://localhost:11434';
        this.modelName = modelName;
    }
    async executePrompt(prompt, metadata) {
        try {
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.modelName,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        ...metadata
                    }
                })
            });
            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data.response || 'No response received';
        }
        catch (error) {
            console.warn(`[OllamaExecutor] Failed to connect to Ollama, using fallback: ${error.message}`);
            // Fallback to mock for development
            return `[MOCK - Ollama not available] Response for: ${prompt}`;
        }
    }
    async execute(prompt, options) {
        const responseString = await this.executePrompt(prompt, options?.metadata);
        return {
            response: responseString,
            model: this.modelName,
            tokensUsed: responseString.length, // Mock token usage
        };
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
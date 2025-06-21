"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMRegistry = void 0;
const OllamaExecutor_1 = require("./OllamaExecutor");
const logger_1 = require("../utils/logger");
/**
 * LLMRegistry manages local model loading, unloading, and hot-swapping
 * Supports multiple concurrent models with memory management
 */
class LLMRegistry {
    constructor() {
        this.loadedModels = new Map();
        this.availableModels = new Map();
        this.maxMemoryUsage = 16384; // 16GB in MB
        this.currentMemoryUsage = 0;
        this.initializeAvailableModels();
    }
    /**
     * Register available models
     */
    initializeAvailableModels() {
        const models = [
            {
                id: 'qwen2.5-coder-7b',
                name: 'Qwen2.5 Coder 7B',
                type: 'ollama',
                modelPath: 'qwen2.5-coder:7b',
                parameters: { contextLength: 32768, temperature: 0.7 },
                capabilities: ['code-analysis', 'debugging', 'typescript', 'javascript'],
                memoryRequirement: 4096,
                specialized: true
            },
            {
                id: 'codellama-13b',
                name: 'CodeLlama 13B',
                type: 'ollama',
                modelPath: 'codellama:13b',
                parameters: { contextLength: 16384, temperature: 0.5 },
                capabilities: ['architecture', 'code-review', 'refactoring'],
                memoryRequirement: 6144,
                specialized: true
            },
            {
                id: 'deepseek-coder-6.7b',
                name: 'DeepSeek Coder 6.7B',
                type: 'ollama',
                modelPath: 'deepseek-coder:6.7b',
                parameters: { contextLength: 16384, temperature: 0.6 },
                capabilities: ['optimization', 'performance', 'algorithms'],
                memoryRequirement: 3584,
                specialized: true
            },
            {
                id: 'llama-3.1-8b',
                name: 'Llama 3.1 8B',
                type: 'ollama',
                modelPath: 'llama3.1:8b',
                parameters: { contextLength: 8192, temperature: 0.8 },
                capabilities: ['documentation', 'explanation', 'general'],
                memoryRequirement: 4096
            },
            {
                id: 'phi-3.5-mini-4k',
                name: 'Phi 3.5 Mini 4K',
                type: 'ollama',
                modelPath: 'phi3.5:3.8b',
                parameters: { contextLength: 4096, temperature: 0.7 },
                capabilities: ['documentation', 'summarization', 'quick-analysis'],
                memoryRequirement: 2048
            }
        ];
        for (const model of models) {
            this.availableModels.set(model.id, model);
        }
        logger_1.logger.info(`[LLMRegistry] Registered ${models.length} available models`);
    }
    /**
     * Load a model into memory
     */
    async loadModel(modelId) {
        if (this.loadedModels.has(modelId)) {
            const loaded = this.loadedModels.get(modelId);
            loaded.lastUsed = new Date();
            logger_1.logger.info(`[LLMRegistry] Model ${modelId} already loaded, returning existing instance`);
            return loaded.executor;
        }
        const config = this.availableModels.get(modelId);
        if (!config) {
            throw new Error(`Model ${modelId} not found in registry`);
        }
        // Check memory constraints
        if (this.currentMemoryUsage + config.memoryRequirement > this.maxMemoryUsage) {
            await this.freeMemoryFor(config.memoryRequirement);
        }
        logger_1.logger.info(`[LLMRegistry] Loading model ${modelId}...`);
        try {
            let executor;
            switch (config.type) {
                case 'ollama':
                    executor = new OllamaExecutor_1.OllamaExecutor(config.modelPath || config.id);
                    break;
                default:
                    throw new Error(`Model type ${config.type} not supported yet`);
            }
            // Test the model to ensure it's working
            await executor.executePrompt('Hello, are you ready?');
            const loadedModel = {
                config,
                executor,
                loadTime: new Date(),
                lastUsed: new Date(),
                memoryUsage: config.memoryRequirement,
                requestCount: 0
            };
            this.loadedModels.set(modelId, loadedModel);
            this.currentMemoryUsage += config.memoryRequirement;
            logger_1.logger.info(`[LLMRegistry] Successfully loaded model ${modelId} (${config.memoryRequirement}MB)`);
            return executor;
        }
        catch (error) {
            logger_1.logger.error(`[LLMRegistry] Failed to load model ${modelId}:`, error);
            throw new Error(`Failed to load model ${modelId}: ${error}`);
        }
    }
    /**
     * Unload a model from memory
     */
    async unloadModel(modelId) {
        const loaded = this.loadedModels.get(modelId);
        if (!loaded) {
            logger_1.logger.warn(`[LLMRegistry] Model ${modelId} not loaded, nothing to unload`);
            return;
        }
        this.loadedModels.delete(modelId);
        this.currentMemoryUsage -= loaded.memoryUsage;
        logger_1.logger.info(`[LLMRegistry] Unloaded model ${modelId} (freed ${loaded.memoryUsage}MB)`);
    }
    /**
     * Hot-swap one model for another
     */
    async hotSwapModel(currentModelId, newModelId) {
        logger_1.logger.info(`[LLMRegistry] Hot-swapping ${currentModelId} -> ${newModelId}`);
        // Load new model first
        const newExecutor = await this.loadModel(newModelId);
        // Unload old model
        await this.unloadModel(currentModelId);
        return newExecutor;
    }
    /**
     * Get all available models
     */
    getAvailableModels() {
        return Array.from(this.availableModels.values());
    }
    /**
     * Get currently loaded models
     */
    getLoadedModels() {
        return Array.from(this.loadedModels.values());
    }
    /**
     * Get models by capability
     */
    getModelsByCapability(capability) {
        return Array.from(this.availableModels.values())
            .filter(model => model.capabilities.includes(capability));
    }
    /**
     * Get memory usage statistics
     */
    getMemoryStats() {
        return {
            currentUsage: this.currentMemoryUsage,
            maxUsage: this.maxMemoryUsage,
            freeMemory: this.maxMemoryUsage - this.currentMemoryUsage,
            loadedModelCount: this.loadedModels.size
        };
    }
    /**
     * Private: Free memory for new model by unloading least recently used
     */
    async freeMemoryFor(requiredMemory) {
        logger_1.logger.info(`[LLMRegistry] Need to free ${requiredMemory}MB memory`);
        // Sort by last used time (oldest first)
        const sortedModels = Array.from(this.loadedModels.entries())
            .sort((a, b) => a[1].lastUsed.getTime() - b[1].lastUsed.getTime());
        let freedMemory = 0;
        for (const [modelId, loaded] of sortedModels) {
            if (freedMemory >= requiredMemory)
                break;
            await this.unloadModel(modelId);
            freedMemory += loaded.memoryUsage;
            logger_1.logger.info(`[LLMRegistry] Freed ${loaded.memoryUsage}MB by unloading ${modelId}`);
        }
        if (freedMemory < requiredMemory) {
            throw new Error(`Cannot free enough memory: need ${requiredMemory}MB, freed ${freedMemory}MB`);
        }
    }
    /**
     * Update model usage statistics
     */
    recordModelUsage(modelId) {
        const loaded = this.loadedModels.get(modelId);
        if (loaded) {
            loaded.lastUsed = new Date();
            loaded.requestCount++;
        }
    }
    /**
     * Get model performance statistics
     */
    getModelStats(modelId) {
        const loaded = this.loadedModels.get(modelId);
        if (!loaded)
            return null;
        return {
            id: modelId,
            name: loaded.config.name,
            loadTime: loaded.loadTime,
            lastUsed: loaded.lastUsed,
            requestCount: loaded.requestCount,
            memoryUsage: loaded.memoryUsage,
            capabilities: loaded.config.capabilities,
            uptime: Date.now() - loaded.loadTime.getTime()
        };
    }
}
exports.LLMRegistry = LLMRegistry;
//# sourceMappingURL=LLMRegistry.js.map
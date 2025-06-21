import { LLMExecutor } from '../../contracts/llmExecutor';
export interface ModelConfig {
    id: string;
    name: string;
    type: 'ollama' | 'huggingface' | 'openai' | 'anthropic';
    endpoint?: string;
    modelPath?: string;
    parameters?: {
        contextLength?: number;
        temperature?: number;
        maxTokens?: number;
    };
    capabilities: string[];
    memoryRequirement: number;
    specialized?: boolean;
}
export interface LoadedModel {
    config: ModelConfig;
    executor: LLMExecutor;
    loadTime: Date;
    lastUsed: Date;
    memoryUsage: number;
    requestCount: number;
}
/**
 * LLMRegistry manages local model loading, unloading, and hot-swapping
 * Supports multiple concurrent models with memory management
 */
export declare class LLMRegistry {
    private loadedModels;
    private availableModels;
    private maxMemoryUsage;
    private currentMemoryUsage;
    constructor();
    /**
     * Register available models
     */
    private initializeAvailableModels;
    /**
     * Load a model into memory
     */
    loadModel(modelId: string): Promise<LLMExecutor>;
    /**
     * Unload a model from memory
     */
    unloadModel(modelId: string): Promise<void>;
    /**
     * Hot-swap one model for another
     */
    hotSwapModel(currentModelId: string, newModelId: string): Promise<LLMExecutor>;
    /**
     * Get all available models
     */
    getAvailableModels(): ModelConfig[];
    /**
     * Get currently loaded models
     */
    getLoadedModels(): LoadedModel[];
    /**
     * Get models by capability
     */
    getModelsByCapability(capability: string): ModelConfig[];
    /**
     * Get memory usage statistics
     */
    getMemoryStats(): {
        currentUsage: number;
        maxUsage: number;
        freeMemory: number;
        loadedModelCount: number;
    };
    /**
     * Private: Free memory for new model by unloading least recently used
     */
    private freeMemoryFor;
    /**
     * Update model usage statistics
     */
    recordModelUsage(modelId: string): void;
    /**
     * Get model performance statistics
     */
    getModelStats(modelId: string): any;
}
//# sourceMappingURL=LLMRegistry.d.ts.map
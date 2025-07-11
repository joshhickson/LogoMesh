
import { LLMExecutor } from '../../contracts/llmExecutor';
import { OllamaExecutor } from './OllamaExecutor';
import { logger } from '../utils/logger';

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
  memoryRequirement: number; // MB
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

export interface ModelStatistics {
  id: string;
  name: string;
  loadTime: Date;
  lastUsed: Date;
  requestCount: number;
  memoryUsage: number;
  capabilities: string[];
  uptime: number; // Milliseconds
}

/**
 * LLMRegistry manages local model loading, unloading, and hot-swapping
 * Supports multiple concurrent models with memory management
 */
export class LLMRegistry {
  private loadedModels: Map<string, LoadedModel> = new Map();
  private availableModels: Map<string, ModelConfig> = new Map();
  private maxMemoryUsage = 16384; // 16GB in MB
  private currentMemoryUsage = 0;

  constructor() {
    this.initializeAvailableModels();
  }

  /**
   * Register available models
   */
  private initializeAvailableModels(): void {
    const models: ModelConfig[] = [
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

    logger.info(`[LLMRegistry] Registered ${models.length} available models`);
  }

  /**
   * Load a model into memory
   */
  async loadModel(modelId: string): Promise<LLMExecutor> {
    if (this.loadedModels.has(modelId)) {
      const loaded = this.loadedModels.get(modelId);
      if (loaded) {
        loaded.lastUsed = new Date();
        logger.info(`[LLMRegistry] Model ${modelId} already loaded, returning existing instance`);
        return loaded.executor;
      }
      // This case should ideally not be reached if .has(modelId) is true
      throw new Error(`Internal error: Model ${modelId} found with .has() but not with .get()`);
    }

    const config = this.availableModels.get(modelId);
    if (!config) {
      throw new Error(`Model ${modelId} not found in registry`);
    }

    // Check memory constraints
    if (this.currentMemoryUsage + config.memoryRequirement > this.maxMemoryUsage) {
      await this.freeMemoryFor(config.memoryRequirement);
    }

    logger.info(`[LLMRegistry] Loading model ${modelId}...`);

    try {
      let executor: LLMExecutor;

      switch (config.type) {
        case 'ollama':
          executor = new OllamaExecutor(config.modelPath || config.id);
          break;
        default:
          throw new Error(`Model type ${config.type} not supported yet`);
      }

      // Test the model to ensure it's working
      await executor.executePrompt('Hello, are you ready?');

      const loadedModel: LoadedModel = {
        config,
        executor,
        loadTime: new Date(),
        lastUsed: new Date(),
        memoryUsage: config.memoryRequirement,
        requestCount: 0
      };

      this.loadedModels.set(modelId, loadedModel);
      this.currentMemoryUsage += config.memoryRequirement;

      logger.info(`[LLMRegistry] Successfully loaded model ${modelId} (${config.memoryRequirement}MB)`);

      return executor;

    } catch (error) {
      logger.error(`[LLMRegistry] Failed to load model ${modelId}:`, error);
      throw new Error(`Failed to load model ${modelId}: ${error}`);
    }
  }

  /**
   * Unload a model from memory
   */
  async unloadModel(modelId: string): Promise<void> {
    const loaded = this.loadedModels.get(modelId);
    if (!loaded) {
      logger.warn(`[LLMRegistry] Model ${modelId} not loaded, nothing to unload`);
      return;
    }

    this.loadedModels.delete(modelId);
    this.currentMemoryUsage -= loaded.memoryUsage;

    logger.info(`[LLMRegistry] Unloaded model ${modelId} (freed ${loaded.memoryUsage}MB)`);
  }

  /**
   * Hot-swap one model for another
   */
  async hotSwapModel(currentModelId: string, newModelId: string): Promise<LLMExecutor> {
    logger.info(`[LLMRegistry] Hot-swapping ${currentModelId} -> ${newModelId}`);

    // Load new model first
    const newExecutor = await this.loadModel(newModelId);

    // Unload old model
    await this.unloadModel(currentModelId);

    return newExecutor;
  }

  /**
   * Get all available models
   */
  getAvailableModels(): ModelConfig[] {
    return Array.from(this.availableModels.values());
  }

  /**
   * Get currently loaded models
   */
  getLoadedModels(): LoadedModel[] {
    return Array.from(this.loadedModels.values());
  }

  /**
   * Get models by capability
   */
  getModelsByCapability(capability: string): ModelConfig[] {
    return Array.from(this.availableModels.values())
      .filter(model => model.capabilities.includes(capability));
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    currentUsage: number;
    maxUsage: number;
    freeMemory: number;
    loadedModelCount: number;
  } {
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
  private async freeMemoryFor(requiredMemory: number): Promise<void> {
    logger.info(`[LLMRegistry] Need to free ${requiredMemory}MB memory`);

    // Sort by last used time (oldest first)
    const sortedModels = Array.from(this.loadedModels.entries())
      .sort((a, b) => a[1].lastUsed.getTime() - b[1].lastUsed.getTime());

    let freedMemory = 0;
    for (const [modelId, loaded] of sortedModels) {
      if (freedMemory >= requiredMemory) break;

      await this.unloadModel(modelId);
      freedMemory += loaded.memoryUsage;

      logger.info(`[LLMRegistry] Freed ${loaded.memoryUsage}MB by unloading ${modelId}`);
    }

    if (freedMemory < requiredMemory) {
      throw new Error(`Cannot free enough memory: need ${requiredMemory}MB, freed ${freedMemory}MB`);
    }
  }

  /**
   * Update model usage statistics
   */
  recordModelUsage(modelId: string): void {
    const loaded = this.loadedModels.get(modelId);
    if (loaded) {
      loaded.lastUsed = new Date();
      loaded.requestCount++;
    }
  }

  /**
   * Get model performance statistics
   */
  getModelStats(modelId: string): ModelStatistics | null {
    const loaded = this.loadedModels.get(modelId);
    if (!loaded) return null;

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

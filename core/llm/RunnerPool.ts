import { LLMTaskRunner } from './LLMTaskRunner';
import { LLMRegistry } from './LLMRegistry';
import { logger } from '../utils/logger';

export class RunnerPool {
  private registry: LLMRegistry;

  constructor(registry: LLMRegistry) {
    this.registry = registry;
  }

  async getRunner(modelId: string): Promise<LLMTaskRunner> {
    logger.info(`[RunnerPool] Getting runner for model ${modelId}`);

    const executor = await this.registry.loadModel(modelId);
    const runner = new LLMTaskRunner(executor);

    return runner;
  }
}

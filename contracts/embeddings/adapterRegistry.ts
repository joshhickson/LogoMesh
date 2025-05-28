
import { EmbeddingInterface } from './embeddingInterface';

/**
 * Interface for registering and retrieving different embedding adapters for VTC.
 * This allows dynamic loading of model-specific input/output adapters.
 */
export interface AdapterRegistry {
  registerAdapter(modelName: string, inputAdapter: EmbeddingInterface, outputAdapter: EmbeddingInterface): void;
  getInputAdapter(modelName: string): EmbeddingInterface | undefined;
  getOutputAdapter(modelName: string): EmbeddingInterface | undefined;
}

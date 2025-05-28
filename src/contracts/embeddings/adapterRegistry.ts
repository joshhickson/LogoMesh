// contracts/embeddings/adapterRegistry.ts
import { EmbeddingInterface } from './embeddingInterface';

/**
 * Interface for registering and retrieving different embedding adapters for VTC.
 * This allows dynamic loading of model-specific input/output adapters,
 * facilitating translation between different embedding models via the ULS.
 */
export interface AdapterRegistry {
  /**
   * Registers embedding adapters for a specific model.
   * @param modelName The unique name of the embedding model.
   * @param inputAdapter An adapter to convert data to the model's native embedding format.
   * @param outputAdapter An adapter to convert the model's native embedding to the ULS (or another target space).
   */
  registerAdapter(modelName: string, inputAdapter: EmbeddingInterface, outputAdapter?: EmbeddingInterface): void;
  // Output adapter is optional if the inputAdapter itself produces ULS-compatible embeddings,
  // or if the primary use is just to get to the model's native space.

  /**
   * Retrieves the input adapter for a given model.
   * This adapter is used to generate embeddings using the specified model.
   * @param modelName The name of the embedding model.
   * @returns The EmbeddingInterface for input, or undefined if not found.
   */
  getInputAdapter(modelName: string): EmbeddingInterface | undefined;

  /**
   * Retrieves the output adapter for a given model.
   * This adapter is used to translate embeddings from the specified model's format,
   * potentially into the ULS or another common format.
   * @param modelName The name of the embedding model.
   * @returns The EmbeddingInterface for output, or undefined if not found.
   */
  getOutputAdapter?(modelName: string): EmbeddingInterface | undefined; // Made optional
}

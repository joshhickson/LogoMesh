
import { EmbeddingInterface } from './embeddingInterface';

/**
 * Interface for registering and retrieving different embedding adapters for VTC.
 * This allows dynamic loading of model-specific input/output adapters.
 */
export interface AdapterRegistry {
  /**
   * Register input and output adapters for a specific model
   * @param modelName - Unique identifier for the model
   * @param inputAdapter - Adapter for converting model inputs to ULS
   * @param outputAdapter - Adapter for converting ULS back to model format
   */
  registerAdapter(
    _modelName: string,
    _inputAdapter: EmbeddingInterface,
    _outputAdapter: EmbeddingInterface
  ): void;

  /**
   * Get the input adapter for a specific model
   * @param modelName - The model identifier
   * @returns Input adapter or undefined if not found
   */
  getInputAdapter(_modelName: string): EmbeddingInterface | undefined;

  /**
   * Get the output adapter for a specific model
   * @param modelName - The model identifier
   * @returns Output adapter or undefined if not found
   */
  getOutputAdapter(_modelName: string): EmbeddingInterface | undefined;

  /**
   * List all registered model names
   * @returns Array of registered model names
   */
  listRegisteredModels(): string[];

  /**
   * Remove adapters for a specific model
   * @param modelName - The model identifier to remove
   * @returns True if removed, false if not found
   */
  unregisterAdapter(_modelName: string): boolean;

  /**
   * Check if a model has both input and output adapters registered
   * @param modelName - The model identifier
   * @returns True if fully registered
   */
  isFullyRegistered(_modelName: string): boolean;
}

/**
 * Adapter metadata for tracking registered models
 */
export interface AdapterMetadata {
  modelName: string;
  registeredAt: Date;
  inputDimension: number;
  outputDimension: number;
  modelType: string; // 'text', 'image', 'multimodal', etc.
  version?: string;
}

/**
 * Extended registry interface with metadata support
 */
export interface ExtendedAdapterRegistry extends AdapterRegistry {
  /**
   * Get metadata for a registered adapter
   */
  getAdapterMetadata(_modelName: string): AdapterMetadata | undefined;

  /**
   * Register adapter with metadata
   */
  registerAdapterWithMetadata(
    _metadata: Omit<AdapterMetadata, 'registeredAt'>,
    _inputAdapter: EmbeddingInterface,
    _outputAdapter: EmbeddingInterface
  ): void;
}

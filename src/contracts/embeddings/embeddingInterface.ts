// contracts/embeddings/embeddingInterface.ts
/**
 * Abstract interface for all embedding interactions to ensure model-agnostic handling.
 * Components interacting with embeddings (e.g., for VTC, semantic search) should use this.
 */
export interface EmbeddingInterface {
  /**
   * Converts input data (e.g., text, image path, audio data) into a vector embedding.
   * @param input The data to embed. Type 'any' for flexibility, specific implementations will define expected input.
   * @returns A Promise resolving to an array of numbers representing the embedding vector.
   */
  toVector(input: any): Promise<number[]>;

  /**
   * Converts an embedding vector back into a representational format (if applicable).
   * This might be lossy or not always possible depending on the model.
   * @param vector The embedding vector.
   * @returns A Promise resolving to the reconstructed input or its representation. Type 'any'.
   */
  fromVector?(vector: number[]): Promise<any>; // Made optional as not all models support this

  /**
   * @returns The name of the embedding model being used (e.g., "text-embedding-ada-002", "custom-sentence-transformer").
   */
  getModelName(): string;

  /**
   * @returns The dimension of the embedding vectors produced by this model.
   */
  getDimension(): number;
}

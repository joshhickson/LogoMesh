/**
 * Abstract interface for all embedding interactions to ensure model-agnostic handling.
 * Components interacting with embeddings (e.g., ShellNode, EchoMesh) should use this.
 */
export interface EmbeddingInterface {
    /**
     * Convert input data to vector representation
     * @param input - The input data to convert (text, image, audio, etc.)
     * @returns Promise resolving to numerical vector
     */
    toVector(input: any): Promise<number[]>;
    /**
     * Convert vector back to meaningful representation
     * @param vector - The numerical vector to convert
     * @returns Promise resolving to decoded representation
     */
    fromVector(vector: number[]): Promise<any>;
    /**
     * Get the name/identifier of the embedding model
     * @returns Model name string
     */
    getModelName(): string;
    /**
     * Get the dimension of the embedding space
     * @returns Embedding dimension
     */
    getDimension(): number;
}
/**
 * Extended interface for embeddings that support metadata and context
 */
export interface ContextualEmbeddingInterface extends EmbeddingInterface {
    /**
     * Convert input with additional context/metadata
     */
    toVectorWithContext(input: any, context?: Record<string, any>): Promise<number[]>;
    /**
     * Batch processing for multiple inputs
     */
    toVectorBatch(inputs: any[]): Promise<number[][]>;
    /**
     * Get similarity score between two vectors
     */
    getSimilarity(vector1: number[], vector2: number[]): number;
}
//# sourceMappingURL=embeddingInterface.d.ts.map
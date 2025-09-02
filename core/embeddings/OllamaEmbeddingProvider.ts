import { ContextualEmbeddingInterface } from '../../contracts/embeddings/embeddingInterface';
import { logger } from '../utils/logger';

interface OllamaEmbeddingResponse {
  embedding: number[];
}

/**
 * A provider for generating embeddings using a local Ollama instance.
 */
export class OllamaEmbeddingProvider implements ContextualEmbeddingInterface {
  private baseUrl = 'http://localhost:11434';
  private modelName: string;
  private dimension: number | null = null;

  constructor(modelName = 'nomic-embed-text') {
    this.modelName = modelName;
    logger.info(`[OllamaEmbeddingProvider] Initialized with model: ${modelName}`);
  }

  /**
   * Calculates the cosine similarity between two vectors.
   * @param vecA The first vector.
   * @param vecB The second vector.
   * @returns The cosine similarity score (between -1 and 1).
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) {
      return 0;
    }

    let dotProduct = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }

    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);

    if (magA === 0 || magB === 0) {
      return 0;
    }

    return dotProduct / (magA * magB);
  }

  async toVector(input: unknown): Promise<number[]> {
    if (typeof input !== 'string' || !input) {
      throw new Error('Input must be a non-empty string.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          prompt: input,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`[OllamaEmbeddingProvider] Ollama API error: ${response.status} ${response.statusText}`, { body: errorBody });
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as OllamaEmbeddingResponse;

      if (!this.dimension && data.embedding) {
        this.dimension = data.embedding.length;
        logger.info(`[OllamaEmbeddingProvider] Detected embedding dimension: ${this.dimension}`);
      }

      return data.embedding;
    } catch (error) {
      logger.error(`[OllamaEmbeddingProvider] Failed to connect to Ollama: ${error instanceof Error ? error.message : String(error)}`);
      // Fallback to a zero-vector to avoid crashing consumers, though this is not ideal.
      // A more robust solution might involve a circuit breaker or a different fallback.
      return [];
    }
  }

  async fromVector(vector: number[]): Promise<unknown> {
    logger.warn('[OllamaEmbeddingProvider] fromVector is not supported and will return an empty string.');
    // Not supported by most embedding models
    return Promise.resolve('');
  }

  getModelName(): string {
    return this.modelName;
  }

  getDimension(): number {
    if (this.dimension === null) {
      logger.warn('[OllamaEmbeddingProvider] Dimension not yet known. Call toVector first.');
      // This is a default, but it should be determined dynamically.
      // Based on nomic-embed-text, 768 is a common dimension.
      return 768;
    }
    return this.dimension;
  }

  async toVectorWithContext(input: unknown, context?: Record<string, unknown>): Promise<number[]> {
    // For now, ignoring context, but this could be used to prepend context to the input string.
    logger.debug('[OllamaEmbeddingProvider] toVectorWithContext called, but context is currently ignored.', { context });
    return this.toVector(input);
  }

  async toVectorBatch(inputs: unknown[]): Promise<number[][]> {
    // Process inputs in parallel
    const promises = inputs.map(input => this.toVector(input));
    return Promise.all(promises);
  }

  getSimilarity(vector1: number[], vector2: number[]): number {
    return this.cosineSimilarity(vector1, vector2);
  }
}

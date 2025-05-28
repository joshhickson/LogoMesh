
/**
 * Abstract interface for all embedding interactions to ensure model-agnostic handling.
 * Components interacting with embeddings (e.g., ShellNode, EchoMesh) should use this.
 */
export interface EmbeddingInterface {
  toVector(input: any): Promise<number[]>;
  fromVector(vector: number[]): Promise<any>;
  getModelName(): string;
  getDimension(): number;
}

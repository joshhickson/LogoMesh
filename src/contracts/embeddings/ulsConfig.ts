// contracts/embeddings/ulsConfig.ts
/**
 * Defines configuration for the Universal Latent Space (ULS) for VTC.
 * Its parameters (e.g., dimension) will be crucial for VTC training/inference.
 */
export interface ULSConfig {
  /**
   * The target dimension for the Universal Latent Space.
   * This should be read from the ULS_DIMENSION environment variable.
   * E.g., 512, 768, 1024.
   */
  dimension: number;

  // Add other ULS specific configs as needed for VTC training/inference in the future.
  // For example:
  // version?: string; // Version of the ULS model or configuration
  // distanceMetric?: 'cosine' | 'euclidean'; // Default distance metric for the space
}

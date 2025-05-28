
/**
 * Defines configuration for the Universal Latent Space (ULS) for VTC.
 * Its parameters (e.g., dimension) will be crucial for VTC training/inference.
 */
export interface ULSConfig {
  dimension: number; // E.g., 512, 768, 1024 (from ULS_DIMENSION env var)
  // Add other ULS specific configs as needed for VTC training/inference
}

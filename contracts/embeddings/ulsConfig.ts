
/**
 * Defines configuration for the Universal Latent Space (ULS) for VTC.
 * Its parameters (e.g., dimension) will be crucial for VTC training/inference.
 */
export interface ULSConfig {
  /**
   * The dimension of the universal latent space
   * Should match ULS_DIMENSION environment variable
   */
  dimension: number; // E.g., 512, 768, 1024

  /**
   * The normalization method for vectors in the ULS
   */
  normalization?: 'l2' | 'minmax' | 'none';

  /**
   * Quantization settings for efficient storage/computation
   */
  quantization?: {
    enabled: boolean;
    bits: 8 | 16 | 32;
    method: 'uniform' | 'kmeans';
  };

  /**
   * Supported modalities in this ULS space
   */
  supportedModalities: string[]; // e.g., ['text', 'image', 'audio']

  /**
   * Version of the ULS model/space for compatibility checking
   */
  version: string;

  /**
   * Training configuration metadata
   */
  training?: {
    datasetInfo: string;
    epochsUsed: number;
    learningRate: number;
    batchSize: number;
  };
}

import config from '../../core/config';

/**
 * Default ULS configuration
 */
export const DEFAULT_ULS_CONFIG: ULSConfig = {
  dimension: config.vtc.ulsDimension,
  normalization: 'l2',
  quantization: {
    enabled: false,
    bits: 32,
    method: 'uniform'
  },
  supportedModalities: ['text'],
  version: '1.0.0'
};

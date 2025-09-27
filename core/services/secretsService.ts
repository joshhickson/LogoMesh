// src/core/services/secretsService.ts
import { logger } from '@core/utils/logger';

/**
 * A simple service to manage access to environment variables and secrets.
 * Provides a single point of entry and can log warnings for missing secrets.
 */
export const secretsService = {
  /**
   * Retrieves a secret or environment variable.
   * @param key The name of the environment variable (e.g., 'DB_PATH', 'OPENAI_API_KEY').
   * @param isRequired If true, logs a warning if the variable is not found.
   * @returns The value of the variable, or null if not found.
   */
  get(key: string, isRequired: boolean = false): string | null {
    const value = process.env[key];

    if (!value && isRequired) {
      logger.warn(`Required secret or environment variable "${key}" is not set.`);
    }

    return value || null;
  }
};
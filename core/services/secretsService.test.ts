/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { secretsService } from './secretsService';
import { logger } from '@core/utils/logger';

// Mock the logger to spy on the warn method
vi.mock('@core/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
  },
}));

describe('secretsService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetModules();
    process.env = { ...originalEnv }; // Make a copy
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  it('should return the value of an existing environment variable', () => {
    const key = 'TEST_KEY';
    const value = 'test_value';
    process.env[key] = value;

    const result = secretsService.get(key);
    expect(result).toBe(value);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should return null for a non-existing environment variable', () => {
    const key = 'NON_EXISTING_KEY';
    const result = secretsService.get(key);
    expect(result).toBeNull();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should return null for a non-existing required variable and log a warning', () => {
    const key = 'REQUIRED_KEY';
    const result = secretsService.get(key, true);
    expect(result).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith(`Required secret or environment variable "${key}" is not set.`);
  });

  it('should not log a warning for a non-existing variable if it is not required', () => {
    const key = 'OPTIONAL_KEY';
    secretsService.get(key, false);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should return the value of an existing required environment variable without logging a warning', () => {
    const key = 'EXISTING_REQUIRED_KEY';
    const value = 'i_exist';
    process.env[key] = value;

    const result = secretsService.get(key, true);
    expect(result).toBe(value);
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
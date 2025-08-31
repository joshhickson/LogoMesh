
import { StorageAdapter } from '../storageAdapter';
import { Logger } from '../../core/utils/logger';
import { Thought, Segment } from '../entities';

/**
 * API interface provided to plugins for interacting with LogoMesh core services.
 * This abstraction layer ensures plugins can access necessary functionality
 * without direct dependency on internal implementations.
 */
export interface PluginAPI {
  /**
   * Access to the storage layer for reading/writing data
   */
  getStorageAdapter(): StorageAdapter;

  /**
   * Access to the logging system
   */
  getLogger(): Logger;

  /**
   * Get configuration values
   */
  getConfig(key: string): unknown;

  /**
   * Set configuration values (if plugin has permission)
   */
  setConfig(key: string, value: unknown): Promise<void>;

  /**
   * Access to thought and segment data (read-only for most plugins)
   */
  getThoughts(): Promise<Thought[]>;
  getSegments(thoughtId: string, userId?: string): Promise<Segment[]>;

  /**
   * Plugin permission checks
   */
  hasPermission(permission: string): boolean;
}

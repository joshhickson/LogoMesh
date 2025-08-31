
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
  getConfig(_key: string): unknown;

  /**
   * Set configuration values (if plugin has permission)
   */
  setConfig(_key: string, _value: unknown): Promise<void>;

  /**
   * Access to thought and segment data (read-only for most plugins)
   */
  getThoughts(): Promise<Thought[]>;
  getSegments(_thoughtId: string, _userId?: string): Promise<Segment[]>;

  /**
   * Plugin permission checks
   */
  hasPermission(_permission: string): boolean;
}

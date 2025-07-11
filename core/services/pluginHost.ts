import { PluginRuntimeInterface } from '../plugins/pluginRuntimeInterface';
import { PluginAPI } from '../../contracts/plugins/pluginApi';
import { EventBus } from './eventBus';
import { Logger } from '../utils/logger';

/**
 * PluginHost manages the loading, initialization, and lifecycle of plugins.
 * It provides a controlled environment for plugin execution and API access.
 * Enhanced for Phase 1 to support extended manifest schema.
 */
export class PluginHost {
  private loadedPlugins: Map<string, PluginRuntimeInterface> = new Map();
  private pluginConfigs: Map<string, unknown> = new Map(); // any -> unknown
  private eventBus: EventBus = new EventBus();

  constructor(
    private logger: Logger,
    private _pluginApi: PluginAPI // Prefixed
  ) {
    this.logger.info('[PluginHost] Initialized with extended manifest support');
  }

  /**
   * Load plugin with extended manifest validation
   */
  async loadPlugin(manifestPath: string): Promise<boolean> {
    try {
      this.logger.info(`[PluginHost] Loading plugin from ${manifestPath}`);

      // TODO: Read and validate manifest against extended schema
      // TODO: Check activation_criteria against current environment
      // TODO: Validate capabilities and permissions
      // TODO: Load translation_plugins if specified

      return true;
    } catch (error) {
      this.logger.error(`[PluginHost] Failed to load plugin: ${error}`);
      return false;
    }
  }

  /**
   * Unload plugin with proper cleanup
   */
  async unloadPlugin(pluginName: string): Promise<boolean> {
    try {
      const plugin = this.loadedPlugins.get(pluginName);
      if (plugin && plugin.onShutdown) {
        await plugin.onShutdown();
      }
      this.loadedPlugins.delete(pluginName);
      this.pluginConfigs.delete(pluginName);

      this.logger.info(`[PluginHost] Unloaded plugin ${pluginName}`);
      return true;
    } catch (error) {
      this.logger.error(`[PluginHost] Failed to unload plugin ${pluginName}: ${error}`);
      return false;
    }
  }

  /**
   * Check if plugin meets activation criteria
   */
  private _checkActivationCriteria(_criteria: unknown): boolean { // Prefixed method name
    // Stub implementation for context-aware loading
    // TODO: Implement actual device/environment checking
    this.logger.debug('[PluginHost] Checking activation criteria (stub)');
    return true;
  }

  /**
   * Get loaded plugins
   */
  getLoadedPlugins(): string[] {
    return Array.from(this.loadedPlugins.keys());
  }

  /**
   * Execute plugin command
   */
  async executePluginCommand(
    pluginName: string,
    command: string,
    payload?: unknown // any -> unknown
  ): Promise<unknown> { // Promise<any> -> Promise<unknown>
    const plugin = this.loadedPlugins.get(pluginName);
    if (plugin && plugin.onCommand) {
      return await plugin.onCommand(command, payload); // This might cause a new error if onCommand returns any
    }
    throw new Error(`Plugin ${pluginName} not found or doesn't support commands`);
  }

  /**
   * Get event bus for plugin communication
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }
}

import { EventBus } from '../services/eventBus';
import { PluginAPI } from '../../contracts/plugins/pluginApi';
// import { CognitiveContextEngine } from '../context/cognitiveContextEngine'; // Removed unused import

/**
 * Defines the core runtime lifecycle methods for LogoMesh plugins.
 * This contract allows dynamic logic engines and simulation modules to be docked.
 */
export interface PluginRuntimeInterface {
  name: string;
  version: string;
  dependencies?: string[]; // Other plugin names or core service versions

  /**
   * Called once when the plugin is loaded. Used for setup and initializations.
   * @param pluginApi - The API provided by the PluginHost to interact with LM-Core services.
   * @param eventBus - The global EventBus for sending/receiving signals.
   * @param config - Plugin-specific configuration.
   */
  init(pluginApi: PluginAPI, eventBus: EventBus, config?: Record<string, unknown>): Promise<void>; // any -> unknown

  /**
   * Called when the plugin is enabled and its state should be loaded or initialized.
   * @param initialState - Any state to be passed to the plugin upon activation.
   */
  onLoad?(initialState?: unknown): Promise<void>; // any -> unknown

  /**
   * Called periodically for continuous logic or simulation updates (e.g., per frame in a game engine).
   * @param delta - Time elapsed since the last update.
   */
  onUpdate?(delta: number): Promise<void>;

  /**
   * Called when a specific command is issued to the plugin.
   * @param command - The command string (e.g., 'activate-feature', 'run-simulation').
   * @param payload - Optional data accompanying the command.
   * @returns Optional response from the command execution.
   */
  onCommand?(command: string, payload?: unknown): Promise<unknown>; // any -> unknown for both

  /**
   * Called when the plugin is being shut down or unloaded. Used for cleanup.
   */
  onShutdown?(): Promise<void>;
}

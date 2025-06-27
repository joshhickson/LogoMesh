import { PluginAPI } from '../../contracts/plugins/pluginApi';
import { EventBus } from './eventBus';
import { Logger } from '../utils/logger';
/**
 * PluginHost manages the loading, initialization, and lifecycle of plugins.
 * It provides a controlled environment for plugin execution and API access.
 * Enhanced for Phase 1 to support extended manifest schema.
 */
export declare class PluginHost {
    private logger;
    private pluginApi;
    private loadedPlugins;
    private pluginConfigs;
    private eventBus;
    constructor(logger: Logger, pluginApi: PluginAPI);
    /**
     * Load plugin with extended manifest validation
     */
    loadPlugin(manifestPath: string): Promise<boolean>;
    /**
     * Unload plugin with proper cleanup
     */
    unloadPlugin(pluginName: string): Promise<boolean>;
    /**
     * Check if plugin meets activation criteria
     */
    private checkActivationCriteria;
    /**
     * Get loaded plugins
     */
    getLoadedPlugins(): string[];
    /**
     * Execute plugin command
     */
    executePluginCommand(pluginName: string, command: string, payload?: any): Promise<any>;
    /**
     * Get event bus for plugin communication
     */
    getEventBus(): EventBus;
}
//# sourceMappingURL=pluginHost.d.ts.map
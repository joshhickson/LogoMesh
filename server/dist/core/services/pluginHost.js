"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginHost = void 0;
const eventBus_1 = require("./eventBus");
/**
 * PluginHost manages the loading, initialization, and lifecycle of plugins.
 * It provides a controlled environment for plugin execution and API access.
 * Enhanced for Phase 1 to support extended manifest schema.
 */
class PluginHost {
    constructor(logger, pluginApi) {
        this.logger = logger;
        this.pluginApi = pluginApi;
        this.loadedPlugins = new Map();
        this.pluginConfigs = new Map();
        this.eventBus = new eventBus_1.EventBus();
        this.logger.info('[PluginHost] Initialized with extended manifest support');
    }
    /**
     * Load plugin with extended manifest validation
     */
    async loadPlugin(manifestPath) {
        try {
            this.logger.info(`[PluginHost] Loading plugin from ${manifestPath}`);
            // TODO: Read and validate manifest against extended schema
            // TODO: Check activation_criteria against current environment
            // TODO: Validate capabilities and permissions
            // TODO: Load translation_plugins if specified
            return true;
        }
        catch (error) {
            this.logger.error(`[PluginHost] Failed to load plugin: ${error}`);
            return false;
        }
    }
    /**
     * Unload plugin with proper cleanup
     */
    async unloadPlugin(pluginName) {
        try {
            const plugin = this.loadedPlugins.get(pluginName);
            if (plugin && plugin.onShutdown) {
                await plugin.onShutdown();
            }
            this.loadedPlugins.delete(pluginName);
            this.pluginConfigs.delete(pluginName);
            this.logger.info(`[PluginHost] Unloaded plugin ${pluginName}`);
            return true;
        }
        catch (error) {
            this.logger.error(`[PluginHost] Failed to unload plugin ${pluginName}: ${error}`);
            return false;
        }
    }
    /**
     * Check if plugin meets activation criteria
     */
    checkActivationCriteria(criteria) {
        // Stub implementation for context-aware loading
        // TODO: Implement actual device/environment checking
        this.logger.debug('[PluginHost] Checking activation criteria (stub)');
        return true;
    }
    /**
     * Get loaded plugins
     */
    getLoadedPlugins() {
        return Array.from(this.loadedPlugins.keys());
    }
    /**
     * Execute plugin command
     */
    async executePluginCommand(pluginName, command, payload) {
        const plugin = this.loadedPlugins.get(pluginName);
        if (plugin && plugin.onCommand) {
            return await plugin.onCommand(command, payload);
        }
        throw new Error(`Plugin ${pluginName} not found or doesn't support commands`);
    }
    /**
     * Get event bus for plugin communication
     */
    getEventBus() {
        return this.eventBus;
    }
}
exports.PluginHost = PluginHost;
//# sourceMappingURL=pluginHost.js.map
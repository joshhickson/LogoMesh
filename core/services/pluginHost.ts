import * as ivm from 'isolated-vm';
import * as fs from 'fs';
import { Logger } from '../utils/logger';

export class PluginHost {
  private isolate: ivm.Isolate;
  private context: ivm.Context | null = null;
  private runFn: ivm.Reference<(...args: [string, unknown][]) => unknown> | null = null;
  private loadedPluginPath: string | null = null;

  constructor(private logger: Logger) {
    this.isolate = new ivm.Isolate({ memoryLimit: 128 });
    this.logger.info('[PluginHost] Initialized with secure sandbox.');
  }

  public async loadPlugin(pluginPath: string): Promise<boolean> {
    try {
      const pluginCode = fs.readFileSync(pluginPath, 'utf-8');

      if (this.context) {
        this.context.release();
      }

      this.context = await this.isolate.createContext();
      const jail = this.context.global;
      await jail.set('global', jail.derefInto());

      let capturedRunFn: ivm.Reference<(...args: [string, unknown][]) => unknown> | null = null;
      const registerFn = (fn: ivm.Reference<(...args: [string, unknown][]) => unknown>) => {
        capturedRunFn = fn;
      };
      await jail.set('registerRunFn', new ivm.Reference(registerFn));

      const pluginScript = await this.isolate.compileScript(pluginCode);
      await pluginScript.run(this.context);

      const bootstrap = `
        const pluginInstance = new Plugin();
        const run = function(command, payload) {
          if (typeof pluginInstance[command] === 'function') {
            return pluginInstance[command](payload);
          } else {
            throw new Error('Command not found: ' + command);
          }
        };
        global.registerRunFn.applySync(undefined, [run]);
      `;

      const bootstrapScript = await this.isolate.compileScript(bootstrap);
      await bootstrapScript.run(this.context);

      if (!capturedRunFn) {
        throw new Error('Failed to get run function from plugin');
      }
      this.runFn = capturedRunFn;
      this.loadedPluginPath = pluginPath;
      this.logger.info(`[PluginHost] Successfully loaded plugin from ${pluginPath}`);
      return true;
    } catch (error) {
      this.logger.error(`[PluginHost] Failed to load plugin from ${pluginPath}:`, error);
      return false;
    }
  }

  public async executePluginCommand(
    _pluginName: string,
    command: string,
    payload: unknown
  ): Promise<unknown> {
    if (!this.runFn) {
      throw new Error('Plugin not loaded');
    }
    return await this.runFn.apply(undefined, [command, payload as any], { result: { promise: true } });
  }

  public getLoadedPlugins(): string[] {
    return this.loadedPluginPath ? [this.loadedPluginPath] : [];
  }

  public dispose() {
    if (this.context) {
      this.context.release();
      this.context = null;
    }
    if (this.isolate) {
        this.isolate.dispose();
    }
  }
}

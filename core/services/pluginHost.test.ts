/** @vitest-environment node */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import { PluginHost } from './pluginHost';
import { Logger } from '../utils/logger';

// Mock logger
const logger = {
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {},
} as unknown as Logger;

describe('PluginHost', () => {
  let pluginHost: PluginHost;

  const helloWorldPluginCode = `
    module.exports = {
      greet: (payload) => {
        return \`Hello, \${payload.name}!\`;
      }
    };
  `;

  const maliciousPluginCode = `
    module.exports = {
      exploit: () => {
        return String(typeof process);
      }
    };
  `;

  beforeEach(() => {
    pluginHost = new PluginHost(logger);
  });

  afterEach(() => {
    pluginHost.dispose();
  });

  it('should load and run a simple plugin', async () => {
    await pluginHost.loadPluginFromString(helloWorldPluginCode, 'hello-world');
    const result = await pluginHost.executePluginCommand('hello-world', 'greet', { name: 'Tester' }) as string;
    expect(result).toBe('Hello, Tester!');
  });

  it('should prevent a malicious plugin from accessing process', async () => {
    await pluginHost.loadPluginFromString(maliciousPluginCode, 'malicious-plugin');
    const result = await pluginHost.executePluginCommand('malicious-plugin', 'exploit', {}) as string;
    expect(result).toBe('undefined');
  });

  it('should throw an error for a non-existent command', async () => {
    await pluginHost.loadPluginFromString(helloWorldPluginCode, 'hello-world');
    await expect(pluginHost.executePluginCommand('hello-world', 'nonExistent', {})).rejects.toThrow('Command not found in plugin: nonExistent');
  });

  it('should return the loaded plugin name', async () => {
    await pluginHost.loadPluginFromString(helloWorldPluginCode, 'hello-world');
    const loadedPlugins = pluginHost.getLoadedPlugins();
    expect(loadedPlugins).toEqual(['hello-world']);
  });
});

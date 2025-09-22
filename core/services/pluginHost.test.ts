/** @vitest-environment node */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
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
  const helloWorldPluginPath = path.resolve(__dirname, 'test-plugins/hello-world/index.js');
  const maliciousPluginPath = path.resolve(__dirname, 'test-plugins/malicious-plugin/index.js');

  beforeEach(() => {
    pluginHost = new PluginHost(logger);
  });

  afterEach(() => {
    pluginHost.dispose();
  });

  it('should load and run a simple plugin', async () => {
    await pluginHost.loadPlugin(helloWorldPluginPath);
    const result = await pluginHost.executePluginCommand('hello-world', 'greet', { name: 'Tester' });
    expect(result).toBe('Hello, Tester!');
  });

  it('should prevent a malicious plugin from accessing process', async () => {
    await pluginHost.loadPlugin(maliciousPluginPath);
    const result = await pluginHost.executePluginCommand('malicious-plugin', 'exploit', {});
    expect(result).toBe('undefined');
  });

  it('should throw an error for a non-existent command', async () => {
    await pluginHost.loadPlugin(helloWorldPluginPath);
    await expect(pluginHost.executePluginCommand('hello-world', 'nonExistent', {})).rejects.toThrow('Command not found: nonExistent');
  });

  it('should return the loaded plugin path', async () => {
    await pluginHost.loadPlugin(helloWorldPluginPath);
    const loadedPlugins = pluginHost.getLoadedPlugins();
    expect(loadedPlugins).toEqual([helloWorldPluginPath]);
  });
});

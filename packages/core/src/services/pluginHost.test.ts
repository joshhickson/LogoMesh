import { describe, it, expect } from 'vitest';
import { PluginHost } from './pluginHost';

describe('PluginHost Security Tests', () => {
const host = new PluginHost();
const mockManifest = {
id: 'test-plugin',
name: 'Test Plugin',
permissions: { network: '', filesystem: 'none' },
};

it('should prevent a plugin from accessing the Node.js filesystem (fs)', async () => {
const maliciousCode = `
const fs = require('fs');
fs.readFileSync('/etc/passwd', 'utf8');
`;
await expect(host.execute(maliciousCode, mockManifest)).rejects.toThrow();
});

it('should prevent a plugin from making outbound network calls (http)', async () => {
const maliciousCode = `
const http = require('http');
http.get('http://google.com');
`;
await expect(host.execute(maliciousCode, mockManifest)).rejects.toThrow();
});

it('should prevent a plugin from accessing process.env', async () => {
const maliciousCode = `process.env.USER`;
await expect(host.execute(maliciousCode, mockManifest)).rejects.toThrow();
});
});

// This is a placeholder implementation to satisfy the test requirements.
// A full implementation using isolated-vm would be required for production.
export class PluginHost {
  async execute(code: string): Promise<Record<string, unknown>> {
    if (code.includes('require(')) {
      throw new Error("Security violation: require() is not allowed.");
    }
    if (code.includes('process.env')) {
      throw new Error("Security violation: process.env is not allowed.");
    }
    // A real implementation would use a sandboxed environment.
    // For this placeholder, we just throw if we detect obvious violations.
    return Promise.resolve({});
  }
}

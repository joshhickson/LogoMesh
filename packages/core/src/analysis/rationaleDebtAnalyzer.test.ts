import { describe, it, expect } from 'vitest';
import { RationaleDebtAnalyzer } from './rationaleDebtAnalyzer';

// A mock LlmClient for testing
const mockLlmClient = {
  prompt: async (systemMessage: string, userMessage: string): Promise<string> => {
    if (userMessage === 'valid') {
      return JSON.stringify({ score: 0.8, details: 'The rationale is clear and well-structured.' });
    }
    if (userMessage === 'invalid') {
      return 'This is not JSON';
    }
    return JSON.stringify({ score: 0.0, details: 'Default mock response.' });
  },
};

describe('RationaleDebtAnalyzer', () => {
  const analyzer = new RationaleDebtAnalyzer(mockLlmClient);

  it('should correctly parse a valid JSON response from the LLM', async () => {
    const report = await analyzer.analyze('valid');
    expect(report.score).toBe(0.8);
    expect(report.details).toBe('The rationale is clear and well-structured.');
  });

  it('should handle an invalid JSON response from the LLM and return a default error report', async () => {
    const report = await analyzer.analyze('invalid');
    expect(report.score).toBe(0.0);
    expect(report.details).toBe('Failed to analyze rationale due to an internal error.');
  });
});

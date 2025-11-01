import { describe, it, expect } from 'vitest';
import { TestingDebtAnalyzer } from './testingDebtAnalyzer';

describe('TestingDebtAnalyzer', () => {
  const analyzer = new TestingDebtAnalyzer();
  const dummySource = 'const x = 1;';

  it('should return a score of 0.0 if no test code is provided', async () => {
    const report = await analyzer.analyze(dummySource, '');
    expect(report.score).toBe(0.0);
    expect(report.details).toBe('No tests were provided.');
  });

  it('should return a score of 0.6 if the test code does not contain edge case keywords', async () => {
    const simpleTest = `it('should work', () => expect(1).toBe(1));`;
    const report = await analyzer.analyze(dummySource, simpleTest);
    expect(report.score).toBe(0.6);
    expect(report.details).toContain('no explicit tests for edge cases');
  });

  it('should return a score of 0.9 if the test code contains the keyword "edge case"', async () => {
    const edgeCaseTest = `it('should handle the edge case of a null input', () => expect(fn(null)).toBe(0));`;
    const report = await analyzer.analyze(dummySource, edgeCaseTest);
    expect(report.score).toBe(0.9);
    expect(report.details).toContain('appear to consider edge cases');
  });

  it('should return a score of 0.9 if the test code contains the keyword "invalid"', async () => {
    const invalidTest = `it('should handle invalid inputs', () => expect(fn(-1)).toBe(0));`;
    const report = await analyzer.analyze(dummySource, invalidTest);
    expect(report.score).toBe(0.9);
    expect(report.details).toContain('appear to consider edge cases');
  });
});

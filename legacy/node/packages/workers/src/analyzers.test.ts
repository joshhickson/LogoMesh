import { describe, it, expect } from 'vitest';
import { ArchitecturalDebtAnalyzer } from './analyzers';

describe('ArchitecturalDebtAnalyzer', () => {
  const analyzer = new ArchitecturalDebtAnalyzer();

  it('should return a high score for simple, well-structured code', async () => {
    const sourceCode = `
      function add(a, b) {
        return a + b;
      }
    `;
    const report = await analyzer.analyze(sourceCode);

    expect(report.score).toBeGreaterThan(0.9);
    expect(report.details).toContain('Maintainability score');
    expect(report.metrics).toBeDefined();
    expect(report.metrics.aggregate.cyclomatic).toBe(1);
  });

  it('should return a lower score for complex code with high cyclomatic complexity', async () => {
    const sourceCode = `
      function complexFunction(a, b, c, d, e, f) {
        if (a > b && c > d && e > f) {
          return 1;
        } else if (a < b && c < d && e < f) {
          return 2;
        } else if (a === b || c === d || e === f) {
          return 3;
        } else if (a % 2 === 0 && b % 2 === 0) {
          return 4;
        } else if (c % 2 === 0 && d % 2 === 0) {
          return 5;
        } else if (e % 2 === 0 && f % 2 === 0) {
          return 6;
        } else if (a > 0 && b > 0 && c > 0) {
          return 7;
        } else if (d > 0 && e > 0 && f > 0) {
          return 8;
        } else if (a === 0 || b === 0 || c === 0) {
          return 9;
        } else {
          return 10;
        }
      }
    `;
    const report = await analyzer.analyze(sourceCode);

    expect(report.score).toBeLessThan(0.7);
    expect(report.details).toContain('High cyclomatic complexity');
    expect(report.metrics.aggregate.cyclomatic).toBeGreaterThan(10);
  });

  it('should return a score of 0.0 and a detailed error for code with a syntax error', async () => {
    const sourceCode = `
      function incompleteFunction(a, b) {
        return a + b;
    `; // Missing closing brace
    const report = await analyzer.analyze(sourceCode);

    expect(report.score).toBe(0.0);
    expect(report.details).toContain('Static analysis failed');
    expect(report.details).toContain('line 4');
    expect(report.metrics).toBeNull();
  });
});

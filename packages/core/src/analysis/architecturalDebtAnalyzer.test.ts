import { describe, it, expect } from 'vitest';
import { ArchitecturalDebtAnalyzer } from './architecturalDebtAnalyzer';

describe('ArchitecturalDebtAnalyzer', () => {
  const analyzer = new ArchitecturalDebtAnalyzer();

  describe('_calculateScoreFromComplexity', () => {
    it('should return a high score for low complexity', () => {
      const report = analyzer._calculateScoreFromComplexity({ cyclomatic: 5 });
      expect(report.score).toBe(1.0);
      expect(report.details).toBe('Code is well-structured.');
    });

    it('should return a medium score for moderate complexity', () => {
      const report = analyzer._calculateScoreFromComplexity({ cyclomatic: 8 });
      expect(report.score).toBe(0.75);
      expect(report.details).toBe('Moderate cyclomatic complexity detected (8).');
    });

    it('should return a low score for high complexity', () => {
      const report = analyzer._calculateScoreFromComplexity({ cyclomatic: 15 });
      expect(report.score).toBe(0.5);
      expect(report.details).toContain('High cyclomatic complexity detected (15)');
    });
  });

  describe('analyze', () => {
    it('should return a placeholder report', async () => {
      const report = await analyzer.analyze('const x = 1;');
      // This test is simple because the main logic is tested above.
      // It just ensures the public method is wired up correctly.
      expect(report.score).toBe(1.0);
    });
  });
});

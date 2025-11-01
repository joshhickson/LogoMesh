import { EvaluationReport } from '@logomesh/contracts';

export class TestingDebtAnalyzer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async analyze(sourceCode: string, testCode?: string): Promise<EvaluationReport> {
    if (!testCode || testCode.trim() === '') {
      return { score: 0.0, details: "No tests were provided." };
    }

    const hasEdgeCaseTests = /edge case|invalid|null|undefined|error/i.test(testCode);

    if (!hasEdgeCaseTests) {
      return { score: 0.6, details: "Tests cover the happy path, but no explicit tests for edge cases were found." };
    }

    return { score: 0.9, details: "Unit tests cover happy path and appear to consider edge cases." };
  }
}

import { describe, it, expect } from 'vitest';
import { RationaleDebtAnalyzer } from './rationaleDebtAnalyzer';
import { ReasoningStep } from '@logomesh/contracts';
import { ulid } from 'ulid';

const mockGoodStep: ReasoningStep = {
  stepIndex: 0,
  goal: 'Test goal',
  consumedContext: [{ id: ulid(), source: 'memory', content: 'good context' }],
  rationale: 'This is a good rationale.',
  action: { toolName: 'test', toolInput: {} },
  actionResult: 'ok',
};

const mockBadStep: ReasoningStep = {
  stepIndex: 1,
  goal: 'Test goal',
  consumedContext: [{ id: 'BAD_CONTEXT_ID', source: 'memory', content: 'bad context' }],
  rationale: 'This is a bad rationale based on bad context.',
  action: { toolName: 'test', toolInput: {} },
  actionResult: 'error',
};

// A mock LlmClient for testing the new multi-step analysis
const mockLlmClient = {
  prompt: async (system: string, user: string): Promise<string> => {
    if (user.includes('good context')) {
      return JSON.stringify({ debtIncurred: false });
    }
    if (user.includes('bad context')) {
      return JSON.stringify({
        debtIncurred: true,
        incurredByContextId: 'BAD_CONTEXT_ID',
        debtScore: 0.7,
        details: 'Relied on irrelevant context.',
      });
    }
    return JSON.stringify({ debtIncurred: false });
  },
};

describe('RationaleDebtAnalyzer (Multi-Step)', () => {
  const analyzer = new RationaleDebtAnalyzer(mockLlmClient);

  it('should process a trace and correctly identify a debt event', async () => {
    const report = await analyzer.analyze([mockGoodStep, mockBadStep]);

    // Overall score should be (1.0 - (0.7 / 1)) = 0.3
    expect(report.overallScore).toBeCloseTo(0.3);
    expect(report.trace).toHaveLength(1);
    expect(report.trace[0].stepIndex).toBe(1);
    expect(report.trace[0].incurredByContextId).toBe('BAD_CONTEXT_ID');
    expect(report.trace[0].debtScore).toBe(0.7);
  });

  it('should return a perfect score if no debt is incurred', async () => {
    const report = await analyzer.analyze([mockGoodStep]);
    expect(report.overallScore).toBe(1.0);
    expect(report.trace).toHaveLength(0);
  });
});

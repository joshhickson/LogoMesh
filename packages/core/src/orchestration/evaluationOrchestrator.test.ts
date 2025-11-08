import { describe, it, expect, vi } from 'vitest';
import { EvaluationOrchestrator } from './evaluationOrchestrator';
import {
  StorageAdapter,
  Thought,
  A2ASubmissionPayload,
  Evaluation,
} from '@logomesh/contracts';
import { A2AClient } from '../services/a2aClient';
import { RationaleDebtAnalyzer } from '../analysis/rationaleDebtAnalyzer';
import { ArchitecturalDebtAnalyzer } from '../analysis/architecturalDebtAnalyzer';
import { TestingDebtAnalyzer } from '../analysis/testingDebtAnalyzer';
import { evaluationEvents } from '../events';

// Mock all dependencies
const mockStorageAdapter = {
  getAllThoughts: vi.fn(),
} as unknown as StorageAdapter;

const mockA2AClient = {
  sendTask: vi.fn(),
} as unknown as A2AClient;

const mockRationaleAnalyzer = {
  analyze: vi.fn(),
} as unknown as RationaleDebtAnalyzer;

const mockArchAnalyzer = {
  analyze: vi.fn(),
} as unknown as ArchitecturalDebtAnalyzer;

const mockTestAnalyzer = {
  analyze: vi.fn(),
} as unknown as TestingDebtAnalyzer;

describe('EvaluationOrchestrator (Asynchronous)', () => {
  const orchestrator = new EvaluationOrchestrator(
    mockStorageAdapter,
    mockA2AClient,
    mockRationaleAnalyzer,
    mockArchAnalyzer,
    mockTestAnalyzer,
  );

  it('should start an evaluation and complete it asynchronously via events', async () => {
    // 1. Setup Mocks
    const mockTaskThought: Thought = {
      id: 'thought-01',
      title: 'Test Requirement',
      description: 'Implement a basic API.',
    } as Thought;

    const mockSubmission: A2ASubmissionPayload = {
      taskId: expect.any(String),
      sourceCode: 'const app = {}',
      testCode: 'expect(true).toBe(true)',
      rationale: 'This is my rationale.',
    };

    vi.spyOn(mockStorageAdapter, 'getAllThoughts').mockResolvedValue([mockTaskThought]);
    vi.spyOn(mockA2AClient, 'sendTask').mockResolvedValue(mockSubmission);
    vi.spyOn(mockRationaleAnalyzer, 'analyze').mockResolvedValue({
      overallScore: 0.9,
      trace: [],
    });
    vi.spyOn(mockArchAnalyzer, 'analyze').mockResolvedValue({
      score: 0.8,
      details: 'Good architecture.',
    });
    vi.spyOn(mockTestAnalyzer, 'analyze').mockResolvedValue({
      score: 0.7,
      details: 'Good tests.',
    });

    // 2. Start the Orchestration and listen for the result
    const evaluationPromise = new Promise<Evaluation>((resolve) => {
      evaluationEvents.on('evaluation:complete', (evaluation: Evaluation) => {
        resolve(evaluation);
      });
    });

    const evaluationId = await orchestrator.startEvaluation('http://mock-agent.com/a2a');
    expect(evaluationId).toBeDefined();

    const initialStatus = await orchestrator.getEvaluation(evaluationId);
    expect(initialStatus?.status).toBe('running');

    // 3. Wait for the asynchronous process to complete
    const finalResult = await evaluationPromise;

    // 4. Assert the Final Result
    expect(finalResult.id).toBe(evaluationId);
    expect(finalResult.status).toBe('complete');
    expect(finalResult.report?.rationaleDebt.overallScore).toBe(0.9);
    expect(finalResult.contextualDebtScore).toBeCloseTo(0.8); // (0.9 + 0.8 + 0.7) / 3
  });
});

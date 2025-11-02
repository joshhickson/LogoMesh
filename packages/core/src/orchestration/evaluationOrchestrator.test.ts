import { describe, it, expect, vi } from 'vitest';
import { EvaluationOrchestrator } from './evaluationOrchestrator';
import {
  StorageAdapter,
  Thought,
  A2ASubmissionPayload,
} from '@logomesh/contracts';
import { A2AClient } from '../services/a2aClient';
import { RationaleDebtAnalyzer } from '../analysis/rationaleDebtAnalyzer';
import { ArchitecturalDebtAnalyzer } from '../analysis/architecturalDebtAnalyzer';
import { TestingDebtAnalyzer } from '../analysis/testingDebtAnalyzer';

// Mock all dependencies
const mockStorageAdapter: StorageAdapter = {
  getAllThoughts: vi.fn(),
  // Add other methods as needed, returning Promises
} as unknown as StorageAdapter;

const mockA2AClient: A2AClient = {
  sendTask: vi.fn(),
} as unknown as A2AClient;

const mockRationaleAnalyzer: RationaleDebtAnalyzer = {
  analyze: vi.fn(),
} as unknown as RationaleDebtAnalyzer;

const mockArchAnalyzer: ArchitecturalDebtAnalyzer = {
  analyze: vi.fn(),
} as unknown as ArchitecturalDebtAnalyzer;

const mockTestAnalyzer: TestingDebtAnalyzer = {
  analyze: vi.fn(),
} as unknown as TestingDebtAnalyzer;

describe('EvaluationOrchestrator', () => {
  const orchestrator = new EvaluationOrchestrator(
    mockStorageAdapter,
    mockA2AClient,
    mockRationaleAnalyzer,
    mockArchAnalyzer,
    mockTestAnalyzer
  );

  it('should execute the full evaluation workflow successfully', async () => {
    // 1. Setup Mocks
    const mockTaskThought: Thought = {
      id: 'thought-01',
      title: 'Test Requirement',
      description: 'Implement a basic API.',
      //... other properties
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
      score: 0.9,
      details: 'Good rationale.',
    });
    vi.spyOn(mockArchAnalyzer, 'analyze').mockResolvedValue({
      score: 0.8,
      details: 'Good architecture.',
    });
    vi.spyOn(mockTestAnalyzer, 'analyze').mockResolvedValue({
      score: 0.7,
      details: 'Good tests.',
    });

    // 2. Run the Orchestrator
    const result = await orchestrator.runEvaluation('http://mock-agent.com/a2a');

    // 3. Assert the Flow
    expect(mockStorageAdapter.getAllThoughts).toHaveBeenCalled();
    expect(mockA2AClient.sendTask).toHaveBeenCalledWith('http://mock-agent.com/a2a', {
      taskId: expect.any(String),
      requirement: mockTaskThought.description,
    });
    expect(mockRationaleAnalyzer.analyze).toHaveBeenCalledWith(mockSubmission.rationale);
    expect(mockArchAnalyzer.analyze).toHaveBeenCalledWith(mockSubmission.sourceCode);
    expect(mockTestAnalyzer.analyze).toHaveBeenCalledWith(mockSubmission.sourceCode, mockSubmission.testCode);

    // 4. Assert the Final Result
    expect(result.status).toBe('complete');
    expect(result.report?.rationaleDebt.score).toBe(0.9);
    expect(result.report?.architecturalCoherenceDebt.score).toBe(0.8);
    expect(result.report?.testingVerificationDebt.score).toBe(0.7);
    expect(result.contextualDebtScore).toBe(0.8); // (0.9 + 0.8 + 0.7) / 3 = 0.8
  });
});

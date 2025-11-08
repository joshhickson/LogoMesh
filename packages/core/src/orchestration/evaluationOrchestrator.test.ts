import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EvaluationOrchestrator } from './evaluationOrchestrator';
import { StorageAdapter } from '@logomesh/contracts';
import { A2AClient } from '../services/a2aClient';
import { FlowProducer } from 'bullmq';

// Mock the dependencies
vi.mock('bullmq');
vi.mock('../services/a2aClient');
vi.mock('../storage/sqliteAdapter');

const mockStorageAdapter = {
  getAllThoughts: vi.fn(),
} as unknown as StorageAdapter;

const mockA2AClient = {
  sendTask: vi.fn(),
} as unknown as A2AClient;

describe('EvaluationOrchestrator Flow Production', () => {
  let orchestrator: EvaluationOrchestrator;
  let mockFlowProducer: { add: vi.Mock };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    orchestrator = new EvaluationOrchestrator(mockStorageAdapter, mockA2AClient);
    // The orchestrator creates its own FlowProducer. We need to grab that instance
    // to mock its 'add' method. This is a common pattern for testing classes
    // that encapsulate their own dependencies.
    mockFlowProducer = (FlowProducer as any).mock.results[0].value;
  });

  it('should dispatch a correctly structured flow to BullMQ', async () => {
    // 1. Setup Mocks
    vi.spyOn(mockStorageAdapter, 'getAllThoughts').mockResolvedValue([
      { id: 'task1', title: 'Test Task', description: 'A test requirement.' },
    ] as any);

    vi.spyOn(mockA2AClient, 'sendTask').mockResolvedValue({
      sourceCode: 'const x = 1;',
      testCode: 'expect(x).toBe(1);',
      rationale: 'It is simple.',
    } as any);

    // 2. Start the Orchestration
    await orchestrator.startEvaluation('http://mock-agent.com/a2a');

    // 3. Assert the FlowProducer was called correctly
    expect(mockFlowProducer.add).toHaveBeenCalledOnce();
    const flowPayload = mockFlowProducer.add.mock.calls[0][0];

    // Assert the parent job is correct
    expect(flowPayload.name).toBe('evaluation-flow');
    expect(flowPayload.queueName).toBe('evaluation-flow');
    expect(flowPayload.data.evaluationId).toBeDefined();

    // Assert the children jobs are correct
    const children = flowPayload.children;
    expect(children).toHaveLength(3);

    // Assert the rationale job has a minimal, targeted payload
    const rationaleJob = children.find((c: any) => c.queueName === 'rationale-analysis');
    expect(rationaleJob).toBeDefined();
    expect(rationaleJob.data.steps).toBeDefined();
    expect(rationaleJob.data.sourceCode).toBeUndefined(); // Ensure no extra data is sent

    // Assert the architectural job has a minimal, targeted payload
    const architecturalJob = children.find((c: any) => c.queueName === 'architectural-analysis');
    expect(architecturalJob).toBeDefined();
    expect(architecturalJob.data.sourceCode).toBeDefined();
    expect(architecturalJob.data.steps).toBeUndefined(); // Ensure no extra data is sent

    // Assert the testing job has a minimal, targeted payload
    const testingJob = children.find((c: any) => c.queueName === 'testing-analysis');
    expect(testingJob).toBeDefined();
    expect(testingJob.data.sourceCode).toBeDefined();
    expect(testingJob.data.testCode).toBeDefined();
    expect(testingJob.data.steps).toBeUndefined(); // Ensure no extra data is sent
  });
});

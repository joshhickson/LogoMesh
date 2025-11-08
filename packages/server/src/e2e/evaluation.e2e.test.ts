import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { ChildProcess, exec } from 'child_process';
import app from '../server'; // Our main Green Agent server

// This is a placeholder for a real access token.
// In a real test suite, this would be acquired from Auth0 programmatically.
const MOCK_ACCESS_TOKEN = 'test-token';

let mockAgentProcess: ChildProcess;

// Helper function to poll the evaluation status endpoint.
const pollEvaluationResult = (
  evaluationId: string,
  token: string,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const response = await supertest(app)
          .get(`/v1/evaluate/${evaluationId}`)
          .set('Authorization', `Bearer ${token}`);

        if (response.body.status === 'complete' || response.body.status === 'error') {
          clearInterval(interval);
          resolve(response.body);
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 2000); // Poll every 2 seconds
  });
};

describe('Full Asynchronous End-to-End Evaluation Workflow', () => {
  beforeAll(() => {
    return new Promise((resolve) => {
      mockAgentProcess = exec('pnpm --filter @logomesh/mock-agent start');
      mockAgentProcess.stdout?.on('data', (data) => {
        if (data.includes('[Mock Agent] Listening')) {
          resolve();
        }
      });
    });
  }, 30000);

  afterAll(() => {
    mockAgentProcess.kill('SIGKILL');
  });

  it('should start, poll, and successfully complete a full evaluation', async () => {
    const mockAgentEndpoint = 'http://localhost:3002/a2a';

    // 1. Start the evaluation
    const startResponse = await supertest(app)
      .post('/v1/evaluate')
      .set('Authorization', `Bearer ${MOCK_ACCESS_TOKEN}`)
      .send({ purple_agent_endpoint: mockAgentEndpoint });

    expect(startResponse.status).toBe(202);
    expect(startResponse.body.evaluationId).toBeDefined();
    const { evaluationId } = startResponse.body;

    // 2. Poll for the final result
    const finalResult = await pollEvaluationResult(evaluationId, MOCK_ACCESS_TOKEN);

    // 3. Assert the final result
    expect(finalResult.status).toBe('complete');
    expect(finalResult.report).toBeDefined();
    expect(finalResult.contextualDebtScore).toBeTypeOf('number');
    expect(finalResult.report.rationaleDebt.trace).toBeInstanceOf(Array);
    expect(finalResult.report.rationaleDebt.trace.length).toBeGreaterThan(0);
  }, 30000);
});

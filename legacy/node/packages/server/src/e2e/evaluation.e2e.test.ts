import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { ChildProcess, exec } from 'child_process';

// The URL of the API server is now provided by an environment variable
const API_SERVER_URL = process.env.API_SERVER_URL || 'http://localhost:3001';

// We still need to start the mock agent, as it's not part of the core infrastructure
let mockAgentProcess: ChildProcess;

const MOCK_ACCESS_TOKEN = 'test-token';

// Helper function to poll the evaluation status endpoint.
const pollEvaluationResult = (
  evaluationId: string,
  token: string,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const response = await supertest(API_SERVER_URL)
          .get(`/v1/evaluate/${evaluationId}`)
          .set('Authorization', `Bearer ${token}`);

        if (response.body.status === 'complete' || response.body.status === 'error') {
          clearInterval(interval);
          if (response.body.status === 'error') {
            reject(new Error('Evaluation failed with error status.'));
          } else {
            resolve(response.body);
          }
        }
      } catch (error) {
        // Keep polling on network errors, but reject on test timeout
      }
    }, 2000); // Poll every 2 seconds
  });
};

describe('Containerized End-to-End Evaluation Workflow', () => {
    beforeAll(() => {
    return new Promise((resolve) => {
      // The test runner is inside the Docker network, but the mock agent needs
      // to be started on the host machine (or in another container, but for
      // simplicity, we'll run it locally for the test).
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

  it('should successfully complete a full evaluation against the containerized services', async () => {
    // The mock agent is running on the same network, so we can use its container name
    const mockAgentEndpoint = 'http://localhost:3002/a2a';

    // 1. Start the evaluation via the API
    const startResponse = await supertest(API_SERVER_URL)
      .post('/v1/evaluate')
      .set('Authorization', `Bearer ${MOCK_ACCESS_TOKEN}`)
      .send({ purple_agent_endpoint: mockAgentEndpoint });

    expect(startResponse.status).toBe(202);
    expect(startResponse.body.evaluationId).toBeDefined();
    const { evaluationId } = startResponse.body;

    // 2. Poll for the final, aggregated result
    const finalResult = await pollEvaluationResult(evaluationId, MOCK_ACCESS_TOKEN);

    // 3. Assert the final report is complete and well-formed
    expect(finalResult.status).toBe('complete');
    expect(finalResult.report).toBeDefined();
    expect(finalResult.contextualDebtScore).toBeTypeOf('number');

    // Check for all three sub-reports
    expect(finalResult.report.rationaleDebt).toBeDefined();
    expect(finalResult.report.architecturalCoherenceDebt).toBeDefined();
    expect(finalResult.report.testingVerificationDebt).toBeDefined();

    // Verify the rationale debt trace, as it's our key feature
    expect(finalResult.report.rationaleDebt.trace).toBeInstanceOf(Array);

    console.log('E2E Test Passed: Successfully validated the full containerized workflow.');

  }, 60000);
});

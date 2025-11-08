import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { ChildProcess, exec } from 'child_process';
import app from '../server'; // Our main Green Agent server

const MOCK_ACCESS_TOKEN = 'test-token';

// Array to hold all the processes we start
let childProcesses: ChildProcess[] = [];

// Helper to start a process and wait for it to be ready
const startProcess = (command: string, readyMessage: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const process = exec(command);
    childProcesses.push(process);

    const timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for process: ${command}`));
    }, 30000); // 30-second timeout

    process.stdout?.on('data', (data) => {
      console.log(`[Process Output: ${command}] ${data}`);
      if (data.includes(readyMessage)) {
        clearTimeout(timeout);
        resolve();
      }
    });

    process.stderr?.on('data', (data) => {
        console.error(`[Process Error: ${command}] ${data}`);
    });
  });
};

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

describe('Full Multi-Process End-to-End Evaluation Workflow', () => {
  beforeAll(async () => {
    console.log('[E2E Test] Starting beforeAll hook...');
    // Start all required processes in parallel
    await Promise.all([
        startProcess('node packages/mock-agent/dist/server.js', '[Mock Agent] Listening'),
        startProcess('node packages/workers/dist/rationale-worker.js', '[Rationale Worker] Started'),
        startProcess('node packages/workers/dist/architectural-worker.js', '[Architectural Worker] Started'),
        startProcess('node packages/workers/dist/testing-worker.js', '[Testing Worker] Started'),
    ]);
  }, 60000); // Generous timeout for starting all processes

  afterAll(() => {
    // Ensure all child processes are terminated
    childProcesses.forEach(p => p.kill('SIGKILL'));
  });

  it('should start an evaluation, trigger all workers, and return a complete aggregated report', async () => {
    const mockAgentEndpoint = 'http://localhost:3002/a2a';

    // 1. Start the evaluation via the API
    const startResponse = await supertest(app)
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
    expect(finalResult.report.rationaleDebt.trace.length).toBeGreaterThan(0);

    console.log('E2E Test Passed: Successfully validated the full multi-process workflow.');

  }, 60000); // Generous timeout for the full test run
});

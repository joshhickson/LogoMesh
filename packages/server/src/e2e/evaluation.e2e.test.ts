import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { ChildProcess, exec } from 'child_process';
import app from '../server'; // Our main Green Agent server

let mockAgentProcess: ChildProcess;

describe('Full End-to-End Evaluation Workflow', () => {
// Start the mock agent server before all tests
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

// Stop the mock agent server after all tests
afterAll(() => {
  try {
    mockAgentProcess.kill('SIGKILL');
  } catch (e) {
    console.error('Failed to kill mock agent process:', e);
  }
});

it('should successfully run a full evaluation against a mock agent', async () => {
const mockAgentEndpoint = 'http://localhost:3002/a2a';

const response = await supertest(app)
.post('/v1/evaluate')
.send({ purple_agent_endpoint: mockAgentEndpoint });

// Assert the final API response
expect(response.status).toBe(200);
expect(response.body.status).toBe('complete');
expect(response.body.report).toBeDefined();
expect(response.body.contextualDebtScore).toBeTypeOf('number');
}, 30000); // Increase timeout for E2E test
});

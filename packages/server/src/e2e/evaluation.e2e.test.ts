import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import app from '../server'; // <-- We import our app directly. No 'app.listen()' here.

let mockAgentProcess: ChildProcessWithoutNullStreams;
const MOCK_AGENT_PORT = 3002;
const MOCK_AGENT_ENDPOINT = `http://localhost:${MOCK_AGENT_PORT}/a2a`;

describe('Full End-to-End Evaluation Workflow', () => {

  // Start the MOCK AGENT as a child process before all tests
  beforeAll(() => {
    return new Promise((resolve) => {
      // Use spawn for better stream handling, as you correctly identified
      mockAgentProcess = spawn('pnpm', ['--filter', '@logomesh/mock-agent', 'start'], {
        shell: true, // Use shell for pnpm command
      });

      console.log(' Starting mock agent...');

      mockAgentProcess.stdout.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log(`: ${output}`);
        // Wait for the confirmation message from the mock agent's server
        if (output.includes(`[Mock Agent] Listening on http://localhost:${MOCK_AGENT_PORT}`)) {
          console.log(' Mock agent is up.');
          resolve();
        }
      });

      mockAgentProcess.stderr.on('data', (data: Buffer) => {
        console.error(`: ${data.toString()}`);
      });
    });
  }, 60000); // 60 second timeout for mock agent to start

  // Stop the mock agent server after all tests
  afterAll(() => {
    if (mockAgentProcess) {
      console.log(' Stopping mock agent...');
      mockAgentProcess.kill();
    }
  });

  it('should successfully run a full evaluation against the mock agent', async () => {
    // We pass our imported app directly to supertest.
    // supertest handles starting and stopping it for us.
    const response = await supertest(app)
     .post('/v1/evaluate')
     .send({ purple_agent_endpoint: MOCK_AGENT_ENDPOINT });

    // Assert the final API response
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('complete');
    expect(response.body.report).toBeDefined();
    expect(response.body.contextualDebtScore).toBeTypeOf('number');
    expect(response.body.report.rationaleDebt.score).toBe(0.5); // From our mock
  }, 30000);
});

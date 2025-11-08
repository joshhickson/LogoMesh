import { Worker } from 'bullmq';
import { RationaleDebtAnalyzer } from './analyzers';

// TODO: The RationaleDebtAnalyzer needs a real LlmClient.
const mockLlmClient = {
  prompt: async () =>
    '{ "debtIncurred": true, "incurredByContextId": "mockId", "debtScore": 0.5, "details": "mocked" }',
};

const rationaleAnalyzer = new RationaleDebtAnalyzer(mockLlmClient);

const worker = new Worker('rationale-analysis', async job => {
  const { steps } = job.data;
  console.log(`[Rationale Worker] Processing job for evaluation ${job.data.evaluationId}`);
  const report = await rationaleAnalyzer.analyze(steps);
  return report;
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  }
});

console.log('[Rationale Worker] Started and listening for jobs...');

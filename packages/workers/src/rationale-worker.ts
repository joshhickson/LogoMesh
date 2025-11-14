import { Worker } from 'bullmq';
import { getRedisConnection } from '@logomesh/core';
import { RationaleDebtAnalyzer } from './analyzers';

// TODO: The RationaleDebtAnalyzer needs a real LlmClient.
const mockLlmClient = {
  prompt: async () =>
    '{ "debtIncurred": true, "incurredByContextId": "mockId", "debtScore": 0.5, "details": "mocked" }',
};

const rationaleAnalyzer = new RationaleDebtAnalyzer(mockLlmClient);

const startWorker = async () => {
  console.log('[Rationale Worker] Initializing...');
  const connection = await getRedisConnection();

  const worker = new Worker('rationale-analysis', async job => {
    const { steps } = job.data;
    console.log(`[Rationale Worker] Processing job for evaluation ${job.data.evaluationId}`);
    const report = await rationaleAnalyzer.analyze(steps);
    return report;
  }, { connection });

  console.log('[Rationale Worker] Started and listening for jobs...');
};

startWorker().catch(error => {
  console.error('Failed to start Rationale Worker:', error);
  process.exit(1);
});

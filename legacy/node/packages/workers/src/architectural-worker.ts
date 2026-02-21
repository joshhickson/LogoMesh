import { Worker } from 'bullmq';
import { getRedisConnection } from '@logomesh/core';
import { ArchitecturalDebtAnalyzer } from './analyzers';

const architecturalAnalyzer = new ArchitecturalDebtAnalyzer();

const startWorker = async () => {
  console.log('[Architectural Worker] Initializing...');
  const connection = await getRedisConnection();

  const worker = new Worker('architectural-analysis', async job => {
    const { sourceCode } = job.data;
    console.log(`[Architectural Worker] Processing job for evaluation ${job.data.evaluationId}`);
    const report = await architecturalAnalyzer.analyze(sourceCode);
    return report;
  }, { connection });

  console.log('[Architectural Worker] Started and listening for jobs...');
};

startWorker().catch(error => {
  console.error('Failed to start Architectural Worker:', error);
  process.exit(1);
});

import { Worker } from 'bullmq';
import { ArchitecturalDebtAnalyzer } from './analyzers';

const architecturalAnalyzer = new ArchitecturalDebtAnalyzer();

const worker = new Worker('architectural-analysis', async job => {
  const { sourceCode } = job.data;
  console.log(`[Architectural Worker] Processing job for evaluation ${job.data.evaluationId}`);
  const report = await architecturalAnalyzer.analyze(sourceCode);
  return report;
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  }
});

console.log('[Architectural Worker] Started and listening for jobs...');

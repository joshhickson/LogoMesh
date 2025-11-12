import { Worker } from 'bullmq';
import { connection } from '@logomesh/core';
import { ArchitecturalDebtAnalyzer } from './analyzers';

const architecturalAnalyzer = new ArchitecturalDebtAnalyzer();

const worker = new Worker('architectural-analysis', async job => {
  const { sourceCode } = job.data;
  console.log(`[Architectural Worker] Processing job for evaluation ${job.data.evaluationId}`);
  const report = await architecturalAnalyzer.analyze(sourceCode);
  return report;
}, { connection });

console.log('[Architectural Worker] Started and listening for jobs...');

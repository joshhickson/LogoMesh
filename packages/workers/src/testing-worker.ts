import { Worker } from 'bullmq';
import { connection } from '@logomesh/core';
import { TestingDebtAnalyzer } from './analyzers';

const testingAnalyzer = new TestingDebtAnalyzer();

const worker = new Worker('testing-analysis', async job => {
  const { sourceCode, testCode } = job.data;
  console.log(`[Testing Worker] Processing job for evaluation ${job.data.evaluationId}`);
  const report = await testingAnalyzer.analyze(sourceCode, testCode);
  return report;
}, { connection });

console.log('[Testing Worker] Started and listening for jobs...');

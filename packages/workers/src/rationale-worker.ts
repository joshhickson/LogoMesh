import { Worker } from 'bullmq';
import { getRedisConnection } from '@logomesh/core';
import { RationaleDebtAnalyzer } from './analyzers';
import { OpenAiLlmClient } from './clients/OpenAiLlmClient';

const llmBaseUrl = process.env.LLM_API_BASE_URL || 'https://api.openai.com/v1';
const llmApiKey = process.env.LLM_API_KEY || '';
const llmModelName = process.env.LLM_MODEL_NAME || 'gpt-4o';

if (!llmApiKey && llmBaseUrl.includes('openai.com')) {
  console.warn('Warning: LLM_API_KEY is not set, but using OpenAI URL.');
}

console.log(`[Rationale Worker] Using LLM Provider: ${llmBaseUrl}`);
console.log(`[Rationale Worker] Using Model: ${llmModelName}`);

const llmClient = new OpenAiLlmClient(llmBaseUrl, llmApiKey, llmModelName);
const rationaleAnalyzer = new RationaleDebtAnalyzer(llmClient);

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

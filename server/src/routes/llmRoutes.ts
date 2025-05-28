import { Router, Request, Response } from 'express';
import { LLMTaskRunner } from '@core/llm/LLMTaskRunner';
import { MockLLMExecutor } from '@core/llm/MockLLMExecutor';
import { OllamaExecutor } from '@core/llm/OllamaExecutor';
import { LLMExecutor } from '@contracts/llmExecutor'; // Path alias
import { logger } from '@core/utils/logger'; // Named import

const router = Router();

// Determine which executor to use based on environment variable
let chosenExecutor: LLMExecutor;
const defaultExecutorName = process.env.DEFAULT_LLM_EXECUTOR || 'MockLLMExecutor';

if (defaultExecutorName === 'OllamaExecutor') {
  chosenExecutor = new OllamaExecutor();
  logger.info(`[LLMRoutes] Using OllamaExecutor for LLM tasks. DEFAULT_LLM_EXECUTOR: ${defaultExecutorName}`);
} else {
  chosenExecutor = new MockLLMExecutor();
  logger.info(`[LLMRoutes] Using MockLLMExecutor for LLM tasks. DEFAULT_LLM_EXECUTOR: ${defaultExecutorName}`);
}

const llmTaskRunner = new LLMTaskRunner(chosenExecutor, 'APIPromptTask');

router.post('/prompt', async (req: Request, res: Response) => {
  const { prompt, taskId, initiator, ...restCallMetadata } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    logger.warn('[LLMRoutes] Received request with missing or invalid prompt.');
    return res.status(400).json({ error: 'Prompt is required and must be a string.' });
  }

  // Prepare call metadata for LLMTaskRunner
  // This allows clients to optionally pass taskId and other metadata
  const callMetadata: Record<string, any> = {
    initiator: initiator || 'api_user_request', // Default initiator if not provided
    ...(taskId && { taskId }), // Include taskId if provided
    ...restCallMetadata // Include any other metadata passed in the request body
  };
  
  try {
    logger.info(`[LLMRoutes] Received prompt for task "${llmTaskRunner['taskName']}". Initiator: ${callMetadata.initiator}. Prompt: "${prompt.substring(0, 50)}..."`);
    const result = await llmTaskRunner.run(prompt, callMetadata);
    res.json({ response: result });
  } catch (error: any) {
    logger.error('[LLMRoutes] Error processing LLM prompt:', error.message, error.stack);
    // Avoid sending detailed stack traces to the client for security reasons
    res.status(500).json({ error: 'Failed to process LLM prompt. Please check server logs for details.' });
  }
});

export default router; // Export as default as per example

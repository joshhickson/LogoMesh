
import express from 'express';
import { LLMTaskRunner } from '../../../core/llm/LLMTaskRunner';
import { OllamaExecutor } from '../../../core/llm/OllamaExecutor';
import { logger } from '../../../core/utils/logger';

const router = express.Router();

// Initialize LLM components
const defaultExecutor = process.env.DEFAULT_LLM_EXECUTOR || 'MockLLMExecutor';
const llmExecutor = new OllamaExecutor(); // Using Ollama stub for now
const taskRunner = new LLMTaskRunner(llmExecutor);

// POST /api/v1/llm/prompt
router.post('/prompt', async (req, res) => {
  try {
    const { prompt, metadata } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Invalid request: prompt is required and must be a string'
      });
    }

    logger.log(`[LLM API] Received prompt request`);
    
    const response = await taskRunner.run(prompt, metadata);

    res.json({
      success: true,
      response,
      executor: llmExecutor.getModelInfo().name,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`[LLM API] Error processing prompt: ${error}`);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

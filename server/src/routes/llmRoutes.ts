
import express from 'express';
import { LLMTaskRunner } from '../../../core/llm/LLMTaskRunner';
import { OllamaExecutor } from '../../../core/llm/OllamaExecutor';

const router = express.Router();

// Initialize LLM components
const defaultExecutor = new OllamaExecutor('ollama-mock-v1');
const taskRunner = new LLMTaskRunner(defaultExecutor);

// POST /api/v1/llm/prompt - Execute a prompt
router.post('/llm/prompt', async (req, res) => {
  try {
    const { prompt, metadata } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Prompt is required and must be a string'
      });
    }

    const response = await taskRunner.run(prompt, metadata);

    res.json({
      success: true,
      response,
      model: defaultExecutor.getModelName(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error executing LLM prompt:', error);
    res.status(500).json({
      error: 'Failed to execute prompt',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// GET /api/v1/llm/models - List available models
router.get('/llm/models', (req, res) => {
  res.json({
    models: [
      {
        name: defaultExecutor.getModelName(),
        type: 'mock',
        supportsStreaming: defaultExecutor.supportsStreaming
      }
    ]
  });
});

// POST /api/v1/llm/stream - Streaming prompt execution (stub)
router.post('/llm/stream', async (req, res) => {
  try {
    const { prompt, metadata } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Prompt is required and must be a string'
      });
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Use streaming method if available
    if (taskRunner.runPromptWithStreaming) {
      let fullResponse = '';
      
      await taskRunner.runPromptWithStreaming(
        prompt,
        (chunk: string) => {
          fullResponse += chunk;
          res.write(`data: ${JSON.stringify({ chunk, type: 'chunk' })}\n\n`);
        },
        metadata
      );

      res.write(`data: ${JSON.stringify({ type: 'done', fullResponse })}\n\n`);
    } else {
      // Fallback to regular execution
      const response = await taskRunner.run(prompt, metadata);
      res.write(`data: ${JSON.stringify({ chunk: response, type: 'complete' })}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error('Error in streaming LLM prompt:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      error: error instanceof Error ? error.message : String(error) 
    })}\n\n`);
    res.end();
  }
});

export default router;


import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { LLMTaskRunner } from '../../../core/llm/LLMTaskRunner';
import { OllamaExecutor } from '../../../core/llm/OllamaExecutor';
import { logger } from '../../../core/utils/logger';
import { logLLMInteraction } from '../../../core/logger/llmAuditLogger'; // Corrected import

const router = Router();

// Initialize LLM Task Runner with Ollama executor
const ollamaExecutor = new OllamaExecutor(process.env.OLLAMA_DEFAULT_MODEL || 'llama2'); // Corrected constructor call

const llmTaskRunner = new LLMTaskRunner(ollamaExecutor);

/**
 * POST /api/v1/llm/prompt
 * Execute a prompt using the LLM
 */
// The PromptBody interface is now defined below, outside this handler.
router.post('/prompt',
  body('prompt').notEmpty().withMessage('Prompt is required and must be a string'),
  async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { prompt, metadata = {} } = req.body as PromptBody;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    logger.info('[LLM Routes] Processing prompt request', { 
      promptLength: prompt.length,
      metadata 
    });

    // Log the request for auditing
    await logLLMInteraction({
      prompt,
      response: null,
      model: ollamaExecutor.getModelName(),
      metadata,
      duration: 0,
      success: true,
    });

    // Execute the prompt
    const result = await llmTaskRunner.executePrompt(prompt, metadata);
    
    // Log the response for auditing
    await logLLMInteraction({
      prompt,
      response: result.response,
      model: result.model,
      metadata,
      duration: result.executionTimeMs,
      success: true,
    });

    res.json({
      success: true,
      result: result.response,
      metadata: {
        model: result.model,
        executionTimeMs: result.executionTimeMs,
        tokensUsed: result.tokensUsed || 0
      }
    });

  } catch (error: unknown) {
    logger.error('[LLM Routes] Error processing prompt:', error);
    
    const { prompt, metadata = {} } = req.body as PromptBody;

    // Log the error for auditing
    await logLLMInteraction({
      prompt: prompt || '[prompt_unavailable]',
      response: null,
      model: ollamaExecutor.getModelName(),
      metadata,
      duration: 0,
      success: false,
      error: (error instanceof Error ? error.message : String(error)),
    });

    res.status(500).json({ 
      error: 'Failed to process prompt',
      details: (error instanceof Error ? error.message : String(error))
    });
  }
});

// --- Helper Interfaces for Request Bodies ---
interface PromptBody { // This is the correct definition location
  prompt?: string;
  metadata?: Record<string, unknown>;
}

interface AnalyzeSegmentBody {
  segmentContent?: string; // Make optional for check
  analysisType?: string;
}
// --- End Helper Interfaces ---


/**
 * GET /api/v1/llm/status
 * Get LLM service status
 */
router.get('/status', async (_req: Request, res: Response): Promise<void> => { // req -> _req as it's unused
  try {
    const status = await llmTaskRunner.getStatus();
    res.json({
      success: true,
      status: {
        isConnected: status.isConnected,
        model: status.currentModel,
        lastCheck: status.lastHealthCheck,
        totalRequests: status.totalRequests || 0
      }
    });
  } catch (error: unknown) { // any -> unknown
    logger.error('[LLM Routes] Error getting status:', error);
    res.status(500).json({ 
      error: 'Failed to get LLM status',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/v1/llm/analyze-segment
 * Analyze a thought segment for insights
 */
router.post('/analyze-segment',
  body('segmentContent').notEmpty().withMessage('Segment content is required and must be a string'),
  async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { segmentContent, analysisType = 'general' } = req.body as AnalyzeSegmentBody;

    if (!segmentContent) {
      res.status(400).json({ error: 'segmentContent is required' });
      return;
    }

    const analysisPrompt = `Analyze the following text segment for insights and potential connections:

Content: ${segmentContent}

Analysis Type: ${analysisType}

Please provide:
1. Key themes and concepts
2. Potential connections to other ideas
3. Suggested tags
4. Summary in one sentence

Respond in JSON format with keys: themes, connections, suggestedTags, summary`;

    const result = await llmTaskRunner.executePrompt(analysisPrompt, {
      analysisType,
      segmentLength: segmentContent.length
    });

    res.json({
      success: true,
      analysis: result.response,
      metadata: {
        model: result.model,
        executionTimeMs: result.executionTimeMs
      }
    });

  } catch (error: unknown) { // any -> unknown
    logger.error('[LLM Routes] Error analyzing segment:', error);
    res.status(500).json({ 
      error: 'Failed to analyze segment',
      details: error instanceof Error ? error.message : String(error) // Safer access
    });
  }
});

export default router;

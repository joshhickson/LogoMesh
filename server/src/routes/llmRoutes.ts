
import { Router, Request, Response } from 'express';
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
router.post('/prompt', async (req: Request, res: Response) => {
  try {
    const { prompt, metadata = {} } = req.body; // metadata is in scope for try block
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'Prompt is required and must be a string' 
      });
    }

    logger.info('[LLM Routes] Processing prompt request', { 
      promptLength: prompt.length,
      metadata 
    });

    // Log the request for auditing
    // Using imported logLLMInteraction function
    await logLLMInteraction({
      prompt,
      response: null, // Or actual response if available pre-execution
      model: ollamaExecutor.getModelName(), // Assuming you can get model name
      metadata,
      duration: 0, // Placeholder, ideally measured around actual execution
      success: true, // Placeholder, set based on actual outcome
      // requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // If needed
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
      // requestId: ... // If you have a corresponding request ID
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

  } catch (error: any) {
    logger.error('[LLM Routes] Error processing prompt:', error);
    
    // Log the error for auditing
    await logLLMInteraction({
      prompt: req.body.prompt, // Access from req.body directly
      response: null,
      model: ollamaExecutor.getModelName(), // Or from error if available
      metadata: req.body.metadata || {}, // Access from req.body, provide default
      duration: 0, // Placeholder
      success: false,
      error: (error instanceof Error ? error.message : String(error)), // Robust error message
      // requestId: ...
    });

    res.status(500).json({ 
      error: 'Failed to process prompt',
      details: (error instanceof Error ? error.message : String(error)) // Robust error message
    });
  }
});

/**
 * GET /api/v1/llm/status
 * Get LLM service status
 */
router.get('/status', async (req: Request, res: Response) => {
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
  } catch (error: any) {
    logger.error('[LLM Routes] Error getting status:', error);
    res.status(500).json({ 
      error: 'Failed to get LLM status',
      details: error.message 
    });
  }
});

/**
 * POST /api/v1/llm/analyze-segment
 * Analyze a thought segment for insights
 */
router.post('/analyze-segment', async (req: Request, res: Response) => {
  try {
    const { segmentContent, analysisType = 'general' } = req.body;
    
    if (!segmentContent) {
      return res.status(400).json({ 
        error: 'Segment content is required' 
      });
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

  } catch (error: any) {
    logger.error('[LLM Routes] Error analyzing segment:', error);
    res.status(500).json({ 
      error: 'Failed to analyze segment',
      details: error.message 
    });
  }
});

export default router;

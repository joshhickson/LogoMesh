
import { Router, Request, Response } from 'express';
import { TaskEngine, Pipeline } from '../../../core/services/taskEngine';
import { EventBus } from '../../../core/services/eventBus';
import { LLMTaskRunner } from '../../../core/llm/LLMTaskRunner';
import { OllamaExecutor } from '../../../core/llm/OllamaExecutor';
import { logger } from '../../../core/utils/logger';

const router = Router();

// Global TaskEngine instance (will be initialized with server)
let taskEngine: TaskEngine;

/**
 * Initialize TaskEngine with default executors
 */
export function initializeTaskEngine(eventBus: EventBus): void {
  taskEngine = new TaskEngine(eventBus);
  
  // Register default LLM executor
  const ollamaExecutor = new OllamaExecutor();
  const llmTaskRunner = new LLMTaskRunner(ollamaExecutor);
  taskEngine.registerLLMExecutor('default-llm', llmTaskRunner);
  
  logger.info('[TaskRoutes] TaskEngine initialized with default executors');
}

/**
 * POST /api/tasks/pipelines - Create a new pipeline
 */
router.post('/pipelines', async (req: Request, res: Response) => {
  try {
    const { name, description, steps, executionMode, context } = req.body;

    if (!name || !steps || !executionMode) {
      return res.status(400).json({
        error: 'Missing required fields: name, steps, executionMode'
      });
    }

    if (!Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({
        error: 'Steps must be a non-empty array'
      });
    }

    if (!['sequential', 'parallel'].includes(executionMode)) {
      return res.status(400).json({
        error: 'executionMode must be either "sequential" or "parallel"'
      });
    }

    const pipeline = await taskEngine.createPipeline({
      name,
      description,
      steps,
      executionMode,
      context
    });

    res.status(201).json({
      success: true,
      pipeline
    });

  } catch (error: any) {
    logger.error('[TaskRoutes] Error creating pipeline:', error);
    res.status(500).json({
      error: 'Failed to create pipeline',
      details: error.message
    });
  }
});

/**
 * POST /api/tasks/pipelines/:id/execute - Execute a pipeline
 */
router.post('/pipelines/:id/execute', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pipeline = await taskEngine.executePipeline(id);

    res.json({
      success: true,
      pipeline
    });

  } catch (error: any) {
    logger.error(`[TaskRoutes] Error executing pipeline ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to execute pipeline',
      details: error.message
    });
  }
});

/**
 * GET /api/tasks/pipelines - List all pipelines
 */
router.get('/pipelines', (req: Request, res: Response) => {
  try {
    const pipelines = taskEngine.getActivePipelines();

    res.json({
      success: true,
      pipelines,
      count: pipelines.length
    });

  } catch (error: any) {
    logger.error('[TaskRoutes] Error listing pipelines:', error);
    res.status(500).json({
      error: 'Failed to list pipelines',
      details: error.message
    });
  }
});

/**
 * GET /api/tasks/pipelines/:id - Get pipeline status
 */
router.get('/pipelines/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pipeline = taskEngine.getPipelineStatus(id);

    if (!pipeline) {
      return res.status(404).json({
        error: 'Pipeline not found'
      });
    }

    res.json({
      success: true,
      pipeline
    });

  } catch (error: any) {
    logger.error(`[TaskRoutes] Error getting pipeline ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to get pipeline status',
      details: error.message
    });
  }
});

/**
 * POST /api/tasks/pipelines/:id/cancel - Cancel a pipeline
 */
router.post('/pipelines/:id/cancel', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cancelled = taskEngine.cancelPipeline(id);

    if (!cancelled) {
      return res.status(400).json({
        error: 'Pipeline cannot be cancelled (not found or not running)'
      });
    }

    res.json({
      success: true,
      message: 'Pipeline cancelled successfully'
    });

  } catch (error: any) {
    logger.error(`[TaskRoutes] Error cancelling pipeline ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to cancel pipeline',
      details: error.message
    });
  }
});

/**
 * GET /api/tasks/status - Get TaskEngine status
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const status = taskEngine.getStatus();

    res.json({
      success: true,
      status
    });

  } catch (error: any) {
    logger.error('[TaskRoutes] Error getting TaskEngine status:', error);
    res.status(500).json({
      error: 'Failed to get TaskEngine status',
      details: error.message
    });
  }
});

/**
 * POST /api/tasks/quick-test - Quick test endpoint for 3-step pipeline
 */
router.post('/quick-test', async (req: Request, res: Response) => {
  try {
    // Create a simple 3-step test pipeline: LLM → Plugin → System
    const testPipeline = await taskEngine.createPipeline({
      name: 'Quick Test Pipeline',
      description: 'Test 3-step pipeline for verification',
      executionMode: 'sequential',
      steps: [
        {
          type: 'llm',
          executorId: 'default-llm',
          input: {
            prompt: 'Generate a simple greeting message'
          }
        },
        {
          type: 'plugin',
          executorId: 'test-plugin',
          input: {
            action: 'process-text',
            data: 'Hello from LLM step'
          }
        },
        {
          type: 'system',
          executorId: 'test-system',
          input: {
            command: 'echo',
            args: ['Pipeline test completed']
          }
        }
      ],
      context: {
        testRun: true,
        timestamp: new Date().toISOString()
      }
    });

    const executedPipeline = await taskEngine.executePipeline(testPipeline.id);

    res.json({
      success: true,
      message: 'Quick test completed successfully',
      pipeline: executedPipeline
    });

  } catch (error: any) {
    logger.error('[TaskRoutes] Error in quick test:', error);
    res.status(500).json({
      error: 'Quick test failed',
      details: error.message
    });
  }
});

export default router;

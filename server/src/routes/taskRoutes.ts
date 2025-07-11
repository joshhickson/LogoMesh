
import { Router, Request, Response } from 'express';
import { TaskEngine } from '../../../core/services/taskEngine'; // Removed Pipeline import
import { EventBus } from '../../../core/services/eventBus';
import { LLMTaskRunner } from '../../../core/llm/LLMTaskRunner';
import { OllamaExecutor } from '../../../core/llm/OllamaExecutor';
import { logger } from '../../../core/utils/logger';

import { TaskStep } from '../../../core/services/taskEngine'; // Import TaskStep for body typing

const router = Router();

// Global TaskEngine instance (will be initialized with server)
let taskEngine: TaskEngine;

// --- Request Body Interfaces ---
interface CreatePipelineBody {
  name?: string;
  description?: string;
  steps?: Omit<TaskStep, 'id' | 'status' | 'startTime' | 'endTime'>[];
  executionMode?: 'sequential' | 'parallel';
  context?: Record<string, unknown>;
}

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
router.post('/pipelines', async (req: Request, res: Response): Promise<void> => {
  try {
    // Use type assertion for req.body
    const {
      name,
      description,
      steps,
      executionMode,
      context
    } = req.body as CreatePipelineBody;

    if (!name || !steps || !executionMode) {
      res.status(400).json({
        error: 'Missing required fields: name, steps, executionMode'
      });
      return;
    }

    // steps is already Omit<TaskStep, ...>[] due to CreatePipelineBody, Array.isArray is good
    if (!Array.isArray(steps) || steps.length === 0) {
      res.status(400).json({
        error: 'Steps must be a non-empty array'
      });
      return;
    }

    // executionMode is already 'sequential' | 'parallel' due to CreatePipelineBody
    if (!['sequential', 'parallel'].includes(executionMode)) {
      res.status(400).json({
        error: 'executionMode must be either "sequential" or "parallel"'
      });
      return;
    }

    const pipelineDefinition: Parameters<typeof taskEngine.createPipeline>[0] = {
      name,
      steps,
      executionMode,
      // context will be added if defined
      // description will be added if defined
    };
    if (description !== undefined) {
      pipelineDefinition.description = description;
    }
    if (context !== undefined) {
      pipelineDefinition.context = context;
    }

    const pipeline = await taskEngine.createPipeline(pipelineDefinition);

    res.status(201).json({
      success: true,
      pipeline
    });

  } catch (error: unknown) { // any -> unknown
    logger.error('[TaskRoutes] Error creating pipeline:', error);
    res.status(500).json({
      error: 'Failed to create pipeline',
      details: error instanceof Error ? error.message : String(error) // Safer access
    });
  }
});

/**
 * POST /api/tasks/pipelines/:id/execute - Execute a pipeline
 */
router.post('/pipelines/:id/execute', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const pipeline = await taskEngine.executePipeline(id);

    res.json({
      success: true,
      pipeline
    });

  } catch (error: unknown) { // any -> unknown
    logger.error(`[TaskRoutes] Error executing pipeline ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to execute pipeline',
      details: error instanceof Error ? error.message : String(error) // Safer access
    });
  }
});

/**
 * GET /api/tasks/pipelines - List all pipelines
 */
router.get('/pipelines', (_req: Request, res: Response): void => { // req -> _req
  try {
    const pipelines = taskEngine.getActivePipelines();

    res.json({
      success: true,
      pipelines,
      count: pipelines.length
    });

  } catch (error: unknown) { // any -> unknown
    logger.error('[TaskRoutes] Error listing pipelines:', error);
    res.status(500).json({
      error: 'Failed to list pipelines',
      details: error instanceof Error ? error.message : String(error) // Safer access
    });
  }
});

/**
 * GET /api/tasks/pipelines/:id - Get pipeline status
 */
router.get('/pipelines/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const pipeline = taskEngine.getPipelineStatus(id);

    if (!pipeline) {
      res.status(404).json({
        error: 'Pipeline not found'
      });
      return;
    }

    res.json({
      success: true,
      pipeline
    });

  } catch (error: unknown) {
    logger.error(`[TaskRoutes] Error getting pipeline ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to get pipeline status',
      details: error instanceof Error ? error.message : String(error) // Safer access
    });
  }
});

/**
 * POST /api/tasks/pipelines/:id/cancel - Cancel a pipeline
 */
router.post('/pipelines/:id/cancel', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const cancelled = taskEngine.cancelPipeline(id);

    if (!cancelled) {
      res.status(400).json({
        error: 'Pipeline cannot be cancelled (not found or not running)'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Pipeline cancelled successfully'
    });

  } catch (error: unknown) {
    logger.error(`[TaskRoutes] Error cancelling pipeline ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to cancel pipeline',
      details: error instanceof Error ? error.message : String(error) // Safer access
    });
  }
});

/**
 * GET /api/tasks/status - Get TaskEngine status
 */
router.get('/status', (_req: Request, res: Response): void => { // req -> _req
  try {
    const status = taskEngine.getStatus();

    res.json({
      success: true,
      status
    });

  } catch (error: unknown) { // any -> unknown
    logger.error('[TaskRoutes] Error getting TaskEngine status:', error);
    res.status(500).json({
      error: 'Failed to get TaskEngine status',
      details: error instanceof Error ? error.message : String(error) // Safer access
    });
  }
});

/**
 * POST /api/tasks/quick-test - Quick test endpoint for 3-step pipeline
 */
router.post('/quick-test', async (_req: Request, res: Response): Promise<void> => { // req -> _req, added Promise<void>
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

  } catch (error: unknown) { // any -> unknown
    logger.error('[TaskRoutes] Error in quick test:', error);
    res.status(500).json({
      error: 'Quick test failed',
      details: error instanceof Error ? error.message : String(error) // Safer access
    });
  }
});

export default router;

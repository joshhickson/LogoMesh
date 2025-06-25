"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTaskEngine = void 0;
const express_1 = require("express");
const taskEngine_1 = require("../../../core/services/taskEngine");
const LLMTaskRunner_1 = require("../../../core/llm/LLMTaskRunner");
const OllamaExecutor_1 = require("../../../core/llm/OllamaExecutor");
const logger_1 = require("../../../core/utils/logger");
const router = (0, express_1.Router)();
// Global TaskEngine instance (will be initialized with server)
let taskEngine;
/**
 * Initialize TaskEngine with default executors
 */
function initializeTaskEngine(eventBus) {
    taskEngine = new taskEngine_1.TaskEngine(eventBus);
    // Register default LLM executor
    const ollamaExecutor = new OllamaExecutor_1.OllamaExecutor();
    const llmTaskRunner = new LLMTaskRunner_1.LLMTaskRunner(ollamaExecutor);
    taskEngine.registerLLMExecutor('default-llm', llmTaskRunner);
    logger_1.logger.info('[TaskRoutes] TaskEngine initialized with default executors');
}
exports.initializeTaskEngine = initializeTaskEngine;
/**
 * POST /api/tasks/pipelines - Create a new pipeline
 */
router.post('/pipelines', async (req, res) => {
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
    }
    catch (error) {
        logger_1.logger.error('[TaskRoutes] Error creating pipeline:', error);
        res.status(500).json({
            error: 'Failed to create pipeline',
            details: error.message
        });
    }
});
/**
 * POST /api/tasks/pipelines/:id/execute - Execute a pipeline
 */
router.post('/pipelines/:id/execute', async (req, res) => {
    try {
        const { id } = req.params;
        const pipeline = await taskEngine.executePipeline(id);
        res.json({
            success: true,
            pipeline
        });
    }
    catch (error) {
        logger_1.logger.error(`[TaskRoutes] Error executing pipeline ${req.params.id}:`, error);
        res.status(500).json({
            error: 'Failed to execute pipeline',
            details: error.message
        });
    }
});
/**
 * GET /api/tasks/pipelines - List all pipelines
 */
router.get('/pipelines', (req, res) => {
    try {
        const pipelines = taskEngine.getActivePipelines();
        res.json({
            success: true,
            pipelines,
            count: pipelines.length
        });
    }
    catch (error) {
        logger_1.logger.error('[TaskRoutes] Error listing pipelines:', error);
        res.status(500).json({
            error: 'Failed to list pipelines',
            details: error.message
        });
    }
});
/**
 * GET /api/tasks/pipelines/:id - Get pipeline status
 */
router.get('/pipelines/:id', (req, res) => {
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
    }
    catch (error) {
        logger_1.logger.error(`[TaskRoutes] Error getting pipeline ${req.params.id}:`, error);
        res.status(500).json({
            error: 'Failed to get pipeline status',
            details: error.message
        });
    }
});
/**
 * POST /api/tasks/pipelines/:id/cancel - Cancel a pipeline
 */
router.post('/pipelines/:id/cancel', (req, res) => {
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
    }
    catch (error) {
        logger_1.logger.error(`[TaskRoutes] Error cancelling pipeline ${req.params.id}:`, error);
        res.status(500).json({
            error: 'Failed to cancel pipeline',
            details: error.message
        });
    }
});
/**
 * GET /api/tasks/status - Get TaskEngine status
 */
router.get('/status', (req, res) => {
    try {
        const status = taskEngine.getStatus();
        res.json({
            success: true,
            status
        });
    }
    catch (error) {
        logger_1.logger.error('[TaskRoutes] Error getting TaskEngine status:', error);
        res.status(500).json({
            error: 'Failed to get TaskEngine status',
            details: error.message
        });
    }
});
/**
 * POST /api/tasks/quick-test - Quick test endpoint for 3-step pipeline
 */
router.post('/quick-test', async (req, res) => {
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
    }
    catch (error) {
        logger_1.logger.error('[TaskRoutes] Error in quick test:', error);
        res.status(500).json({
            error: 'Quick test failed',
            details: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map
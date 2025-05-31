"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const LLMTaskRunner_1 = require("../../../core/llm/LLMTaskRunner");
const OllamaExecutor_1 = require("../../../core/llm/OllamaExecutor");
const router = express_1.default.Router();
// Initialize LLM components
const defaultExecutor = new OllamaExecutor_1.OllamaExecutor('ollama-mock-v1');
const taskRunner = new LLMTaskRunner_1.LLMTaskRunner(defaultExecutor);
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
    }
    catch (error) {
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
            await taskRunner.runPromptWithStreaming(prompt, (chunk) => {
                fullResponse += chunk;
                res.write(`data: ${JSON.stringify({ chunk, type: 'chunk' })}\n\n`);
            }, metadata);
            res.write(`data: ${JSON.stringify({ type: 'done', fullResponse })}\n\n`);
        }
        else {
            // Fallback to regular execution
            const response = await taskRunner.run(prompt, metadata);
            res.write(`data: ${JSON.stringify({ chunk: response, type: 'complete' })}\n\n`);
        }
        res.end();
    }
    catch (error) {
        console.error('Error in streaming LLM prompt:', error);
        res.write(`data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : String(error)
        })}\n\n`);
        res.end();
    }
});
exports.default = router;
const express_2 = require("express");
const logger_1 = require("../../../src/core/utils/logger");
const router = (0, express_2.Router)();
// Placeholder for LLM routes
router.get('/health', (req, res) => {
    res.json({ service: 'llm', status: 'healthy' });
});
// POST /api/v1/llm/prompt - Execute LLM prompt (stub)
router.post('/prompt', async (req, res) => {
    try {
        const { prompt, model } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        // Stub implementation - will be enhanced in future phases
        const response = {
            prompt,
            model: model || 'default',
            response: 'LLM functionality coming soon',
            timestamp: new Date().toISOString()
        };
        logger_1.logger.info(`LLM prompt executed: ${prompt.substring(0, 50)}...`);
        res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Error executing LLM prompt:', error);
        res.status(500).json({ error: 'Failed to execute LLM prompt' });
    }
});
exports.default = router;
//# sourceMappingURL=llmRoutes.js.map
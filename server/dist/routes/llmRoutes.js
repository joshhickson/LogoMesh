"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LLMTaskRunner_1 = require("../../../core/llm/LLMTaskRunner");
const OllamaExecutor_1 = require("../../../core/llm/OllamaExecutor");
const logger_1 = require("../../../src/core/utils/logger");
const llmAuditLogger_1 = require("../../../src/core/logger/llmAuditLogger");
const router = (0, express_1.Router)();
// Initialize LLM Task Runner with Ollama executor
const ollamaExecutor = new OllamaExecutor_1.OllamaExecutor({
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    defaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'llama2'
});
const llmTaskRunner = new LLMTaskRunner_1.LLMTaskRunner(ollamaExecutor);
/**
 * POST /api/v1/llm/prompt
 * Execute a prompt using the LLM
 */
router.post('/prompt', async (req, res) => {
    try {
        const { prompt, metadata = {} } = req.body;
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({
                error: 'Prompt is required and must be a string'
            });
        }
        logger_1.logger.info('[LLM Routes] Processing prompt request', {
            promptLength: prompt.length,
            metadata
        });
        // Log the request for auditing
        await llmAuditLogger_1.llmAuditLogger.logPromptRequest({
            prompt,
            metadata,
            timestamp: new Date().toISOString(),
            requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
        // Execute the prompt
        const result = await llmTaskRunner.executePrompt(prompt, metadata);
        // Log the response for auditing
        await llmAuditLogger_1.llmAuditLogger.logPromptResponse({
            result,
            timestamp: new Date().toISOString(),
            executionTimeMs: result.executionTimeMs || 0
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
    }
    catch (error) {
        logger_1.logger.error('[LLM Routes] Error processing prompt:', error);
        // Log the error for auditing
        await llmAuditLogger_1.llmAuditLogger.logError({
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({
            error: 'Failed to process prompt',
            details: error.message
        });
    }
});
/**
 * GET /api/v1/llm/status
 * Get LLM service status
 */
router.get('/status', async (req, res) => {
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
    }
    catch (error) {
        logger_1.logger.error('[LLM Routes] Error getting status:', error);
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
router.post('/analyze-segment', async (req, res) => {
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
    }
    catch (error) {
        logger_1.logger.error('[LLM Routes] Error analyzing segment:', error);
        res.status(500).json({
            error: 'Failed to analyze segment',
            details: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=llmRoutes.js.map
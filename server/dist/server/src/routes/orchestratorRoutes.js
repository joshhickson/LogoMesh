"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LLMOrchestrator_1 = require("../../../core/llm/LLMOrchestrator");
const LLMRegistry_1 = require("../../../core/llm/LLMRegistry");
const eventBus_1 = require("../../../core/services/eventBus");
const logger_1 = require("../../../core/utils/logger");
const router = (0, express_1.Router)();
// Initialize services
const eventBus = new eventBus_1.EventBus();
const orchestrator = new LLMOrchestrator_1.LLMOrchestrator(eventBus);
const registry = new LLMRegistry_1.LLMRegistry();
// Load model endpoint
router.post('/models/load', async (req, res) => {
    try {
        const { modelId, roleId, specialization, systemPrompt } = req.body;
        if (!modelId || !roleId || !specialization) {
            return res.status(400).json({
                error: 'Missing required fields: modelId, roleId, specialization'
            });
        }
        const executor = await registry.loadModel(modelId);
        await orchestrator.loadModel(roleId, executor, specialization, systemPrompt);
        res.json({
            success: true,
            message: `Model ${modelId} loaded as ${roleId}`,
            memoryStats: registry.getMemoryStats()
        });
    }
    catch (error) {
        logger_1.logger.error('[OrchestratorRoutes] Error loading model:', error);
        res.status(500).json({ error: error.message });
    }
});
// Hot-swap model endpoint
router.put('/models/hotswap', async (req, res) => {
    try {
        const { roleId, newModelId, conversationId } = req.body;
        if (!roleId || !newModelId) {
            return res.status(400).json({
                error: 'Missing required fields: roleId, newModelId'
            });
        }
        const newExecutor = await registry.loadModel(newModelId);
        await orchestrator.hotSwapModel(roleId, newExecutor, conversationId);
        res.json({
            success: true,
            message: `Hot-swapped ${roleId} to ${newModelId}`,
            memoryStats: registry.getMemoryStats()
        });
    }
    catch (error) {
        logger_1.logger.error('[OrchestratorRoutes] Error hot-swapping model:', error);
        res.status(500).json({ error: error.message });
    }
});
// Start conversation endpoint
router.post('/conversations/start', async (req, res) => {
    try {
        const { participantRoles, initialPrompt, topic } = req.body;
        if (!participantRoles || !Array.isArray(participantRoles) || !initialPrompt || !topic) {
            return res.status(400).json({
                error: 'Missing required fields: participantRoles (array), initialPrompt, topic'
            });
        }
        const conversationId = await orchestrator.startConversation(participantRoles, initialPrompt, topic);
        res.json({
            success: true,
            conversationId,
            participants: participantRoles,
            topic
        });
    }
    catch (error) {
        logger_1.logger.error('[OrchestratorRoutes] Error starting conversation:', error);
        res.status(500).json({ error: error.message });
    }
});
// Send message endpoint
router.post('/conversations/:conversationId/message', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { fromRole, toRoles, content, messageType } = req.body;
        if (!fromRole || !content) {
            return res.status(400).json({
                error: 'Missing required fields: fromRole, content'
            });
        }
        const message = await orchestrator.sendMessage(conversationId, fromRole, toRoles || [], // If empty, will broadcast
        content, messageType);
        res.json({
            success: true,
            message,
            conversationStats: orchestrator.getConversationStats(conversationId)
        });
    }
    catch (error) {
        logger_1.logger.error('[OrchestratorRoutes] Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get conversation history endpoint
router.get('/conversations/:conversationId/history', (req, res) => {
    try {
        const { conversationId } = req.params;
        const history = orchestrator.getConversationHistory(conversationId);
        res.json({
            success: true,
            conversationId,
            messageCount: history.length,
            messages: history
        });
    }
    catch (error) {
        logger_1.logger.error('[OrchestratorRoutes] Error getting conversation history:', error);
        res.status(500).json({ error: error.message });
    }
});
// Export conversation endpoint
router.get('/conversations/:conversationId/export', (req, res) => {
    try {
        const { conversationId } = req.params;
        const { format } = req.query;
        const exportData = orchestrator.exportConversation(conversationId, format);
        res.json({
            success: true,
            exportData
        });
    }
    catch (error) {
        logger_1.logger.error('[OrchestratorRoutes] Error exporting conversation:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get available models endpoint
router.get('/models/available', (req, res) => {
    try {
        const availableModels = registry.getAvailableModels();
        const capability = req.query.capability;
        const filteredModels = capability
            ? registry.getModelsByCapability(capability)
            : availableModels;
        res.json({
            success: true,
            models: filteredModels,
            totalCount: filteredModels.length
        });
    }
    catch (error) {
        logger_1.logger.error('[OrchestratorRoutes] Error getting available models:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get loaded models endpoint
router.get('/models/loaded', (req, res) => {
    try {
        const loadedModels = registry.getLoadedModels();
        const activeModels = orchestrator.getActiveModels();
        res.json({
            success: true,
            loadedModels,
            activeModels,
            memoryStats: registry.getMemoryStats()
        });
    }
    catch (error) {
        logger_1.logger.error('[OrchestratorRoutes] Error getting loaded models:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get conversation statistics endpoint
router.get('/conversations/:conversationId/stats', (req, res) => {
    try {
        const { conversationId } = req.params;
        const stats = orchestrator.getConversationStats(conversationId);
        if (!stats) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        res.json({
            success: true,
            stats
        });
    }
    catch (error) {
        logger_1.logger.error('[OrchestratorRoutes] Error getting conversation stats:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=orchestratorRoutes.js.map
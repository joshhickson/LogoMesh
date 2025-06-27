
import { Router, Request, Response } from 'express';
import { LLMOrchestrator } from '../../../core/llm/LLMOrchestrator';
import { LLMRegistry } from '../../../core/llm/LLMRegistry';
import { EventBus } from '../../../core/services/eventBus';
import { logger } from '../../../core/utils/logger';

const router = Router();

// Initialize services
const eventBus = new EventBus();
const orchestrator = new LLMOrchestrator(eventBus);
const registry = new LLMRegistry();

// Load model endpoint
router.post('/models/load', async (req: Request, res: Response) => {
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

  } catch (error: any) {
    logger.error('[OrchestratorRoutes] Error loading model:', error);
    res.status(500).json({ error: error.message });
  }
});

// Hot-swap model endpoint
router.put('/models/hotswap', async (req: Request, res: Response) => {
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

  } catch (error: any) {
    logger.error('[OrchestratorRoutes] Error hot-swapping model:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start conversation endpoint
router.post('/conversations/start', async (req: Request, res: Response) => {
  try {
    const { participantRoles, initialPrompt, topic } = req.body;

    if (!participantRoles || !Array.isArray(participantRoles) || !initialPrompt || !topic) {
      return res.status(400).json({ 
        error: 'Missing required fields: participantRoles (array), initialPrompt, topic' 
      });
    }

    const conversationId = await orchestrator.startConversation(
      participantRoles, 
      initialPrompt, 
      topic
    );

    res.json({ 
      success: true, 
      conversationId,
      participants: participantRoles,
      topic
    });

  } catch (error: any) {
    logger.error('[OrchestratorRoutes] Error starting conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send message endpoint
router.post('/conversations/:conversationId/message', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { fromRole, toRoles, content, messageType } = req.body;

    if (!fromRole || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: fromRole, content' 
      });
    }

    const message = await orchestrator.sendMessage(
      conversationId,
      fromRole,
      toRoles || [], // If empty, will broadcast
      content,
      messageType
    );

    res.json({ 
      success: true, 
      message,
      conversationStats: orchestrator.getConversationStats(conversationId)
    });

  } catch (error: any) {
    logger.error('[OrchestratorRoutes] Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get conversation history endpoint
router.get('/conversations/:conversationId/history', (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const history = orchestrator.getConversationHistory(conversationId);

    res.json({ 
      success: true, 
      conversationId,
      messageCount: history.length,
      messages: history
    });

  } catch (error: any) {
    logger.error('[OrchestratorRoutes] Error getting conversation history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export conversation endpoint
router.get('/conversations/:conversationId/export', (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { format } = req.query;

    const exportData = orchestrator.exportConversation(
      conversationId, 
      format as 'json' | 'training-data'
    );

    res.json({ 
      success: true, 
      exportData
    });

  } catch (error: any) {
    logger.error('[OrchestratorRoutes] Error exporting conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available models endpoint
router.get('/models/available', (req: Request, res: Response) => {
  try {
    const availableModels = registry.getAvailableModels();
    const capability = req.query.capability as string;

    const filteredModels = capability 
      ? registry.getModelsByCapability(capability)
      : availableModels;

    res.json({ 
      success: true, 
      models: filteredModels,
      totalCount: filteredModels.length
    });

  } catch (error: any) {
    logger.error('[OrchestratorRoutes] Error getting available models:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get loaded models endpoint
router.get('/models/loaded', (req: Request, res: Response) => {
  try {
    const loadedModels = registry.getLoadedModels();
    const activeModels = orchestrator.getActiveModels();

    res.json({ 
      success: true, 
      loadedModels,
      activeModels,
      memoryStats: registry.getMemoryStats()
    });

  } catch (error: any) {
    logger.error('[OrchestratorRoutes] Error getting loaded models:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get conversation statistics endpoint
router.get('/conversations/:conversationId/stats', (req: Request, res: Response) => {
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

  } catch (error: any) {
    logger.error('[OrchestratorRoutes] Error getting conversation stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

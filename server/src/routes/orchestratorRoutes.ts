
import { Router, Request, Response } from 'express';
import { LLMOrchestrator, LLMMessage } from '../../../core/llm/LLMOrchestrator'; // Import LLMMessage
import { LLMRegistry } from '../../../core/llm/LLMRegistry';
import { EventBus } from '../../../core/services/eventBus';
import { logger } from '../../../core/utils/logger';

const router = Router();

// --- Request Body Interfaces ---
interface LoadModelBody {
  modelId?: string;
  roleId?: string;
  specialization?: string;
  systemPrompt?: string;
}

interface HotSwapModelBody {
  roleId?: string;
  newModelId?: string;
  conversationId?: string;
}

interface StartConversationBody {
  participantRoles?: string[];
  initialPrompt?: string;
  topic?: string;
}

interface SendMessageBody {
  fromRole?: string;
  toRoles?: string[];
  content?: string;
  messageType?: LLMMessage['messageType'];
}
// --- End Request Body Interfaces ---

// Initialize services
const eventBus = new EventBus();
const orchestrator = new LLMOrchestrator(eventBus);
const registry = new LLMRegistry();

// Load model endpoint
router.post('/models/load', async (req: Request, res: Response): Promise<void> => {
  try {
    const { modelId, roleId, specialization, systemPrompt } = req.body as LoadModelBody;

    if (!modelId || !roleId || !specialization ||
        typeof modelId !== 'string' || typeof roleId !== 'string' || typeof specialization !== 'string') {
      res.status(400).json({
        error: 'Missing or invalid required fields: modelId, roleId, specialization must be strings'
      });
      return;
    }
    if (systemPrompt && typeof systemPrompt !== 'string') {
      res.status(400).json({ error: 'systemPrompt must be a string if provided' });
      return;
    }


    const executor = await registry.loadModel(modelId);
    await orchestrator.loadModel(roleId, executor, specialization, systemPrompt);

    res.json({ 
      success: true, 
      message: `Model ${modelId} loaded as ${roleId}`,
      memoryStats: registry.getMemoryStats()
    });

  } catch (error: unknown) {
    logger.error('[OrchestratorRoutes] Error loading model:', error);
    res.status(500).json({
      error: 'Failed to load model',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Hot-swap model endpoint
router.put('/models/hotswap', async (req: Request, res: Response): Promise<void> => {
  try {
    const { roleId, newModelId, conversationId } = req.body as HotSwapModelBody;

    if (!roleId || !newModelId || typeof roleId !== 'string' || typeof newModelId !== 'string') {
      res.status(400).json({
        error: 'Missing or invalid required fields: roleId, newModelId must be strings'
      });
      return;
    }
    if (conversationId && typeof conversationId !== 'string') {
      res.status(400).json({ error: 'conversationId must be a string if provided' });
      return;
    }

    const newExecutor = await registry.loadModel(newModelId);
    await orchestrator.hotSwapModel(roleId, newExecutor, conversationId);

    res.json({ 
      success: true, 
      message: `Hot-swapped ${roleId} to ${newModelId}`,
      memoryStats: registry.getMemoryStats()
    });

  } catch (error: unknown) {
    logger.error('[OrchestratorRoutes] Error hot-swapping model:', error);
    res.status(500).json({
      error: 'Failed to hot-swap model',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Start conversation endpoint
router.post('/conversations/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const { participantRoles, initialPrompt, topic } = req.body as StartConversationBody;

    if (!participantRoles || !Array.isArray(participantRoles) ||
        !initialPrompt || typeof initialPrompt !== 'string' ||
        !topic || typeof topic !== 'string' ||
        participantRoles.some(role => typeof role !== 'string')) {
      res.status(400).json({
        error: 'Missing or invalid required fields: participantRoles (array of strings), initialPrompt (string), topic (string)'
      });
      return;
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

  } catch (error: unknown) {
    logger.error('[OrchestratorRoutes] Error starting conversation:', error);
    res.status(500).json({
      error: 'Failed to start conversation',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Send message endpoint
router.post('/conversations/:conversationId/message', async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { fromRole, toRoles, content, messageType } = req.body as SendMessageBody;

    if (!fromRole || typeof fromRole !== 'string' ||
        !content || typeof content !== 'string') {
      res.status(400).json({
        error: 'Missing or invalid required fields: fromRole (string), content (string)'
      });
      return;
    }
    if (toRoles && (!Array.isArray(toRoles) || toRoles.some(role => typeof role !== 'string'))) {
      res.status(400).json({ error: 'toRoles must be an array of strings if provided' });
      return;
    }
    // messageType is already validated by its type in SendMessageBody if provided

    const message = await orchestrator.sendMessage(
      conversationId,
      fromRole,
      toRoles || [],
      content,
      messageType
    );

    res.json({ 
      success: true, 
      message,
      conversationStats: orchestrator.getConversationStats(conversationId)
    });

  } catch (error: unknown) {
    logger.error('[OrchestratorRoutes] Error sending message:', error);
    res.status(500).json({
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get conversation history endpoint
router.get('/conversations/:conversationId/history', (req: Request, res: Response): void => {
  try {
    const { conversationId } = req.params;
    const history = orchestrator.getConversationHistory(conversationId);

    res.json({ 
      success: true, 
      conversationId,
      messageCount: history.length,
      messages: history
    });

  } catch (error: unknown) { // any -> unknown
    logger.error('[OrchestratorRoutes] Error getting conversation history:', error);
    res.status(500).json({
      error: 'Failed to get conversation history',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Export conversation endpoint
router.get('/conversations/:conversationId/export', (req: Request, res: Response): void => {
  try {
    const { conversationId } = req.params;
    const { format } = req.query as { format?: 'json' | 'training-data' }; // Type req.query

    const exportData = orchestrator.exportConversation(
      conversationId, 
      format // Pass format directly, exportConversation handles default
    );

    res.json({ 
      success: true, 
      exportData
    });

  } catch (error: unknown) { // any -> unknown
    logger.error('[OrchestratorRoutes] Error exporting conversation:', error);
    res.status(500).json({
      error: 'Failed to export conversation',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get available models endpoint
router.get('/models/available', (req: Request, res: Response): void => {
  try {
    const availableModels = registry.getAvailableModels();
    const { capability } = req.query as { capability?: string };

    const filteredModels = capability 
      ? registry.getModelsByCapability(capability)
      : availableModels;

    res.json({ 
      success: true, 
      models: filteredModels,
      totalCount: filteredModels.length
    });
    return; // Added return
  } catch (error: unknown) {
    logger.error('[OrchestratorRoutes] Error getting available models:', error);
    res.status(500).json({
      error: 'Failed to get available models',
      details: error instanceof Error ? error.message : String(error)
    });
    return; // Added return
  }
});

// Get loaded models endpoint
router.get('/models/loaded', async (_req: Request, res: Response): Promise<void> => {
  try {
    const loadedModels = registry.getLoadedModels();
    const activeModels = orchestrator.getActiveModels();

    res.json({ 
      success: true, 
      loadedModels,
      activeModels,
      memoryStats: registry.getMemoryStats()
    });
    // No explicit return needed here if it's the last statement in try
  } catch (error: unknown) {
    logger.error('[OrchestratorRoutes] Error getting loaded models:', error);
    res.status(500).json({
      error: 'Failed to get loaded models',
      details: error instanceof Error ? error.message : String(error)
    });
    // No explicit return needed here if it's the last statement in catch
  }
});

// Get conversation statistics endpoint
router.get('/conversations/:conversationId/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const stats = orchestrator.getConversationStats(conversationId);

    if (!stats) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json({ 
      success: true, 
      stats
    });
    return; // Explicit return
  } catch (error: unknown) {
    logger.error('[OrchestratorRoutes] Error getting conversation stats:', error);
    res.status(500).json({
      error: 'Failed to get conversation stats',
      details: error instanceof Error ? error.message : String(error)
    });
    return; // Explicit return
  }
});

export default router;


import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ConversationOrchestrator, LLMMessage } from '../../../core/llm/ConversationOrchestrator';
import { LLMRegistry } from '../../../core/llm/LLMRegistry';
import { LLMOrchestrator } from '../../../core/llm/LLMOrchestrator';
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


// Load model endpoint
router.post('/models/load',
  body('modelId').notEmpty().withMessage('modelId is required'),
  body('roleId').notEmpty().withMessage('roleId is required'),
  body('specialization').notEmpty().withMessage('specialization is required'),
  async (req: Request, res: Response): Promise<void> => {
  const { llmOrchestrator, llmRegistry } = req.app.locals as { llmOrchestrator: LLMOrchestrator, llmRegistry: LLMRegistry };
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { modelId, roleId, specialization, systemPrompt } = req.body as LoadModelBody;

    const executor = await llmRegistry.loadModel(modelId);
    await llmOrchestrator.loadModel(roleId, executor, specialization, systemPrompt);

    res.json({ 
      success: true, 
      message: `Model ${modelId} loaded as ${roleId}`,
      memoryStats: llmRegistry.getMemoryStats()
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
router.put('/models/hotswap',
  body('roleId').notEmpty().withMessage('roleId is required'),
  body('newModelId').notEmpty().withMessage('newModelId is required'),
  async (req: Request, res: Response): Promise<void> => {
  const { llmOrchestrator, llmRegistry } = req.app.locals as { llmOrchestrator: LLMOrchestrator, llmRegistry: LLMRegistry };
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { roleId, newModelId, conversationId } = req.body as HotSwapModelBody;

    const newExecutor = await llmRegistry.loadModel(newModelId);
    await llmOrchestrator.hotSwapModel(roleId, newExecutor, conversationId);

    res.json({ 
      success: true, 
      message: `Hot-swapped ${roleId} to ${newModelId}`,
      memoryStats: llmRegistry.getMemoryStats()
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
router.post('/conversations/start',
  body('participantRoles').isArray({ min: 1 }).withMessage('participantRoles must be a non-empty array'),
  body('initialPrompt').notEmpty().withMessage('initialPrompt is required'),
  body('topic').notEmpty().withMessage('topic is required'),
  async (req: Request, res: Response): Promise<void> => {
  const { llmOrchestrator } = req.app.locals as { llmOrchestrator: LLMOrchestrator };
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { participantRoles, initialPrompt, topic } = req.body as StartConversationBody;

    const conversationId = await llmOrchestrator.startConversation(
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
router.post('/conversations/:conversationId/message',
  body('fromRole').notEmpty().withMessage('fromRole is required'),
  body('content').notEmpty().withMessage('content is required'),
  async (req: Request, res: Response): Promise<void> => {
  const { llmOrchestrator } = req.app.locals as { llmOrchestrator: LLMOrchestrator };
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { conversationId } = req.params;
    const { fromRole, toRoles, content, messageType } = req.body as SendMessageBody;

    llmOrchestrator.sendMessage(
      conversationId,
      fromRole,
      toRoles || [],
      content,
      messageType
    );

    res.json({ 
      success: true, 
      message: 'Message sent'
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
  const { conversationOrchestrator } = req.app.locals as { conversationOrchestrator: ConversationOrchestrator };
  try {
    const { conversationId } = req.params;
    const history = conversationOrchestrator.getConversationHistory(conversationId);

    res.json({
      success: true,
      conversationId,
      messageCount: history.length,
      messages: history
    });

  } catch (error: unknown) {
    logger.error('[OrchestratorRoutes] Error getting conversation history:', error);
    res.status(500).json({
      error: 'Failed to get conversation history',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get available models endpoint
router.get('/models/available', (req: Request, res: Response): void => {
  const { llmRegistry } = req.app.locals as { llmRegistry: LLMRegistry };
  try {
    const { capability } = req.query as { capability?: string };

    const availableModels = llmRegistry.getAvailableModels();
    const filteredModels = capability 
      ? llmRegistry.getModelsByCapability(capability)
      : availableModels;

    res.json({ 
      success: true, 
      models: filteredModels,
      totalCount: filteredModels.length
    });
  } catch (error: unknown) {
    logger.error('[OrchestratorRoutes] Error getting available models:', error);
    res.status(500).json({
      error: 'Failed to get available models',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get loaded models endpoint
router.get('/models/loaded', async (req: Request, res: Response): Promise<void> => {
  const { llmOrchestrator, llmRegistry } = req.app.locals as { llmOrchestrator: LLMOrchestrator, llmRegistry: LLMRegistry };
  try {
    const loadedModels = llmRegistry.getLoadedModels();
    const activeModels = llmOrchestrator.getActiveModels();

    res.json({ 
      success: true, 
      loadedModels,
      activeModels,
      memoryStats: llmRegistry.getMemoryStats()
    });
  } catch (error: unknown) {
    logger.error('[OrchestratorRoutes] Error getting loaded models:', error);
    res.status(500).json({
      error: 'Failed to get loaded models',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;

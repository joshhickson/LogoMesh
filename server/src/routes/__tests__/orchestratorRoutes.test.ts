/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { LLMOrchestrator } from '@core/llm/LLMOrchestrator';
import { LLMRegistry } from '@core/llm/LLMRegistry';
import { EventBus } from '@core/services/eventBus';
import { ConversationOrchestrator } from '@core/llm/ConversationOrchestrator';

// Mock dependencies
vi.mock('@core/llm/LLMOrchestrator');
vi.mock('@core/llm/LLMRegistry');
vi.mock('@core/services/eventBus');
vi.mock('@core/llm/ConversationOrchestrator');

describe('Orchestrator Routes', () => {
  let app: express.Express;

  // Shared mock instances
  const mockOrchestrator = {
    loadModel: vi.fn(),
    hotSwapModel: vi.fn(),
    startConversation: vi.fn(),
    sendMessage: vi.fn(),
    getActiveModels: vi.fn(),
  };

  const mockRegistry = {
    loadModel: vi.fn(),
    getMemoryStats: vi.fn(),
    getAvailableModels: vi.fn(),
    getModelsByCapability: vi.fn(),
    getLoadedModels: vi.fn(),
  };

  const mockConversationOrchestrator = {
    getConversationHistory: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    vi.mocked(LLMOrchestrator).mockImplementation(() => mockOrchestrator as unknown as LLMOrchestrator);
    vi.mocked(LLMRegistry).mockImplementation(() => mockRegistry as unknown as LLMRegistry);
    vi.mocked(ConversationOrchestrator).mockImplementation(() => mockConversationOrchestrator as unknown as ConversationOrchestrator);
    vi.mocked(EventBus).mockImplementation(() => ({}) as unknown as EventBus);

    const { default: orchestratorRoutes } = await import('../orchestratorRoutes');

    app = express();
    app.locals.llmOrchestrator = mockOrchestrator;
    app.locals.llmRegistry = mockRegistry;
    app.locals.conversationOrchestrator = mockConversationOrchestrator;
    app.use(express.json());
    app.use('/orchestrator', orchestratorRoutes);
  });

  describe('POST /orchestrator/models/load', () => {
    interface LoadModelResponse {
      success: boolean;
    }

    it('should load a model successfully', async () => {
      mockRegistry.loadModel.mockResolvedValue({} as never);
      mockOrchestrator.loadModel.mockResolvedValue(undefined);
      mockRegistry.getMemoryStats.mockReturnValue({ usage: '100MB' });

      const response = await request(app)
        .post('/orchestrator/models/load')
        .send({ modelId: 'llama2', roleId: 'test-role', specialization: 'testing' });
      const body = response.body as LoadModelResponse;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it('should return 400 for missing fields', async () => {
        const response = await request(app).post('/orchestrator/models/load').send({});
        expect(response.status).toBe(400);
    });

    it('should return 500 on failure', async () => {
        mockRegistry.loadModel.mockRejectedValue(new Error('Load failed'));
        const response = await request(app)
            .post('/orchestrator/models/load')
            .send({ modelId: 'llama2', roleId: 'test-role', specialization: 'testing' });
        expect(response.status).toBe(500);
    });
  });

  describe('PUT /orchestrator/models/hotswap', () => {
    interface HotswapResponse {
      success: boolean;
    }

    it('should hotswap a model successfully', async () => {
        mockRegistry.loadModel.mockResolvedValue({} as never);
        mockOrchestrator.hotSwapModel.mockResolvedValue(undefined);
        const response = await request(app)
            .put('/orchestrator/models/hotswap')
            .send({ roleId: 'test-role', newModelId: 'llama3' });
        const body = response.body as HotswapResponse;
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
    });

    it('should return 400 for missing fields', async () => {
        const response = await request(app).put('/orchestrator/models/hotswap').send({});
        expect(response.status).toBe(400);
    });
  });

  describe('POST /orchestrator/conversations/start', () => {
    interface StartConversationResponse {
      conversationId: string;
    }

    it('should start a conversation successfully', async () => {
        mockOrchestrator.startConversation.mockResolvedValue('conv-123');
        const response = await request(app)
            .post('/orchestrator/conversations/start')
            .send({ participantRoles: ['r1'], initialPrompt: 'Hi', topic: 'Test' });
        const body = response.body as StartConversationResponse;
        expect(response.status).toBe(200);
        expect(body.conversationId).toBe('conv-123');
    });
  });

  describe('POST /orchestrator/conversations/:conversationId/message', () => {
    interface SendMessageResponse {
      success: boolean;
      message: string;
    }

    it('should send a message successfully', async () => {
        mockOrchestrator.sendMessage.mockReturnValue(undefined);
        const response = await request(app)
            .post('/orchestrator/conversations/conv-123/message')
            .send({ fromRole: 'r1', content: 'Hello' });
        const body = response.body as SendMessageResponse;
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toBe('Message sent');
    });
  });

  describe('GET /orchestrator/conversations/:conversationId/history', () => {
    interface HistoryResponse {
      messages: { id: string; content: string }[];
    }

    it('should retrieve conversation history', async () => {
        const mockHistory = [{ id: 'msg-1', content: 'Hello' }];
        mockConversationOrchestrator.getConversationHistory.mockReturnValue(mockHistory);
        const response = await request(app).get('/orchestrator/conversations/conv-123/history');
        const body = response.body as HistoryResponse;
        expect(response.status).toBe(200);
        expect(body.messages).toEqual(mockHistory);
    });
  });


  describe('GET /orchestrator/models/available', () => {
    interface AvailableModelsResponse {
      models: { id: string }[];
    }

    it('should retrieve available models', async () => {
        const mockModels = [{ id: 'llama2' }];
        mockRegistry.getAvailableModels.mockReturnValue(mockModels);
        const response = await request(app).get('/orchestrator/models/available');
        const body = response.body as AvailableModelsResponse;
        expect(response.status).toBe(200);
        expect(body.models).toEqual(mockModels);
    });

    it('should filter models by capability', async () => {
        const mockFilteredModels = [{ id: 'coder-llama' }];
        mockRegistry.getModelsByCapability.mockReturnValue(mockFilteredModels);
        const response = await request(app).get('/orchestrator/models/available?capability=coding');
        expect(response.status).toBe(200);
        expect(mockRegistry.getModelsByCapability).toHaveBeenCalledWith('coding');
    });
  });

  describe('GET /orchestrator/models/loaded', () => {
    interface LoadedModelsResponse {
      loadedModels: string[];
      activeModels: Record<string, string>;
    }

    it('should retrieve loaded models successfully', async () => {
        mockRegistry.getLoadedModels.mockReturnValue(['llama2']);
        mockOrchestrator.getActiveModels.mockReturnValue({ 'test-role': 'llama2' });
        const response = await request(app).get('/orchestrator/models/loaded');
        const body = response.body as LoadedModelsResponse;
        expect(response.status).toBe(200);
        expect(body.loadedModels).toEqual(['llama2']);
        expect(body.activeModels).toEqual({ 'test-role': 'llama2' });
    });
  });

});

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

    vi.mocked(LLMOrchestrator).mockImplementation(() => mockOrchestrator as any);
    vi.mocked(LLMRegistry).mockImplementation(() => mockRegistry as any);
    vi.mocked(ConversationOrchestrator).mockImplementation(() => mockConversationOrchestrator as any);
    vi.mocked(EventBus).mockImplementation(() => ({} as any));

    const { default: orchestratorRoutes } = await import('../orchestratorRoutes');

    app = express();
    app.locals.llmOrchestrator = mockOrchestrator;
    app.locals.llmRegistry = mockRegistry;
    app.locals.conversationOrchestrator = mockConversationOrchestrator;
    app.use(express.json());
    app.use('/orchestrator', orchestratorRoutes);
  });

  describe('POST /orchestrator/models/load', () => {
    it('should load a model successfully', async () => {
      mockRegistry.loadModel.mockResolvedValue({} as any);
      mockOrchestrator.loadModel.mockResolvedValue(undefined);
      mockRegistry.getMemoryStats.mockReturnValue({ usage: '100MB' });

      const response = await request(app)
        .post('/orchestrator/models/load')
        .send({ modelId: 'llama2', roleId: 'test-role', specialization: 'testing' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
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
    it('should hotswap a model successfully', async () => {
        mockRegistry.loadModel.mockResolvedValue({} as any);
        mockOrchestrator.hotSwapModel.mockResolvedValue(undefined);
        const response = await request(app)
            .put('/orchestrator/models/hotswap')
            .send({ roleId: 'test-role', newModelId: 'llama3' });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing fields', async () => {
        const response = await request(app).put('/orchestrator/models/hotswap').send({});
        expect(response.status).toBe(400);
    });
  });

  describe('POST /orchestrator/conversations/start', () => {
    it('should start a conversation successfully', async () => {
        mockOrchestrator.startConversation.mockResolvedValue('conv-123');
        const response = await request(app)
            .post('/orchestrator/conversations/start')
            .send({ participantRoles: ['r1'], initialPrompt: 'Hi', topic: 'Test' });
        expect(response.status).toBe(200);
        expect(response.body.conversationId).toBe('conv-123');
    });
  });

  describe('POST /orchestrator/conversations/:conversationId/message', () => {
    it('should send a message successfully', async () => {
        mockOrchestrator.sendMessage.mockReturnValue(undefined);
        const response = await request(app)
            .post('/orchestrator/conversations/conv-123/message')
            .send({ fromRole: 'r1', content: 'Hello' });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Message sent');
    });
  });

  describe('GET /orchestrator/conversations/:conversationId/history', () => {
    it('should retrieve conversation history', async () => {
        const mockHistory = [{ id: 'msg-1', content: 'Hello' }];
        mockConversationOrchestrator.getConversationHistory.mockReturnValue(mockHistory);
        const response = await request(app).get('/orchestrator/conversations/conv-123/history');
        expect(response.status).toBe(200);
        expect(response.body.messages).toEqual(mockHistory);
    });
  });


  describe('GET /orchestrator/models/available', () => {
    it('should retrieve available models', async () => {
        const mockModels = [{ id: 'llama2' }];
        mockRegistry.getAvailableModels.mockReturnValue(mockModels);
        const response = await request(app).get('/orchestrator/models/available');
        expect(response.status).toBe(200);
        expect(response.body.models).toEqual(mockModels);
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
    it('should retrieve loaded models successfully', async () => {
        mockRegistry.getLoadedModels.mockReturnValue(['llama2']);
        mockOrchestrator.getActiveModels.mockReturnValue({ 'test-role': 'llama2' });
        const response = await request(app).get('/orchestrator/models/loaded');
        expect(response.status).toBe(200);
        expect(response.body.loadedModels).toEqual(['llama2']);
        expect(response.body.activeModels).toEqual({ 'test-role': 'llama2' });
    });
  });

});

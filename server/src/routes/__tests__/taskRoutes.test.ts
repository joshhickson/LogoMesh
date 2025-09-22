import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { TaskEngine } from '@core/services/taskEngine';
import { EventBus } from '@core/services/eventBus';
import { LLMTaskRunner } from '@core/llm/LLMTaskRunner';
import { OllamaExecutor } from '@core/llm/OllamaExecutor';

// Mock dependencies
vi.mock('@core/services/taskEngine');
vi.mock('@core/services/eventBus');
vi.mock('@core/llm/LLMTaskRunner');
vi.mock('@core/llm/OllamaExecutor');

describe('Task Routes', () => {
  let app: express.Express;
  let initializeTaskEngine: (eventBus: EventBus) => void;

  const mockTaskEngine = {
    createPipeline: vi.fn(),
    executePipeline: vi.fn(),
    getActivePipelines: vi.fn(),
    getPipelineStatus: vi.fn(),
    cancelPipeline: vi.fn(),
    getStatus: vi.fn(),
    registerLLMExecutor: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    vi.mocked(TaskEngine).mockImplementation(() => mockTaskEngine as any);
    vi.mocked(EventBus).mockImplementation(() => ({} as any));
    vi.mocked(LLMTaskRunner).mockImplementation(() => ({} as any));
    vi.mocked(OllamaExecutor).mockImplementation(() => ({} as any));

    // Dynamically import to get a fresh module and wait for it
    const module = await import('../taskRoutes');
    initializeTaskEngine = module.initializeTaskEngine;

    app = express();
    app.use(express.json());
    app.use('/tasks', module.default);
  });

  describe('After Initialization', () => {
    beforeEach(() => {
      // Initialize the engine before tests in this block
      const eventBus = new EventBus();
      initializeTaskEngine(eventBus);
    });

    it('POST /tasks/pipelines should create a pipeline', async () => {
      const pipelineDef = { name: 'test', steps: [{ type: 'a' }], executionMode: 'sequential' };
      mockTaskEngine.createPipeline.mockResolvedValue({ id: 'pipe-123', ...pipelineDef });

      const response = await request(app)
        .post('/tasks/pipelines')
        .send(pipelineDef);

      expect(response.status).toBe(201);
      expect(response.body.pipeline.id).toBe('pipe-123');
      expect(mockTaskEngine.createPipeline).toHaveBeenCalledWith(pipelineDef);
    });

    it('POST /tasks/pipelines should return 400 for missing fields', async () => {
        const response = await request(app).post('/tasks/pipelines').send({});
        expect(response.status).toBe(400);
    });

    it('POST /tasks/pipelines/:id/execute should execute a pipeline', async () => {
        mockTaskEngine.executePipeline.mockResolvedValue({ id: 'pipe-123', status: 'completed' });
        const response = await request(app).post('/tasks/pipelines/pipe-123/execute');
        expect(response.status).toBe(200);
        expect(mockTaskEngine.executePipeline).toHaveBeenCalledWith('pipe-123');
    });

    it('GET /tasks/pipelines should list active pipelines', async () => {
        mockTaskEngine.getActivePipelines.mockReturnValue([{ id: 'pipe-123' }]);
        const response = await request(app).get('/tasks/pipelines');
        expect(response.status).toBe(200);
        expect(response.body.pipelines).toHaveLength(1);
    });

    it('GET /tasks/pipelines/:id should get pipeline status', async () => {
        mockTaskEngine.getPipelineStatus.mockReturnValue({ id: 'pipe-123', status: 'running' });
        const response = await request(app).get('/tasks/pipelines/pipe-123');
        expect(response.status).toBe(200);
        expect(response.body.pipeline.status).toBe('running');
    });

    it('GET /tasks/pipelines/:id should return 404 if not found', async () => {
        mockTaskEngine.getPipelineStatus.mockReturnValue(null);
        const response = await request(app).get('/tasks/pipelines/not-found');
        expect(response.status).toBe(404);
    });

    it('POST /tasks/pipelines/:id/cancel should cancel a pipeline', async () => {
        mockTaskEngine.cancelPipeline.mockReturnValue(true);
        const response = await request(app).post('/tasks/pipelines/pipe-123/cancel');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('POST /tasks/pipelines/:id/cancel should return 400 if cancellation fails', async () => {
        mockTaskEngine.cancelPipeline.mockReturnValue(false);
        const response = await request(app).post('/tasks/pipelines/pipe-123/cancel');
        expect(response.status).toBe(400);
    });

    it('GET /tasks/status should return engine status', async () => {
        mockTaskEngine.getStatus.mockReturnValue({ status: 'idle' });
        const response = await request(app).get('/tasks/status');
        expect(response.status).toBe(200);
        expect(response.body.status).toEqual({ status: 'idle' });
    });
  });
});

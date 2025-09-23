/** @vitest-environment node */
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

    vi.mocked(TaskEngine).mockImplementation(() => mockTaskEngine as unknown as TaskEngine);
    vi.mocked(EventBus).mockImplementation(() => ({}) as unknown as EventBus);
    vi.mocked(LLMTaskRunner).mockImplementation(() => ({}) as unknown as LLMTaskRunner);
    vi.mocked(OllamaExecutor).mockImplementation(() => ({}) as unknown as OllamaExecutor);

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

      interface PipelineResponse {
        pipeline: { id: string };
      }
      const body = response.body as PipelineResponse;

      expect(response.status).toBe(201);
      expect(body.pipeline.id).toBe('pipe-123');
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
        interface PipelinesResponse {
          pipelines: { id: string }[];
        }
        const body = response.body as PipelinesResponse;
        expect(response.status).toBe(200);
        expect(body.pipelines).toHaveLength(1);
    });

    it('GET /tasks/pipelines/:id should get pipeline status', async () => {
        mockTaskEngine.getPipelineStatus.mockReturnValue({ id: 'pipe-123', status: 'running' });
        const response = await request(app).get('/tasks/pipelines/pipe-123');
        interface PipelineStatusResponse {
          pipeline: { status: string };
        }
        const body = response.body as PipelineStatusResponse;
        expect(response.status).toBe(200);
        expect(body.pipeline.status).toBe('running');
    });

    it('GET /tasks/pipelines/:id should return 404 if not found', async () => {
        mockTaskEngine.getPipelineStatus.mockReturnValue(null);
        const response = await request(app).get('/tasks/pipelines/not-found');
        expect(response.status).toBe(404);
    });

    it('POST /tasks/pipelines/:id/cancel should cancel a pipeline', async () => {
        mockTaskEngine.cancelPipeline.mockReturnValue(true);
        const response = await request(app).post('/tasks/pipelines/pipe-123/cancel');
        interface CancelResponse {
          success: boolean;
        }
        const body = response.body as CancelResponse;
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
    });

    it('POST /tasks/pipelines/:id/cancel should return 400 if cancellation fails', async () => {
        mockTaskEngine.cancelPipeline.mockReturnValue(false);
        const response = await request(app).post('/tasks/pipelines/pipe-123/cancel');
        expect(response.status).toBe(400);
    });

    it('GET /tasks/status should return engine status', async () => {
        mockTaskEngine.getStatus.mockReturnValue({ status: 'idle' });
        const response = await request(app).get('/tasks/status');
        interface StatusResponse {
          status: { status: string };
        }
        const body = response.body as StatusResponse;
        expect(response.status).toBe(200);
        expect(body.status).toEqual({ status: 'idle' });
    });
  });
});

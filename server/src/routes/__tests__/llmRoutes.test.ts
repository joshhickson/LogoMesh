/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { LLMTaskRunner } from '@core/llm/LLMTaskRunner';
import { OllamaExecutor } from '@core/llm/OllamaExecutor';
import { logLLMInteraction } from '@core/logger/llmAuditLogger';

// Mock the core dependencies
vi.mock('@core/llm/LLMTaskRunner');
vi.mock('@core/llm/OllamaExecutor');
vi.mock('@core/logger/llmAuditLogger');

describe('LLM Routes', () => {
  let app: express.Express;

  // Define a single mock runner instance that will be used by the routes
  const mockLLMTaskRunner = {
    executePrompt: vi.fn(),
    getStatus: vi.fn(),
  };

  beforeEach(async () => {
    // Reset mocks before each test to clear call history and previous settings
    vi.clearAllMocks();

    // The factory for the mocked class now returns our shared mock object
    vi.mocked(LLMTaskRunner).mockImplementation(() => mockLLMTaskRunner as any);

    // Mock other dependencies
    vi.mocked(OllamaExecutor).mockImplementation(() => ({
      getModelName: vi.fn().mockReturnValue('mock-model'),
    }) as any);
    vi.mocked(logLLMInteraction).mockResolvedValue(undefined);

    // Dynamically import the routes to ensure they use the mocks
    const { default: llmRoutes } = await import('../llmRoutes');

    app = express();
    app.use(express.json());
    app.use('/llm', llmRoutes);
  });

  describe('POST /llm/prompt', () => {
    it('should execute a prompt and return a result', async () => {
      const prompt = 'What is the meaning of life?';
      const mockResult = {
        response: '42',
        model: 'mock-model',
        executionTimeMs: 100,
        tokensUsed: 10,
      };
      // Configure the shared mock for this specific test
      mockLLMTaskRunner.executePrompt.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/llm/prompt')
        .send({ prompt });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.result).toBe('42');
      expect(mockLLMTaskRunner.executePrompt).toHaveBeenCalledWith(prompt, {});
    });

    it('should return 400 if prompt is missing', async () => {
      const response = await request(app)
        .post('/llm/prompt')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Prompt is required and must be a string');
    });

    it('should return 500 if prompt execution fails', async () => {
      const prompt = 'This will fail';
      // Configure the shared mock for this specific test
      mockLLMTaskRunner.executePrompt.mockRejectedValue(new Error('LLM error'));

      const response = await request(app)
        .post('/llm/prompt')
        .send({ prompt });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to process prompt');
      expect(response.body.details).toBe('LLM error');
    });
  });

  describe('GET /llm/status', () => {
    it('should return the LLM service status', async () => {
      const mockStatus = {
        isConnected: true,
        currentModel: 'mock-model',
        lastHealthCheck: new Date().toISOString(),
        totalRequests: 5,
      };
      // Configure the shared mock for this specific test
      mockLLMTaskRunner.getStatus.mockResolvedValue(mockStatus);

      const response = await request(app).get('/llm/status');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status.isConnected).toBe(true);
      expect(response.body.status.model).toBe('mock-model');
    });

    it('should return 500 if getting status fails', async () => {
        // Configure the shared mock for this specific test
        mockLLMTaskRunner.getStatus.mockRejectedValue(new Error('Status check failed'));

        const response = await request(app).get('/llm/status');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to get LLM status');
    });
  });

  describe('POST /llm/analyze-segment', () => {
    it('should analyze a segment and return a result', async () => {
      const segmentContent = 'This is a test segment.';
      const mockResult = {
        response: '{"themes": ["testing"]}',
        model: 'mock-model',
        executionTimeMs: 150,
      };
      // Configure the shared mock for this specific test
      mockLLMTaskRunner.executePrompt.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/llm/analyze-segment')
        .send({ segmentContent });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.analysis).toBe('{"themes": ["testing"]}');
      expect(mockLLMTaskRunner.executePrompt).toHaveBeenCalled();
    });

    it('should return 400 if segmentContent is missing', async () => {
        const response = await request(app)
          .post('/llm/analyze-segment')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Segment content is required and must be a string');
      });

    it('should return 500 if analysis fails', async () => {
        const segmentContent = 'This analysis will fail';
        // Configure the shared mock for this specific test
        mockLLMTaskRunner.executePrompt.mockRejectedValue(new Error('Analysis error'));

        const response = await request(app)
          .post('/llm/analyze-segment')
          .send({ segmentContent });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to analyze segment');
      });
  });
});

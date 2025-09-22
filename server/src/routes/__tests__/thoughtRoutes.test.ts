/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import thoughtRoutes from '../thoughtRoutes';

// Mock the core service
vi.mock('@core/IdeaManager');

describe('Thought Routes', () => {
  let app: express.Express;
  const mockIdeaManager = {
    getThoughts: vi.fn(),
    addThought: vi.fn(),
    getThoughtById: vi.fn(),
    updateThought: vi.fn(),
    deleteThought: vi.fn(),
    addSegment: vi.fn(),
    updateSegment: vi.fn(),
    deleteSegment: vi.fn(),
  };

  // Mock authentication middleware
  const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    req.user = { id: 'user-123', name: 'Test User', roles: 'user', isAuthenticated: true };
    next();
  };

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();
    app.use(express.json());
    // Inject mock IdeaManager and authentication
    app.locals.ideaManager = mockIdeaManager;
    app.use(mockAuthMiddleware);
    app.use('/thoughts', thoughtRoutes);
  });

  describe('GET /thoughts', () => {
    it('should return all thoughts for the user', async () => {
      const thoughts = [{ id: 't1', title: 'My Thought' }];
      mockIdeaManager.getThoughts.mockResolvedValue(thoughts);
      const response = await request(app).get('/thoughts');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(thoughts);
      expect(mockIdeaManager.getThoughts).toHaveBeenCalledWith('user-123');
    });
  });

  describe('POST /thoughts', () => {
    it('should create a new thought', async () => {
      const newThoughtData = { title: 'New Idea', content: 'Here is an idea.' };
      const createdThought = { id: 't2', ...newThoughtData };
      mockIdeaManager.addThought.mockResolvedValue(createdThought);
      const response = await request(app).post('/thoughts').send(newThoughtData);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdThought);
    });

    it('should return 400 if title is missing', async () => {
        const response = await request(app).post('/thoughts').send({ content: 'no title' });
        expect(response.status).toBe(400);
    });
  });

  describe('GET /thoughts/:thoughtId', () => {
    it('should return a specific thought', async () => {
        const thought = { id: 't1', title: 'My Thought' };
        mockIdeaManager.getThoughtById.mockResolvedValue(thought);
        const response = await request(app).get('/thoughts/t1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(thought);
    });

    it('should return 404 if thought not found', async () => {
        mockIdeaManager.getThoughtById.mockResolvedValue(null);
        const response = await request(app).get('/thoughts/not-found');
        expect(response.status).toBe(404);
    });
  });

  describe('PUT /thoughts/:thoughtId', () => {
    it('should update a thought', async () => {
        const updatedThought = { id: 't1', title: 'Updated Title' };
        mockIdeaManager.updateThought.mockResolvedValue(updatedThought);
        const response = await request(app).put('/thoughts/t1').send({ title: 'Updated Title' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedThought);
    });
  });

  describe('DELETE /thoughts/:thoughtId', () => {
    it('should delete a thought', async () => {
        mockIdeaManager.deleteThought.mockResolvedValue(true);
        const response = await request(app).delete('/thoughts/t1');
        expect(response.status).toBe(204);
    });

    it('should return 404 if thought to delete is not found', async () => {
        mockIdeaManager.deleteThought.mockResolvedValue(false);
        const response = await request(app).delete('/thoughts/not-found');
        expect(response.status).toBe(404);
    });
  });

  describe('POST /thoughts/:thoughtId/segments', () => {
    it('should create a new segment for a thought', async () => {
        const newSegmentData = { title: 'New Segment', content: 'details...' };
        const createdSegment = { id: 's1', ...newSegmentData };
        mockIdeaManager.addSegment.mockResolvedValue(createdSegment);
        const response = await request(app).post('/thoughts/t1/segments').send(newSegmentData);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(createdSegment);
    });

    it('should return 404 if thought does not exist when creating segment', async () => {
        mockIdeaManager.addSegment.mockResolvedValue(null);
        const response = await request(app)
            .post('/thoughts/not-found/segments')
            .send({ title: 'title', content: 'some content' }); // Corrected: send full data
        expect(response.status).toBe(404);
    });
  });

  describe('PUT /thoughts/:thoughtId/segments/:segmentId', () => {
    it('should update a segment', async () => {
        const updatedSegment = { id: 's1', title: 'Updated Segment' };
        mockIdeaManager.updateSegment.mockResolvedValue(updatedSegment);
        const response = await request(app).put('/thoughts/t1/segments/s1').send({ title: 'Updated Segment' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedSegment);
    });
  });

  describe('DELETE /thoughts/:thoughtId/segments/:segmentId', () => {
    it('should delete a segment', async () => {
        mockIdeaManager.deleteSegment.mockResolvedValue(true);
        const response = await request(app).delete('/thoughts/t1/segments/s1');
        expect(response.status).toBe(204);
    });
  });

  describe('Unauthenticated Access', () => {
    it('should return 401 for any request', async () => {
        const unauthenticatedApp = express();
        // Note: Do not add app.locals.ideaManager to the unauthenticated app
        // because the request will fail at the auth middleware anyway.
        unauthenticatedApp.use(express.json());
        unauthenticatedApp.use('/thoughts', thoughtRoutes); // No auth middleware
        const response = await request(unauthenticatedApp).get('/thoughts');
        expect(response.status).toBe(401);
    });
  });
});

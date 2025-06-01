import { Router, Request, Response } from 'express';
import { IdeaManager } from '../../../src/core/IdeaManager';
import { logger } from '../../../src/core/utils/logger';
import { NewThoughtData } from '../../../contracts/storageAdapter';

const router = Router();

// Middleware to attach services to request
router.use((req: Request, res: Response, next) => {
  const ideaManager: IdeaManager = req.app.locals.ideaManager;
  const logger = req.app.locals.logger;
  next();
});

// GET /api/v1/thoughts - Get all thoughts
router.get('/', async (req: Request, res: Response) => {
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const thoughts = await ideaManager.getThoughts();
    res.json(thoughts);
  } catch (error) {
    logger.error('Error fetching thoughts:', error);
    res.status(500).json({ error: 'Failed to fetch thoughts' });
  }
});

// POST /api/v1/thoughts - Create new thought
router.post('/', async (req: Request, res: Response) => {
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const thoughtData = req.body;

    // Basic validation
    if (!thoughtData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newThought = await ideaManager.addThought(thoughtData);
    res.status(201).json(newThought);
  } catch (error) {
    logger.error('Error creating thought:', error);
    res.status(500).json({ error: 'Failed to create thought' });
  }
});

// GET /api/v1/thoughts/:thoughtId - Get specific thought
router.get('/:thoughtId', async (req: Request, res: Response) => {
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const { thoughtId } = req.params;

    const thought = await ideaManager.getThoughtById(thoughtId);
    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    res.json(thought);
  } catch (error) {
    logger.error('Error fetching thought:', error);
    res.status(500).json({ error: 'Failed to fetch thought' });
  }
});

// PUT /api/v1/thoughts/:thoughtId - Update thought
router.put('/:thoughtId', async (req: Request, res: Response) => {
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const { thoughtId } = req.params;
    const updateData = req.body;

    const updatedThought = await ideaManager.updateThought(thoughtId, updateData);
    if (!updatedThought) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    res.json(updatedThought);
  } catch (error) {
    logger.error('Error updating thought:', error);
    res.status(500).json({ error: 'Failed to update thought' });
  }
});

// DELETE /api/v1/thoughts/:thoughtId - Delete thought
router.delete('/:thoughtId', async (req: Request, res: Response) => {
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const { thoughtId } = req.params;

    const success = await ideaManager.deleteThought(thoughtId);
    if (!success) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting thought:', error);
    res.status(500).json({ error: 'Failed to delete thought' });
  }
});

// POST /api/v1/thoughts/:thoughtId/segments - Create new segment
router.post('/:thoughtId/segments', async (req: Request, res: Response) => {
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const { thoughtId } = req.params;
    const segmentData = req.body;

    // Basic validation
    if (!segmentData.title || !segmentData.content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newSegment = await ideaManager.addSegment(thoughtId, segmentData);
    if (!newSegment) {
      return res.status(404).json({ error: 'Thought not found' });
    }
    res.status(201).json(newSegment);
  } catch (error) {
    logger.error('Error creating segment:', error);
    res.status(500).json({ error: 'Failed to create segment' });
  }
});

// PUT /api/v1/thoughts/:thoughtId/segments/:segmentId - Update segment
router.put('/:thoughtId/segments/:segmentId', async (req: Request, res: Response) => {
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const { thoughtId, segmentId } = req.params;
    const updateData = req.body;

    const updatedSegment = await ideaManager.updateSegment(thoughtId, segmentId, updateData);
    if (!updatedSegment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    res.json(updatedSegment);
  } catch (error) {
    logger.error('Error updating segment:', error);
    res.status(500).json({ error: 'Failed to update segment' });
  }
});

// DELETE /api/v1/thoughts/:thoughtId/segments/:segmentId - Delete segment
router.delete('/:thoughtId/segments/:segmentId', async (req: Request, res: Response) => {
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const { thoughtId, segmentId } = req.params;

    const success = await ideaManager.deleteSegment(thoughtId, segmentId);
    if (!success) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting segment:', error);
    res.status(500).json({ error: 'Failed to delete segment' });
  }
});

export default router;
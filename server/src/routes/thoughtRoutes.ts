import { Router, Request, Response, NextFunction } from 'express'; // Use Request directly
import { IdeaManager } from '../../../core/IdeaManager';
import { logger } from '../../../core/utils/logger';
import { NewThoughtData, NewSegmentData } from '../../../contracts/storageAdapter';

const router = Router();

// AuthenticatedRequest is now globally augmented. Local definition removed.


// Authentication middleware for thought routes
const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user?.isAuthenticated || !req.user.id) {
    res.status(401).json({ // Removed return from here
      error: 'Authentication required',
      message: 'Please log in to access your thoughts'
    });
    return; // Added return here
  }
  next();
  return;
};

// Apply authentication to all thought routes
router.use(requireAuth);

// GET /api/v1/thoughts - Get all thoughts for authenticated user
router.get('/', async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const ideaManager = req.app.locals.ideaManager as IdeaManager;
    const userId = req.user?.id;
    if (!userId) {
      logger.error('User ID not found in authenticated request for GET /thoughts');
      res.status(401).json({ error: 'Authentication error: User ID missing' });
      return; // Ensure path returns
    }
    const thoughts = await ideaManager.getThoughts(userId);
    res.json(thoughts); // Implicitly returns after this
  } catch (error) {
    logger.error('Error fetching thoughts:', error);
    // _next(error); // If using error middleware
    res.status(500).json({ error: 'Failed to fetch thoughts' });
    // No explicit return needed here as it's the end of the catch block
  }
});

// POST /api/v1/thoughts - Create new thought
router.post('/', async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const ideaManager = req.app.locals.ideaManager as IdeaManager;
    const thoughtData = req.body as NewThoughtData;

    // Basic validation
    if (!thoughtData.title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      logger.error('User ID not found in authenticated request for POST /thoughts');
      res.status(401).json({ error: 'Authentication error: User ID missing' });
      return;
    }

    const newThought = await ideaManager.addThought(userId, thoughtData);
    res.status(201).json(newThought);
  } catch (error) {
    logger.error('Error creating thought:', error);
    // next(error);
    res.status(500).json({ error: 'Failed to create thought' });
  }
});

// GET /api/v1/thoughts/:thoughtId - Get specific thought
router.get('/:thoughtId', async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const ideaManager = req.app.locals.ideaManager as IdeaManager;
    const { thoughtId } = req.params;

    const userId = req.user?.id;
    if (!userId) {
      logger.error('User ID not found in authenticated request for GET /thoughts/:thoughtId');
      res.status(401).json({ error: 'Authentication error: User ID missing' });
      return;
    }

    const thought = await ideaManager.getThoughtById(userId, thoughtId);
    if (!thought) {
      res.status(404).json({ error: 'Thought not found' });
      return;
    }

    res.json(thought);
  } catch (error) {
    logger.error('Error fetching thought:', error);
    // next(error);
    res.status(500).json({ error: 'Failed to fetch thought' });
  }
});

// PUT /api/v1/thoughts/:thoughtId - Update thought
router.put('/:thoughtId', async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const ideaManager = req.app.locals.ideaManager as IdeaManager;
    const { thoughtId } = req.params;
    const updateData = req.body as Partial<NewThoughtData>;

    const userId = req.user?.id;
    if (!userId) {
      logger.error('User ID not found in authenticated request for PUT /thoughts/:thoughtId');
      res.status(401).json({ error: 'Authentication error: User ID missing' });
      return;
    }

    const updatedThought = await ideaManager.updateThought(userId, thoughtId, updateData);
    if (!updatedThought) {
      res.status(404).json({ error: 'Thought not found' });
      return;
    }

    res.json(updatedThought);
  } catch (error) {
    logger.error('Error updating thought:', error);
    // next(error);
    res.status(500).json({ error: 'Failed to update thought' });
  }
});

// DELETE /api/v1/thoughts/:thoughtId - Delete thought
router.delete('/:thoughtId', async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const ideaManager = req.app.locals.ideaManager as IdeaManager;
    const { thoughtId } = req.params;

    const userId = req.user?.id;
    if (!userId) {
      logger.error('User ID not found in authenticated request for DELETE /thoughts/:thoughtId');
      res.status(401).json({ error: 'Authentication error: User ID missing' });
      return;
    }

    const success = await ideaManager.deleteThought(userId, thoughtId);
    if (!success) {
      res.status(404).json({ error: 'Thought not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting thought:', error);
    // next(error);
    res.status(500).json({ error: 'Failed to delete thought' });
  }
});

// POST /api/v1/thoughts/:thoughtId/segments - Create new segment
router.post('/:thoughtId/segments', async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const ideaManager = req.app.locals.ideaManager as IdeaManager;
    const { thoughtId } = req.params;
    const segmentData = req.body as NewSegmentData;

    // Basic validation
    if (!segmentData.title || !segmentData.content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      logger.error('User ID not found in authenticated request for POST /thoughts/:thoughtId/segments');
      res.status(401).json({ error: 'Authentication error: User ID missing' });
      return;
    }

    const newSegment = await ideaManager.addSegment(userId, thoughtId, segmentData);
    if (!newSegment) {
      res.status(404).json({ error: 'Thought not found' });
      return;
    }
    res.status(201).json(newSegment);
  } catch (error) {
    logger.error('Error creating segment:', error);
    // next(error);
    res.status(500).json({ error: 'Failed to create segment' });
  }
});

// PUT /api/v1/thoughts/:thoughtId/segments/:segmentId - Update segment
router.put('/:thoughtId/segments/:segmentId', async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const ideaManager = req.app.locals.ideaManager as IdeaManager;
    const { thoughtId, segmentId } = req.params;
    const updateData = req.body as Partial<NewSegmentData>;

    const updatedSegment = await ideaManager.updateSegment(thoughtId, segmentId, updateData);
    if (!updatedSegment) {
      res.status(404).json({ error: 'Segment not found' });
      return;
    }

    res.json(updatedSegment);
  } catch (error) {
    logger.error('Error updating segment:', error);
    // next(error);
    res.status(500).json({ error: 'Failed to update segment' });
  }
});

// DELETE /api/v1/thoughts/:thoughtId/segments/:segmentId - Delete segment
router.delete('/:thoughtId/segments/:segmentId', async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const ideaManager = req.app.locals.ideaManager as IdeaManager;
    const { thoughtId, segmentId } = req.params;

    const success = await ideaManager.deleteSegment(thoughtId, segmentId);
    if (!success) {
      res.status(404).json({ error: 'Segment not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting segment:', error);
    // next(error);
    res.status(500).json({ error: 'Failed to delete segment' });
  }
});

export default router;
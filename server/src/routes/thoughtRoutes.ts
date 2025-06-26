import { Router, Request, Response, NextFunction } from 'express'; // Added NextFunction
import { IdeaManager } from '../../../core/IdeaManager'; // Corrected path
import { logger } from '../../../core/utils/logger'; // Corrected path
import { NewThoughtData } from '../../../contracts/storageAdapter';

const router = Router();

// Authentication middleware for thought routes
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.user?.isAuthenticated) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access your thoughts'
    });
  }
  next();
};

// Apply authentication to all thought routes
router.use(requireAuth);

// Middleware to attach services to request
router.use((req: Request, res: Response, next: NextFunction) => { // Added NextFunction type
  // const ideaManager: IdeaManager = req.app.locals.ideaManager; // ideaManager is used below directly from req.app.locals
  // logger is already imported and available in module scope
  next();
});

// GET /api/v1/thoughts - Get all thoughts for authenticated user
router.get('/', async (req: Request, res: Response, next: NextFunction) => { // Added NextFunction type
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const thoughts = await ideaManager.getThoughts(req.user!.id);
    res.json(thoughts);
  } catch (error) {
    logger.error('Error fetching thoughts:', error);
    // Pass error to Express error handler if available, or handle here
    // next(error); // Example if you have an error handling middleware
    res.status(500).json({ error: 'Failed to fetch thoughts' });
  }
});

// POST /api/v1/thoughts - Create new thought
router.post('/', async (req: Request, res: Response, next: NextFunction) => { // Added NextFunction type
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const thoughtData = req.body;

    // Basic validation
    if (!thoughtData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newThought = await ideaManager.addThought(req.user!.id, thoughtData);
    res.status(201).json(newThought);
  } catch (error) {
    logger.error('Error creating thought:', error);
    // next(error);
    res.status(500).json({ error: 'Failed to create thought' });
  }
});

// GET /api/v1/thoughts/:thoughtId - Get specific thought
router.get('/:thoughtId', async (req: Request, res: Response, next: NextFunction) => { // Added NextFunction type
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const { thoughtId } = req.params;

    const thought = await ideaManager.getThoughtById(req.user!.id, thoughtId);
    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    res.json(thought);
  } catch (error) {
    logger.error('Error fetching thought:', error);
    // next(error);
    res.status(500).json({ error: 'Failed to fetch thought' });
  }
});

// PUT /api/v1/thoughts/:thoughtId - Update thought
router.put('/:thoughtId', async (req: Request, res: Response, next: NextFunction) => { // Added NextFunction type
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const { thoughtId } = req.params;
    const updateData = req.body;

    const updatedThought = await ideaManager.updateThought(req.user!.id, thoughtId, updateData);
    if (!updatedThought) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    res.json(updatedThought);
  } catch (error) {
    logger.error('Error updating thought:', error);
    // next(error);
    res.status(500).json({ error: 'Failed to update thought' });
  }
});

// DELETE /api/v1/thoughts/:thoughtId - Delete thought
router.delete('/:thoughtId', async (req: Request, res: Response, next: NextFunction) => { // Added NextFunction type
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const { thoughtId } = req.params;

    const success = await ideaManager.deleteThought(req.user!.id, thoughtId);
    if (!success) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting thought:', error);
    // next(error);
    res.status(500).json({ error: 'Failed to delete thought' });
  }
});

// POST /api/v1/thoughts/:thoughtId/segments - Create new segment
router.post('/:thoughtId/segments', async (req: Request, res: Response, next: NextFunction) => { // Added NextFunction type
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const { thoughtId } = req.params;
    const segmentData = req.body;

    // Basic validation
    if (!segmentData.title || !segmentData.content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newSegment = await ideaManager.addSegment(req.user!.id, thoughtId, segmentData);
    if (!newSegment) {
      return res.status(404).json({ error: 'Thought not found' });
    }
    res.status(201).json(newSegment);
  } catch (error) {
    logger.error('Error creating segment:', error);
    // next(error);
    res.status(500).json({ error: 'Failed to create segment' });
  }
});

// PUT /api/v1/thoughts/:thoughtId/segments/:segmentId - Update segment
router.put('/:thoughtId/segments/:segmentId', async (req: Request, res: Response, next: NextFunction) => { // Added NextFunction type
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const { thoughtId, segmentId } = req.params;
    const updateData = req.body;

    const updatedSegment = await ideaManager.updateSegment(req.user!.id, thoughtId, segmentId, updateData);
    if (!updatedSegment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    res.json(updatedSegment);
  } catch (error) {
    logger.error('Error updating segment:', error);
    // next(error);
    res.status(500).json({ error: 'Failed to update segment' });
  }
});

// DELETE /api/v1/thoughts/:thoughtId/segments/:segmentId - Delete segment
router.delete('/:thoughtId/segments/:segmentId', async (req: Request, res: Response, next: NextFunction) => { // Added NextFunction type
  try {
    const ideaManager: IdeaManager = req.app.locals.ideaManager;
    const { thoughtId, segmentId } = req.params;

    const success = await ideaManager.deleteSegment(req.user!.id, thoughtId, segmentId);
    if (!success) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting segment:', error);
    // next(error);
    res.status(500).json({ error: 'Failed to delete segment' });
  }
});

export default router;
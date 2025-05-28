import express, { Request, Response, Router } from 'express';
import { IdeaManager } from '../../../src/core/IdeaManager'; // Adjusted path
import { NewThoughtData, NewSegmentData } from '../../../src/contracts/storageAdapter'; // Adjusted path
import { Thought, Segment } from '../../../src/contracts/entities'; // Adjusted path
import { Logger } from 'pino'; // Assuming pino is the logger, or use any
// It's good practice to have ID validation utils if they exist
// import { isValidThoughtId, isValidSegmentId } from '../../../src/core/utils/idUtils';


const router = Router();

// Middleware to get services (could be a separate file)
const getServices = (req: Request) => {
  const ideaManager = req.app.locals.ideaManager as IdeaManager;
  const logger = req.app.locals.logger as Logger;
  if (!ideaManager) {
    throw new Error('IdeaManager not found in app.locals. Ensure it is set up correctly in server/src/index.ts.');
  }
  if (!logger) {
    // Fallback to console if logger is not found, though it should be an error
    console.error('Logger not found in app.locals!');
    throw new Error('Logger not found in app.locals. Ensure it is set up correctly in server/src/index.ts.');
  }
  return { ideaManager, logger };
};

// GET / (Get All Thoughts)
router.get('/', async (req: Request, res: Response) => {
  let logger: Logger;
  try {
    const services = getServices(req);
    logger = services.logger;
    const ideaManager = services.ideaManager;

    logger.info('[ThoughtRoutes] GET / - Getting all thoughts');
    const thoughts = await ideaManager.getThoughts();
    res.status(200).json(thoughts);
  } catch (error: any) {
    const localLogger = logger! || console; // Use console if logger failed to init
    localLogger.error(`[ThoughtRoutes] GET / - Error: ${error.message}`, { stack: error.stack });
    if (error.message.includes("not found in app.locals")) {
        return res.status(500).json({ error: "Server configuration error: services not loaded." });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- Segment Routes ---

// POST /:thoughtId/segments (Create New Segment for a Thought)
router.post('/:thoughtId/segments', async (req: Request, res: Response) => {
  let logger: Logger;
  try {
    const services = getServices(req);
    logger = services.logger;
    const ideaManager = services.ideaManager;
    
    const { thoughtId } = req.params;
    // Optional: Validate thoughtId format if a utility like isValidThoughtId exists
    // if (!isValidThoughtId(thoughtId)) {
    //   logger.warn(`[ThoughtRoutes/:thoughtId/segments] POST - Invalid thought ID format: ${thoughtId}`);
    //   return res.status(400).json({ error: 'Invalid thought ID format' });
    // }

    logger.info(`[ThoughtRoutes/:thoughtId/segments] POST - Creating new segment for thought ${thoughtId}`);

    // Basic validation for required fields in NewSegmentData
    const { title, content, content_type, asset_path, fields, abstraction_level, local_priority, cluster_id } = req.body;
    if (!title || !content || !content_type) {
      logger.warn(`[ThoughtRoutes/:thoughtId/segments] POST - Validation failed: title, content, and content_type are required.`);
      return res.status(400).json({ error: 'Title, content, and content_type are required for a new segment.' });
    }

    // IdeaManager.addSegment expects Omit<NewSegmentData, 'segment_id' | 'thought_bubble_id'>
    // The NewSegmentData interface now includes segment_id and thought_bubble_id,
    // but IdeaManager.addSegment's second parameter is specifically typed to exclude them.
    const newSegmentData: Omit<NewSegmentData, 'segment_id' | 'thought_bubble_id'> = {
      title,
      content,
      content_type,
      asset_path,
      fields,
      abstraction_level,
      local_priority,
      cluster_id,
    };
    
    const createdSegment = await ideaManager.addSegment(thoughtId, newSegmentData);

    if (createdSegment) {
      logger.info(`[ThoughtRoutes/:thoughtId/segments] POST - Segment created with ID: ${createdSegment.segment_id}`);
      res.status(201).json(createdSegment);
    } else {
      // This case might happen if the thoughtId does not exist or other logic in addSegment prevents creation
      logger.warn(`[ThoughtRoutes/:thoughtId/segments] POST - Failed to create segment. Thought ID ${thoughtId} might not exist or other issue.`);
      res.status(404).json({ error: 'Failed to create segment. Thought not found or invalid data.' });
    }
  } catch (error: any) {
    const localLogger = logger! || console;
    localLogger.error(`[ThoughtRoutes/:thoughtId/segments] POST - Error: ${error.message}`, { stack: error.stack });
    if (error.message.includes("not found in app.locals")) {
        return res.status(500).json({ error: "Server configuration error: services not loaded." });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /:thoughtId/segments/:segmentId (Update Segment)
router.put('/:thoughtId/segments/:segmentId', async (req: Request, res: Response) => {
  let logger: Logger;
  try {
    const services = getServices(req);
    logger = services.logger;
    const ideaManager = services.ideaManager;

    const { thoughtId, segmentId } = req.params;
    // Optional: Validate ID formats
    // if (!isValidThoughtId(thoughtId) || !isValidSegmentId(segmentId)) {
    //   logger.warn(`[ThoughtRoutes/:thoughtId/segments/:segmentId] PUT - Invalid ID format. ThoughtID: ${thoughtId}, SegmentID: ${segmentId}`);
    //   return res.status(400).json({ error: 'Invalid thought or segment ID format' });
    // }
    
    // Exclude IDs and timestamps from req.body for the update payload
    const { segment_id, thought_bubble_id, created_at, updated_at, ...updateData } = req.body;

    if (Object.keys(updateData).length === 0) {
        logger.warn(`[ThoughtRoutes/:thoughtId/segments/:segmentId] PUT - No valid fields provided for update.`);
        return res.status(400).json({ error: 'No valid fields provided for segment update.' });
    }

    logger.info(`[ThoughtRoutes/:thoughtId/segments/:segmentId] PUT - Updating segment ${segmentId} for thought ${thoughtId}`);
    
    // IdeaManager.updateSegment expects Partial<Omit<Segment, 'segment_id' | 'thought_bubble_id' | 'created_at'>>
    // The 'updateData' object created above fits this type.
    const updatedSegment = await ideaManager.updateSegment(thoughtId, segmentId, updateData);

    if (updatedSegment) {
      logger.info(`[ThoughtRoutes/:thoughtId/segments/:segmentId] PUT - Segment ${segmentId} updated successfully`);
      res.status(200).json(updatedSegment);
    } else {
      logger.warn(`[ThoughtRoutes/:thoughtId/segments/:segmentId] PUT - Segment ${segmentId} or Thought ${thoughtId} not found for update`);
      res.status(404).json({ error: 'Segment or associated Thought not found' });
    }
  } catch (error: any) {
    const localLogger = logger! || console;
    localLogger.error(`[ThoughtRoutes/:thoughtId/segments/:segmentId] PUT - Error: ${error.message}`, { stack: error.stack });
    if (error.message.includes("not found in app.locals")) {
        return res.status(500).json({ error: "Server configuration error: services not loaded." });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /:thoughtId/segments/:segmentId (Delete Segment)
router.delete('/:thoughtId/segments/:segmentId', async (req: Request, res: Response) => {
  let logger: Logger;
  try {
    const services = getServices(req);
    logger = services.logger;
    const ideaManager = services.ideaManager;

    const { thoughtId, segmentId } = req.params;
    // Optional: Validate ID formats
    // if (!isValidThoughtId(thoughtId) || !isValidSegmentId(segmentId)) {
    //   logger.warn(`[ThoughtRoutes/:thoughtId/segments/:segmentId] DELETE - Invalid ID format. ThoughtID: ${thoughtId}, SegmentID: ${segmentId}`);
    //   return res.status(400).json({ error: 'Invalid thought or segment ID format' });
    // }

    logger.info(`[ThoughtRoutes/:thoughtId/segments/:segmentId] DELETE - Deleting segment ${segmentId} from thought ${thoughtId}`);
    const success = await ideaManager.deleteSegment(thoughtId, segmentId);

    if (success) {
      logger.info(`[ThoughtRoutes/:thoughtId/segments/:segmentId] DELETE - Segment ${segmentId} deleted successfully`);
      res.status(204).send();
    } else {
      logger.warn(`[ThoughtRoutes/:thoughtId/segments/:segmentId] DELETE - Segment ${segmentId} or Thought ${thoughtId} not found for deletion`);
      res.status(404).json({ error: 'Segment or associated Thought not found' });
    }
  } catch (error: any) {
    const localLogger = logger! || console;
    localLogger.error(`[ThoughtRoutes/:thoughtId/segments/:segmentId] DELETE - Error: ${error.message}`, { stack: error.stack });
    if (error.message.includes("not found in app.locals")) {
        return res.status(500).json({ error: "Server configuration error: services not loaded." });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST / (Create New Thought)
router.post('/', async (req: Request, res: Response) => {
  let logger: Logger;
  try {
    const services = getServices(req);
    logger = services.logger;
    const ideaManager = services.ideaManager;
    
    logger.info('[ThoughtRoutes] POST / - Creating new thought');
    const { title, description, color, position } = req.body;

    if (!title) {
      logger.warn('[ThoughtRoutes] POST / - Validation failed: Title is required');
      return res.status(400).json({ error: 'Title is required' });
    }

    const newThoughtData: NewThoughtData = {
      title,
      description,
      color,
      position,
    };

    const createdThought = await ideaManager.addThought(newThoughtData);
    logger.info(`[ThoughtRoutes] POST / - Thought created with ID: ${createdThought.thought_bubble_id}`);
    res.status(201).json(createdThought);
  } catch (error: any) {
    const localLogger = logger! || console;
    localLogger.error(`[ThoughtRoutes] POST / - Error: ${error.message}`, { stack: error.stack });
     if (error.message.includes("not found in app.locals")) {
        return res.status(500).json({ error: "Server configuration error: services not loaded." });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /:thoughtId (Get Thought by ID)
router.get('/:thoughtId', async (req: Request, res: Response) => {
  let logger: Logger;
  try {
    const services = getServices(req);
    logger = services.logger;
    const ideaManager = services.ideaManager;
    
    const { thoughtId } = req.params;
    logger.info(`[ThoughtRoutes] GET /${thoughtId} - Getting thought by ID`);

    const thought = await ideaManager.getThoughtById(thoughtId);

    if (thought) {
      res.status(200).json(thought);
    } else {
      logger.warn(`[ThoughtRoutes] GET /${thoughtId} - Thought not found`);
      res.status(404).json({ error: 'Thought not found' });
    }
  } catch (error: any) {
    const localLogger = logger! || console;
    localLogger.error(`[ThoughtRoutes] GET /:thoughtId - Error: ${error.message}`, { stack: error.stack });
     if (error.message.includes("not found in app.locals")) {
        return res.status(500).json({ error: "Server configuration error: services not loaded." });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /:thoughtId (Update Thought)
router.put('/:thoughtId', async (req: Request, res: Response) => {
  let logger: Logger;
  try {
    const services = getServices(req);
    logger = services.logger;
    const ideaManager = services.ideaManager;

    const { thoughtId } = req.params;
    // Ensure req.body does not contain forbidden fields like thought_bubble_id, created_at, segments, tags
    // The IdeaManager's updateThought method takes Partial<Omit<Thought, 'thought_bubble_id' | 'created_at' | 'segments' | 'tags'>>
    // So we can directly pass req.body if we trust the client or add a sanitization step here.
    const { title, description, color, position, segments, tags, created_at, updated_at, thought_bubble_id, ...otherProps } = req.body;
    
    if (Object.keys(otherProps).length > 0) {
        logger.warn(`[ThoughtRoutes] PUT /${thoughtId} - Attempt to update with invalid fields: ${Object.keys(otherProps).join(', ')}`);
        // Depending on strictness, could return 400 or just ignore these fields.
        // For now, we proceed with only the allowed fields.
    }
    
    const updateData: Partial<Omit<Thought, 'thought_bubble_id' | 'created_at' | 'segments' | 'tags'>> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (position !== undefined) updateData.position = position;

    if (Object.keys(updateData).length === 0) {
        logger.warn(`[ThoughtRoutes] PUT /${thoughtId} - No valid fields provided for update.`);
        return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    logger.info(`[ThoughtRoutes] PUT /${thoughtId} - Updating thought`);
    const updatedThought = await ideaManager.updateThought(thoughtId, updateData);

    if (updatedThought) {
      logger.info(`[ThoughtRoutes] PUT /${thoughtId} - Thought updated successfully`);
      res.status(200).json(updatedThought);
    } else {
      logger.warn(`[ThoughtRoutes] PUT /${thoughtId} - Thought not found for update`);
      res.status(404).json({ error: 'Thought not found' });
    }
  } catch (error: any) {
    const localLogger = logger! || console;
    localLogger.error(`[ThoughtRoutes] PUT /:thoughtId - Error: ${error.message}`, { stack: error.stack });
     if (error.message.includes("not found in app.locals")) {
        return res.status(500).json({ error: "Server configuration error: services not loaded." });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /:thoughtId (Delete Thought)
router.delete('/:thoughtId', async (req: Request, res: Response) => {
  let logger: Logger;
  try {
    const services = getServices(req);
    logger = services.logger;
    const ideaManager = services.ideaManager;
    
    const { thoughtId } = req.params;
    logger.info(`[ThoughtRoutes] DELETE /${thoughtId} - Deleting thought`);

    const success = await ideaManager.deleteThought(thoughtId);

    if (success) {
      logger.info(`[ThoughtRoutes] DELETE /${thoughtId} - Thought deleted successfully`);
      res.status(204).send();
    } else {
      logger.warn(`[ThoughtRoutes] DELETE /${thoughtId} - Thought not found for deletion`);
      res.status(404).json({ error: 'Thought not found' });
    }
  } catch (error: any) {
    const localLogger = logger! || console;
    localLogger.error(`[ThoughtRoutes] DELETE /:thoughtId - Error: ${error.message}`, { stack: error.stack });
     if (error.message.includes("not found in app.locals")) {
        return res.status(500).json({ error: "Server configuration error: services not loaded." });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;

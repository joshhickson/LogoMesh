
import express, { Request, Response } from 'express';
import { logger } from '../../../core/utils/logger';

const router = express.Router();

// Get current user info
router.get('/me', (req: Request, res: Response) => {
  try {
    if (!req.user?.isAuthenticated) {
      return res.status(401).json({ 
        error: 'Not authenticated',
        message: 'Please log in to access this resource'
      });
    }

    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        roles: req.user.roles,
        isAuthenticated: req.user.isAuthenticated
      }
    });
  } catch (error) {
    logger.error('[UserRoutes] Error getting user info:', error);
    res.status(500).json({ 
      error: 'Failed to get user info',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check for user services
router.get('/health', (req: Request, res: Response) => {
  res.json({ 
    service: 'user-auth', 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    authenticated: req.user?.isAuthenticated || false
  });
});

export default router;

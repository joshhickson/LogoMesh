
import express, { Request, Response } from 'express'; // Use Request directly
import { logger } from '../../../core/utils/logger';

const router = express.Router();

// AuthenticatedRequest is now globally augmented. Local definition removed.

// Get current user info
router.get('/me', (req: Request, res: Response): void => {
  try {
    // After requireAuth middleware (if applied globally or to this route), req.user should be set.
    // The check here is an additional safeguard or for routes not using requireAuth.
    if (!req.user?.isAuthenticated) { // req.user is now from augmented Request
      res.status(401).json({
        error: 'Not authenticated',
        message: 'Please log in to access this resource'
      });
      return;
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

// Get current user info (alternative endpoint that frontend is calling)
router.get('/current', (req: Request, res: Response): void => {
  try {
    if (!req.user?.isAuthenticated) {
      res.status(401).json({
        error: 'Not authenticated',
        message: 'Please log in to access this resource'
      });
      return;
    }

    res.json({
      id: req.user.id,
      name: req.user.name,
      roles: req.user.roles,
      isAuthenticated: req.user.isAuthenticated
    });
  } catch (error) {
    logger.error('[UserRoutes] Error getting current user:', error);
    res.status(500).json({ 
      error: 'Failed to get current user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check for user services
router.get('/health', (req: Request, res: Response): void => {
  res.json({ 
    service: 'user-auth', 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    authenticated: req.user?.isAuthenticated || false
  });
});

export default router;

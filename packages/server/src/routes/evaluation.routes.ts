import { Router, Request, Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import {
  EvaluationOrchestrator,
  SQLiteAdapter,
  A2AClient,
} from '@logomesh/core';

const router = Router();

// Conditionally apply auth middleware. In a test environment, we use a mock
// middleware to bypass the need for a real access token.
const checkJwt =
  process.env.NODE_ENV === 'test'
    ? (req: Request, res: Response, next: NextFunction) => {
        // Mock authentication for testing purposes
        // Vitest/Supertest requires extending the Request type for custom properties,
        // which is outside the scope of this fix. We'll use `any` for now.
        (req as any).auth = { sub: 'test-user' };
        next();
      }
    : auth({
        audience: process.env.AUTH0_AUDIENCE,
        issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
      });

// Instantiate all dependencies. In a real application, this would use a dependency injection container.
const storageAdapter = new SQLiteAdapter();
const a2aClient = new A2AClient();

const orchestrator = new EvaluationOrchestrator(
  storageAdapter,
  a2aClient
);

// Initialize storage.
storageAdapter.initialize().then(() => {
  storageAdapter.createThought({
    title: 'Competition Task',
    description: 'Implement a user authentication endpoint with JWT.',
  });
});

router.post('/', checkJwt, async (req, res) => {
  const { purple_agent_endpoint } = req.body;

  if (!purple_agent_endpoint) {
    return res.status(400).json({ error: 'purple_agent_endpoint is required' });
  }

  try {
    const evaluationId = await orchestrator.startEvaluation(
      purple_agent_endpoint,
    );
    // Respond immediately with 202 Accepted
    return res.status(202).json({
      message: 'Evaluation started.',
      evaluationId,
      statusUrl: `/v1/evaluate/${evaluationId}`,
    });
  } catch (error) {
    console.error('Failed to start evaluation:', error);
    return res
      .status(500)
      .json({ error: 'An internal error occurred.' });
  }
});

router.get('/:evaluation_id', checkJwt, async (req, res) => {
  const { evaluation_id } = req.params;
  const evaluation = await orchestrator.getEvaluation(evaluation_id);

  if (!evaluation) {
    return res.status(404).json({ error: 'Evaluation not found.' });
  }

  return res.status(200).json(evaluation);
});

export { router as evaluationRoutes };

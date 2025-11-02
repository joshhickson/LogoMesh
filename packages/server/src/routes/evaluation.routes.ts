import { Router } from 'express';
import {
  EvaluationOrchestrator,
  SQLiteAdapter,
  A2AClient,
  RationaleDebtAnalyzer,
  ArchitecturalDebtAnalyzer,
  TestingDebtAnalyzer,
} from '@logomesh/core';

const router = Router();

// Instantiate all dependencies. In a real application, this would use a dependency injection container.
const storageAdapter = new SQLiteAdapter(); // Using in-memory for now
const a2aClient = new A2AClient();
// TODO: The RationaleDebtAnalyzer needs a real LlmClient. For now, we can use a mock.
const mockLlmClient = { prompt: async () => '{ "score": 0.5, "details": "mocked" }' };
const rationaleAnalyzer = new RationaleDebtAnalyzer(mockLlmClient);
const archAnalyzer = new ArchitecturalDebtAnalyzer();
const testAnalyzer = new TestingDebtAnalyzer();

const orchestrator = new EvaluationOrchestrator(
storageAdapter,
a2aClient,
rationaleAnalyzer,
archAnalyzer,
testAnalyzer
);

// Initialize storage and add a dummy task thought for the MVP
storageAdapter.initialize().then(() => {
storageAdapter.createThought({
title: 'Competition Task',
description: 'Implement a user authentication endpoint with JWT.',
});
});

router.post('/', async (req, res) => {
const { purple_agent_endpoint } = req.body;

if (!purple_agent_endpoint) {
return res.status(400).json({ error: 'purple_agent_endpoint is required' });
}

try {
const result = await orchestrator.runEvaluation(purple_agent_endpoint);
return res.status(200).json(result);
} catch (error) {
console.error('Evaluation failed:', error);
return res.status(500).json({ error: 'An internal error occurred during evaluation.' });
}
});

// Remove the 501 placeholder for the GET route
router.get('/:evaluation_id', (req, res) => {
// In a real implementation, this would fetch the result from the database.
res.status(501).json({ message: 'Not Implemented' });
});

export { router as evaluationRoutes };

import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
});

router.get('/:evaluation_id', (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
});

export { router as evaluationRoutes };

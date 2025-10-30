import express from 'express';
import cors from 'cors';
import { evaluationRoutes } from './routes/evaluation.routes';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/v1/evaluate', evaluationRoutes);

export default app;

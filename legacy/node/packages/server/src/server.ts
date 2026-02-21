import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { evaluationRoutes } from './routes/evaluation.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Rate Limiting Middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(apiLimiter);

// API Routes
app.use('/v1/evaluate', evaluationRoutes);

export default app;

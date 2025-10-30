import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { evaluationRoutes } from './routes/evaluation.routes';
// We will create this middleware next
// import { jwtAuthMiddleware } from './middleware/auth';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(apiLimiter);

// API Routes
// app.use('/v1/evaluate', jwtAuthMiddleware, evaluationRoutes);
app.use('/v1/evaluate', evaluationRoutes); // Add JWT middleware later

export default app;

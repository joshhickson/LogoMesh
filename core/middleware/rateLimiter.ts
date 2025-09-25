import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import requestIp from 'request-ip';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: Request): string => {
    return requestIp.getClientIp(req) || 'unknown';
  },
  skip: (req: Request) => {
    // Whitelist /status and /health endpoints
    return req.path === '/status' || req.path === '/health';
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests, please try again later.',
      rateLimit: {
        limit: 100,
        remaining: 0,
        resetTime: new Date(Date.now() + 60 * 1000),
      },
    });
  },
});

import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  whitelist?: string[];
}

interface ClientStats {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private clients = new Map<string, ClientStats>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private getClientKey(req: Request): string {
    // Use forwarded IP if available (for proxy/load balancer scenarios)
    return req.headers['x-forwarded-for'] as string || 
           req.headers['x-real-ip'] as string ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, stats] of this.clients.entries()) {
      if (now > stats.resetTime) {
        this.clients.delete(key);
      }
    }
  }

  private isWhitelisted(req: Request): boolean {
    if (!this.config.whitelist) return false;
    
    return this.config.whitelist.some(pattern => {
      if (pattern.startsWith('/')) {
        return req.path.startsWith(pattern);
      }
      return req.path === pattern;
    });
  }

  middleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
      // Skip whitelisted paths
      if (this.isWhitelisted(req)) {
        return next();
      }

      const clientKey = this.getClientKey(req);
      const now = Date.now();
      
      let stats = this.clients.get(clientKey);
      
      if (!stats || now > stats.resetTime) {
        stats = {
          count: 1,
          resetTime: now + this.config.windowMs
        };
        this.clients.set(clientKey, stats);
        return next();
      }

      if (stats.count >= this.config.maxRequests) {
        const resetInSeconds = Math.ceil((stats.resetTime - now) / 1000);
        
        res.status(429).json({
          error: this.config.message,
          retryAfter: resetInSeconds,
          limit: this.config.maxRequests,
          windowMs: this.config.windowMs
        });
        return;
      }

      stats.count++;
      next();
    };
  };

  /**
   * Get current stats for a client
   */
  getClientStats(req: Request): { requests: number; resetTime: number; limit: number } {
    const clientKey = this.getClientKey(req);
    const stats = this.clients.get(clientKey);
    
    return {
      requests: stats?.count || 0,
      resetTime: stats?.resetTime || 0,
      limit: this.config.maxRequests
    };
  }
}

// Pre-configured rate limiters for different use cases
export const createApiRateLimiter = () => new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Too many API requests',
  whitelist: ['/status', '/health']
});

export const createLLMRateLimiter = () => new RateLimiter({
  windowMs: 60 * 1000, // 1 minute  
  maxRequests: 20,
  message: 'Too many LLM requests'
});

export const createAuthRateLimiter = () => new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts'
});


import jwt, { JwtPayload } from 'jsonwebtoken';
import { ServiceResponse } from '../../contracts/types';
import { Request as ExpressRequest, Response, NextFunction } from 'express';
// AuthenticatedRequest is now globally augmented via server/src/types/express.d.ts
// No local definition needed. AuthUser is used for the structure of req.user.

export interface AuthUser {
  id: string;
  name: string;
  roles: string; // Changed to string
  isAuthenticated: boolean;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiration: string;
}

export class AuthService {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  /**
   * Generate JWT token for authenticated user
   */
  generateToken(user: AuthUser): string {
    return jwt.sign(
      {
        id: user.id,
        name: user.name,
        roles: user.roles
      },
      this.config.jwtSecret as jwt.Secret,
      { expiresIn: this.config.jwtExpiration } as jwt.SignOptions
    );
  }

  /**
   * Verify and decode JWT token
   */
  verifyToken(token: string): ServiceResponse<AuthUser> {
    try {
      // jwt.verify can return JwtPayload or string. We expect JwtPayload.
      const decoded = jwt.verify(token, this.config.jwtSecret);
      
      if (typeof decoded === 'string') {
        throw new Error('Invalid token payload: expected object, got string');
      }
      // Now decoded is JwtPayload
      const jwtPayload = decoded as JwtPayload;


      return {
        success: true,
        data: {
          id: jwtPayload.id as string,
          name: jwtPayload.name as string,
          roles: (jwtPayload.roles as string) || '', // Expect roles as string from JWT
          isAuthenticated: true
        }
      };
    } catch {
      return {
        success: false,
        error: {
          code: 'AUTH_INVALID_TOKEN',
          message: 'Invalid or expired token',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Middleware for token validation
   */
  requireAuth = (req: ExpressRequest, res: Response, next: NextFunction) => { // Use augmented ExpressRequest
    const token = this.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_MISSING_TOKEN'
      });
    }

    const authResult = this.verifyToken(token);
    
    if (!authResult.success || authResult.data === undefined) { // Explicitly check data
      return res.status(401).json({
        error: authResult.error?.message || 'Authentication failed, missing data.',
        code: authResult.error?.code || 'AUTH_VERIFY_FAILED'
      });
    }
    // Now authResult.data is definitely AuthUser
    req.user = authResult.data; // No cast needed if AuthUser and AuthUserForRequest are compatible
    next();
    return;
  };

  /**
   * Check if user has required role
   */
  hasRole(user: AuthUser, requiredRole: string): boolean {
    const rolesArray = user.roles ? user.roles.split(',').map(r => r.trim()) : [];
    return rolesArray.includes(requiredRole) || rolesArray.includes('admin');
  }

  /**
   * Middleware for role-based access control
   */
  requireRole = (role: string) => {
    return (req: ExpressRequest, res: Response, next: NextFunction) => { // Use augmented ExpressRequest
      if (!req.user) { // req.user is now available via augmentation
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_MISSING_USER'
        });
      }

      if (!this.hasRole(req.user, role)) { // req.user is AuthUserForRequest, this.hasRole expects AuthUser. They should be compatible.
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'AUTH_INSUFFICIENT_ROLE',
          requiredRole: role
        });
      }

      next();
      return; // Added to satisfy noImplicitReturns
    };
  };
}

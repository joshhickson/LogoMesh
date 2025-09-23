import jwt, { JwtPayload } from 'jsonwebtoken';
import { ServiceResponse } from '../../contracts/types';
import { Request as ExpressRequest, Response, NextFunction } from 'express';
import config from '@core/config';

export interface AuthUser {
  id: string;
  name: string;
  roles: string;
  isAuthenticated: boolean;
}

export class AuthService {
  private config = config.jwt;

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
      this.config.secret as jwt.Secret,
      { expiresIn: '1h' } as jwt.SignOptions
    );
  }

  /**
   * Verify and decode JWT token
   */
  verifyToken(token: string): ServiceResponse<AuthUser> {
    try {
      const decoded = jwt.verify(token, this.config.secret);

      if (typeof decoded === 'string') {
        throw new Error('Invalid token payload: expected object, got string');
      }
      const jwtPayload = decoded as JwtPayload;

      return {
        success: true,
        data: {
          id: jwtPayload.id as string,
          name: jwtPayload.name as string,
          roles: (jwtPayload.roles as string) || '',
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
  requireAuth = (req: ExpressRequest, res: Response, next: NextFunction) => {
    const token = this.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_MISSING_TOKEN'
      });
    }

    const authResult = this.verifyToken(token);

    if (!authResult.success || authResult.data === undefined) {
      return res.status(401).json({
        error: authResult.error?.message || 'Authentication failed, missing data.',
        code: authResult.error?.code || 'AUTH_VERIFY_FAILED'
      });
    }
    req.user = authResult.data;
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
    return (req: ExpressRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_MISSING_USER'
        });
      }

      if (!this.hasRole(req.user, role)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'AUTH_INSUFFICIENT_ROLE',
          requiredRole: role
        });
      }

      next();
      return;
    };
  };
}

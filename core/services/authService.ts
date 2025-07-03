
import jwt from 'jsonwebtoken';
import { ServiceResponse, ServiceError } from '../../contracts/types';

export interface AuthUser {
  id: string;
  name: string;
  roles: string[];
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
      this.config.jwtSecret,
      { expiresIn: this.config.jwtExpiration }
    );
  }

  /**
   * Verify and decode JWT token
   */
  verifyToken(token: string): ServiceResponse<AuthUser> {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret) as any;
      
      return {
        success: true,
        data: {
          id: decoded.id,
          name: decoded.name,
          roles: decoded.roles || [],
          isAuthenticated: true
        }
      };
    } catch (error) {
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
  requireAuth = (req: any, res: any, next: any) => {
    const token = this.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_MISSING_TOKEN'
      });
    }

    const authResult = this.verifyToken(token);
    
    if (!authResult.success) {
      return res.status(401).json({
        error: authResult.error?.message,
        code: authResult.error?.code
      });
    }

    req.user = authResult.data;
    next();
  };

  /**
   * Check if user has required role
   */
  hasRole(user: AuthUser, requiredRole: string): boolean {
    return user.roles.includes(requiredRole) || user.roles.includes('admin');
  }

  /**
   * Middleware for role-based access control
   */
  requireRole = (role: string) => {
    return (req: any, res: any, next: any) => {
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
    };
  };
}

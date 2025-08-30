// Augment Express Request type to include 'user' and other app.locals

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IdeaManager } from '../../../core/IdeaManager';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { EventBus } from '../../../core/services/eventBus';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PortabilityService } from '../../../core/services/portabilityService';
import { AuthService } from '../../../core/services/authService';

// AuthUserForRequest is no longer exported from here, defined inline for augmentation.
// If other modules need this specific shape, they should define it or import from a central type def.
// For now, core/services/authService.ts's AuthUser will be the source of truth for that structure.

declare global {
  namespace Express {
    export interface Request {
      user?: { // Using anonymous structural type directly
        id: string;
        name: string;
        roles: string;
        isAuthenticated: boolean;
      };
    }
    export interface Application {
      locals: {
        ideaManager: IdeaManager;
        eventBus: EventBus;
        portabilityService: PortabilityService;
        authService: AuthService;
      };
    }
  }
}

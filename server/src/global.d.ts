declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        roles: string;
        isAuthenticated: boolean;
      };
    }
  }
}

export {};

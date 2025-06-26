// This declaration helps TypeScript understand 'sqlite3' when types are not automatically found.
// It essentially tells TypeScript to treat 'sqlite3' as an 'any' type if no other types are resolved.
declare module 'sqlite3';

// Add uuid module declaration to help TypeScript resolve it from the core directory
declare module 'uuid' {
  export function v4(): string;
}
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

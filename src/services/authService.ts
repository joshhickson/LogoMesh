import config from '../../core/config';

export interface User {
  id: string;
  name: string;
  isAuthenticated: boolean;
}

class AuthService {
  user: User | null;
  isAuthenticated: boolean;

  constructor() {
    this.user = null;
    this.isAuthenticated = false;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const apiBaseUrl = config.frontend.apiUrl.replace('/api/v1', '');
      const response = await fetch(`${apiBaseUrl}/api/v1/user/current`);

      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.isAuthenticated) {
          this.user = userData;
          this.isAuthenticated = true;
          return userData;
        }
      }

      const replitUserId = window.REPLIT_USER_ID;
      const replitUserName = window.REPLIT_USER_NAME;

      if (replitUserId) {
        const replitUser: User = {
          id: replitUserId,
          name: replitUserName || 'Replit User',
          isAuthenticated: true
        };
        this.user = replitUser;
        this.isAuthenticated = true;
        return replitUser;
      }

      this.user = null;
      this.isAuthenticated = false;
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);

      const replitUserId = window.REPLIT_USER_ID;
      const replitUserName = window.REPLIT_USER_NAME;

      if (replitUserId) {
        const replitUser: User = {
          id: replitUserId,
          name: replitUserName || 'Replit User',
          isAuthenticated: true
        };
        this.user = replitUser;
        this.isAuthenticated = true;
        return replitUser;
      }

      this.user = null;
      this.isAuthenticated = false;
      return null;
    }
  }

  getUser(): User | null {
    return this.user;
  }

  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  logout(): void {
    this.user = null;
    this.isAuthenticated = false;
    window.location.reload();
  }
}

export const authService = new AuthService();

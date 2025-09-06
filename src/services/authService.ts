export interface User {
  id: string;
  username: string;
  email?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

class AuthService {
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null
  };

  private listeners: Array<(authState: AuthState) => void> = [];

  constructor() {
    this.loadAuthState();
  }

  private loadAuthState(): void {
    try {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');

      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        this.authState = {
          isAuthenticated: true,
          user,
          token
        };
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      this.clearAuthState();
    }
  }

  private saveAuthState(): void {
    try {
      if (this.authState.token && this.authState.user) {
        localStorage.setItem('auth_token', this.authState.token);
        localStorage.setItem('auth_user', JSON.stringify(this.authState.user));
      } else {
        this.clearAuthState();
      }
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }

  private clearAuthState(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.authState = {
      isAuthenticated: false,
      user: null,
      token: null
    };
  }

  public login(user: User, token: string): void {
    this.authState = {
      isAuthenticated: true,
      user,
      token
    };
    this.saveAuthState();
    this.notifyListeners();
  }

  public logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.authState = {
      isAuthenticated: false,
      user: null,
      token: null
    };
    this.notifyListeners();
  }

  getCurrentUser() {
    return this.authState.user;
  }

  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  public getUser(): User | null {
    return this.authState.user;
  }

  public getToken(): string | null {
    return this.authState.token;
  }

  public addAuthListener(listener: (authState: AuthState) => void): void {
    this.listeners.push(listener);
  }

  public removeAuthListener(listener: (authState: AuthState) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getAuthState());
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }
}

export const authService = new AuthService();
export default authService;
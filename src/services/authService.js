
class AuthService {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
  }

  async getCurrentUser() {
    try {
      const response = await fetch('/api/v1/users/me');
      if (response.ok) {
        const data = await response.json();
        if (data && data.user) {
          this.user = data.user;
          this.isAuthenticated = data.user.isAuthenticated;
          return data.user;
        } else {
          this.user = null;
          this.isAuthenticated = false;
          return null;
        }
      } else {
        this.user = null;
        this.isAuthenticated = false;
        return null;
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
      this.user = null;
      this.isAuthenticated = false;
      return null;
    }
  }

  getUser() {
    return this.user;
  }

  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  logout() {
    this.user = null;
    this.isAuthenticated = false;
    // Replit Auth logout would be handled by reloading the page
    window.location.reload();
  }
}

export const authService = new AuthService();


class AuthService {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
  }

  async getCurrentUser() {
    try {
      // Try the API endpoint first
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiBaseUrl}/api/v1/user/current`);
      
      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.isAuthenticated) {
          this.user = userData;
          this.isAuthenticated = true;
          return userData;
        }
      }
      
      // Fallback to Replit auth headers (for when backend is not available)
      if (window.REPLIT_USER_ID) {
        const replitUser = {
          id: window.REPLIT_USER_ID,
          name: window.REPLIT_USER_NAME || 'Replit User',
          isAuthenticated: true
        };
        this.user = replitUser;
        this.isAuthenticated = true;
        return replitUser;
      }
      
      // No authentication found
      this.user = null;
      this.isAuthenticated = false;
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      
      // Fallback to Replit auth even on error
      if (window.REPLIT_USER_ID) {
        const replitUser = {
          id: window.REPLIT_USER_ID,
          name: window.REPLIT_USER_NAME || 'Replit User',
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

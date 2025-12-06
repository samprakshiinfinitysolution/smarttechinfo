// Session Manager for handling token expiration and auto-logout
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

class SessionManager {
  private inactivityTimer: NodeJS.Timeout | null = null;
  private tokenExpiryTimer: NodeJS.Timeout | null = null;

  // Initialize session tracking
  init(role: 'admin' | 'user') {
    this.clearTimers();
    this.startInactivityTimer(role);
    this.startTokenExpiryTimer(role);
    this.setupActivityListeners(role);
  }

  // Start inactivity timer
  private startInactivityTimer(role: 'admin' | 'user') {
    this.inactivityTimer = setTimeout(() => {
      this.logout(role, 'Session expired due to inactivity');
    }, INACTIVITY_TIMEOUT);
  }

  // Start token expiry timer
  private startTokenExpiryTimer(role: 'admin' | 'user') {
    const tokenKey = role === 'admin' ? 'adminToken' : 'token';
    const tokenTime = localStorage.getItem(`${tokenKey}_time`);
    
    if (tokenTime) {
      const elapsed = Date.now() - parseInt(tokenTime);
      const remaining = TOKEN_EXPIRY - elapsed;
      
      if (remaining > 0) {
        this.tokenExpiryTimer = setTimeout(() => {
          this.logout(role, 'Session expired');
        }, remaining);
      } else {
        this.logout(role, 'Session expired');
      }
    }
  }

  // Reset inactivity timer on user activity
  private resetInactivityTimer(role: 'admin' | 'user') {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    this.startInactivityTimer(role);
  }

  // Setup activity listeners
  private setupActivityListeners(role: 'admin' | 'user') {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => this.resetInactivityTimer(role), { passive: true });
    });
  }

  // Logout user
  private logout(role: 'admin' | 'user', message: string) {
    this.clearTimers();
    
    if (role === 'admin') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminToken_time');
      // redirect to new admin login route under /admin/login
      window.location.href = `/admin/login?expired=true&message=${encodeURIComponent(message)}`;
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_time');
      window.location.href = `/user-login?expired=true&message=${encodeURIComponent(message)}`;
    }
  }

  // Clear all timers
  private clearTimers() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
      this.tokenExpiryTimer = null;
    }
  }

  // Store token with timestamp
  storeToken(role: 'admin' | 'user', token: string) {
    const tokenKey = role === 'admin' ? 'adminToken' : 'token';
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(`${tokenKey}_time`, Date.now().toString());
  }

  // Check if token is valid
  isTokenValid(role: 'admin' | 'user'): boolean {
    const tokenKey = role === 'admin' ? 'adminToken' : 'token';
    const token = localStorage.getItem(tokenKey);
    const tokenTime = localStorage.getItem(`${tokenKey}_time`);
    
    if (!token || !tokenTime) return false;
    
    const elapsed = Date.now() - parseInt(tokenTime);
    return elapsed < TOKEN_EXPIRY;
  }

  // Destroy session
  destroy() {
    this.clearTimers();
  }
}

export const sessionManager = new SessionManager();

/**
 * Auto Error Logger - Captures and exports errors automatically
 */

class ErrorLogger {
  constructor() {
    this.errors = [];
    this.initializeErrorCapture();
    this.setupPeriodicExport();
  }

  initializeErrorCapture() {
    // Capture unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'JavaScript Error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'Unhandled Promise Rejection',
        message: event.reason?.message || event.reason,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Capture console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.logError({
        type: 'Console Error',
        message: args.join(' '),
        timestamp: new Date().toISOString()
      });
      originalConsoleError.apply(console, args);
    };

    // Capture API errors
    this.interceptFetchErrors();
  }

  interceptFetchErrors() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.logError({
            type: 'API Error',
            message: `HTTP ${response.status}: ${response.statusText}`,
            url: args[0],
            status: response.status,
            timestamp: new Date().toISOString()
          });
        }
        return response;
      } catch (error) {
        this.logError({
          type: 'Network Error',
          message: error.message,
          url: args[0],
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    };
  }

  logError(errorData) {
    this.errors.push(errorData);
    console.log('Error captured:', errorData);

    // Store in localStorage for persistence
    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('thought-web-errors', JSON.stringify(this.errors));
    } catch (e) {
      console.warn('Failed to save errors to localStorage:', e);
    }
  }

  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('thought-web-errors');
      if (stored) {
        this.errors = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load errors from localStorage:', e);
    }
  }

  setupPeriodicExport() {
    // Automatic export disabled - only manual export available
    // Auto-export errors every 5 minutes - DISABLED
    // setInterval(() => {
    //   if (this.errors.length > 0) {
    //     this.exportErrors();
    //   }
    // }, 5 * 60 * 1000);

    // Export on page unload - DISABLED
    // window.addEventListener('beforeunload', () => {
    //   if (this.errors.length > 0) {
    //     this.exportErrors();
    //   }
    // });
  }

  exportErrors() {
    if (this.errors.length === 0) return;

    const timestamp = new Date().toISOString().split('T')[0];
    const errorsByType = this.categorizeErrors();

    // Create export data
    const exportData = {
      timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
      total_errors: this.errors.length,
      categories: errorsByType,
      raw_errors: this.errors
    };

    // Download as JSON file
    this.downloadAsFile(
      `thought-web-errors-${timestamp}.json`,
      JSON.stringify(exportData, null, 2)
    );

    // Also save to project folder via API if backend is available
    this.saveToProjectFolder(exportData, timestamp);

    // Clear exported errors
    this.clearErrors();
  }

  async saveToProjectFolder() {
    // Backend save disabled to prevent 404 errors
    console.log('Project folder saving disabled - manual export only');
    return;
  }

  categorizeErrors() {
    const categories = {
      build_errors: [],
      runtime_errors: [],
      api_errors: [],
      network_errors: [],
      other_errors: []
    };

    this.errors.forEach(error => {
      switch (error.type) {
        case 'JavaScript Error':
        case 'Console Error':
          categories.runtime_errors.push(error);
          break;
        case 'API Error':
          categories.api_errors.push(error);
          break;
        case 'Network Error':
          categories.network_errors.push(error);
          break;
        case 'Unhandled Promise Rejection':
          if (error.message?.includes('fetch') || error.message?.includes('network')) {
            categories.network_errors.push(error);
          } else {
            categories.runtime_errors.push(error);
          }
          break;
        default:
          categories.other_errors.push(error);
      }
    });

    return categories;
  }

  downloadAsFile(filename, content) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  getSessionId() {
    if (typeof sessionStorage === 'undefined') {
      // Node.js/test environment fallback
      return 'test-session-' + Date.now().toString(36);
    }
    let sessionId = sessionStorage.getItem('thought-web-session-id');
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      sessionStorage.setItem('thought-web-session-id', sessionId);
    }
    return sessionId;
  }

  clearErrors() {
    this.errors = [];
    localStorage.removeItem('thought-web-errors');
  }

  // Manual export method
  manualExport() {
    this.exportErrors();
  }

  // Get current error count
  getErrorCount() {
    return this.errors.length;
  }

  // Get errors by type
  getErrorsByType(type) {
    return this.errors.filter(error => error.type === type);
  }
}

// Initialize the error logger
const errorLogger = new ErrorLogger();
errorLogger.loadFromLocalStorage();

export default errorLogger;
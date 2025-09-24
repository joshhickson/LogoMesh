interface ErrorData {
  type: string;
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  timestamp: string;
  url?: any;
  status?: number;
  reason?: any;
}

class ErrorLogger {
  private errors: ErrorData[] = [];

  constructor() {
    this.initializeErrorCapture();
    this.setupPeriodicExport();
  }

  initializeErrorCapture(): void {
    window.addEventListener('error', (event: ErrorEvent) => {
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

    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      this.logError({
        type: 'Unhandled Promise Rejection',
        message: event.reason?.message || event.reason,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
    });

    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      this.logError({
        type: 'Console Error',
        message: args.join(' '),
        timestamp: new Date().toISOString()
      });
      originalConsoleError.apply(console, args);
    };

    this.interceptFetchErrors();
  }

  interceptFetchErrors(): void {
    const originalFetch = window.fetch;
    window.fetch = (async (...args: [RequestInfo, RequestInit?]) => {
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
      } catch (error: any) {
        this.logError({
          type: 'Network Error',
          message: error.message,
          url: args[0],
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    }) as any;
  }

  logError(errorData: ErrorData): void {
    this.errors.push(errorData);
    console.log('Error captured:', errorData);
    this.saveToLocalStorage();
  }

  saveToLocalStorage(): void {
    try {
      localStorage.setItem('thought-web-errors', JSON.stringify(this.errors));
    } catch (e) {
      console.warn('Failed to save errors to localStorage:', e);
    }
  }

  loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('thought-web-errors');
      if (stored) {
        this.errors = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load errors from localStorage:', e);
    }
  }

  setupPeriodicExport(): void {
    // Automatic export is disabled
  }

  exportErrors(): void {
    if (this.errors.length === 0) return;

    const timestamp = new Date().toISOString().split('T')[0];
    const errorsByType = this.categorizeErrors();

    const exportData = {
      timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
      total_errors: this.errors.length,
      categories: errorsByType,
      raw_errors: this.errors
    };

    this.downloadAsFile(
      `thought-web-errors-${timestamp}.json`,
      JSON.stringify(exportData, null, 2)
    );

    this.saveToProjectFolder();
    this.clearErrors();
  }

  async saveToProjectFolder(): Promise<void> {
    console.log('Project folder saving disabled - manual export only');
  }

  categorizeErrors() {
    const categories: Record<string, ErrorData[]> = {
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

  downloadAsFile(filename: string, content: string): void {
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

  getSessionId(): string {
    if (typeof sessionStorage === 'undefined') {
      return 'test-session-' + Date.now().toString(36);
    }
    let sessionId = sessionStorage.getItem('thought-web-session-id');
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      sessionStorage.setItem('thought-web-session-id', sessionId);
    }
    return sessionId;
  }

  clearErrors(): void {
    this.errors = [];
    localStorage.removeItem('thought-web-errors');
  }

  manualExport(): void {
    this.exportErrors();
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  getErrorsByType(type: string): ErrorData[] {
    return this.errors.filter(error => error.type === type);
  }
}

// Initialize the error logger
const errorLogger = new ErrorLogger();
errorLogger.loadFromLocalStorage();

export default errorLogger;
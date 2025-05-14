/**
 * Core logging utility for LogoMesh
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private prefix = '[LOGOMESH-CORE]';

  private formatMessage(
    level: LogLevel,
    message: string,
    ...args: any[]
  ): string {
    const timestamp = new Date().toISOString();
    return `${this.prefix} [${level.toUpperCase()}] [${timestamp}] ${message}`;
  }

  public debug(message: string, ...args: any[]): void {
    console.debug(this.formatMessage('debug', message), ...args);
  }

  public log(message: string, ...args: any[]): void {
    console.log(this.formatMessage('info', message), ...args);
  }

  public warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage('warn', message), ...args);
  }

  public error(message: string, ...args: any[]): void {
    console.error(this.formatMessage('error', message), ...args);
  }
}

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  debug: (...args: unknown[]) => {
    console.debug('[DEBUG]', ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },
  trace: (...args: unknown[]) => {
    console.trace('[TRACE]', ...args);
  }
};
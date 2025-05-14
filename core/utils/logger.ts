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

export interface Logger {
  info(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  trace(message: string, ...args: unknown[]): void;
}

export const logger: Logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log('[INFO]', message, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    console.debug('[DEBUG]', message, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn('[WARN]', message, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error('[ERROR]', message, ...args);
  },
  trace: (message: string, ...args: unknown[]) => {
    console.trace('[TRACE]', message, ...args);
  }
};
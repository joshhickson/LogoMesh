
/**
 * Core logging utility for LogoMesh
 */

export interface Logger {
  log: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

const LOG_PREFIX = '[LOGOMESH-CORE]';

export const logger: Logger = {
  log: (message: string, ...args: any[]): void => {
    console.log(`${LOG_PREFIX} [LOG]`, message, ...args);
  },
  warn: (message: string, ...args: any[]): void => {
    console.warn(`${LOG_PREFIX} [WARN]`, message, ...args);
  },
  error: (message: string, ...args: any[]): void => {
    console.error(`${LOG_PREFIX} [ERROR]`, message, ...args);
  },
  debug: (message: string, ...args: any[]): void => {
    console.debug(`${LOG_PREFIX} [DEBUG]`, message, ...args);
  },
};

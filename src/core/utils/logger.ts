export interface Logger {
  log: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

const LOG_PREFIX = '[LOGOMESH-CORE]';

export const logger = {
  info: (message: string, ...args: any[]) => console.log(`[LOGOMESH-CORE] [INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[LOGOMESH-CORE] [WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[LOGOMESH-CORE] [ERROR] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.log(`[LOGOMESH-CORE] [DEBUG] ${message}`, ...args),
  log: (message: string, ...args: any[]) => console.log(`[LOGOMESH-CORE] [LOG] ${message}`, ...args)
};
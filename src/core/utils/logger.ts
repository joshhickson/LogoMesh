export interface Logger {
  // TODO: Replace 'any' with a more specific type if possible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log: (message: string, ...args: any[]) => void;
  // TODO: Replace 'any' with a more specific type if possible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (message: string, ...args: any[]) => void;
  // TODO: Replace 'any' with a more specific type if possible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (message: string, ...args: any[]) => void;
  // TODO: Replace 'any' with a more specific type if possible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: (message: string, ...args: any[]) => void;
}

// TODO: This variable was flagged as unused by ESLint.
// const LOG_PREFIX = '[LOGOMESH-CORE]';

export const logger = {
  // TODO: Replace 'any' with a more specific type if possible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (message: string, ...args: any[]) => console.log(`[LOGOMESH-CORE] [INFO] ${message}`, ...args),
  // TODO: Replace 'any' with a more specific type if possible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (message: string, ...args: any[]) => console.warn(`[LOGOMESH-CORE] [WARN] ${message}`, ...args),
  // TODO: Replace 'any' with a more specific type if possible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (message: string, ...args: any[]) => console.error(`[LOGOMESH-CORE] [ERROR] ${message}`, ...args),
  // TODO: Replace 'any' with a more specific type if possible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: (message: string, ...args: any[]) => console.log(`[LOGOMESH-CORE] [DEBUG] ${message}`, ...args),
  // TODO: Replace 'any' with a more specific type if possible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log: (message: string, ...args: any[]) => console.log(`[LOGOMESH-CORE] [LOG] ${message}`, ...args)
};
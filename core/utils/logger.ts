// Placeholder logger
// TODO: Implement a real logger solution

export interface Logger { // Added export
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (...args: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (...args: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (...args: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: (...args: any[]) => void;
}

export const logger: Logger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  debug: (...args) => console.debug('[DEBUG]', ...args),
};

export default logger;

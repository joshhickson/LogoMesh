"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// TODO: This variable was flagged as unused by ESLint.
// const LOG_PREFIX = '[LOGOMESH-CORE]';
exports.logger = {
    // TODO: Replace 'any' with a more specific type if possible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: (message, ...args) => console.log(`[LOGOMESH-CORE] [INFO] ${message}`, ...args),
    // TODO: Replace 'any' with a more specific type if possible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warn: (message, ...args) => console.warn(`[LOGOMESH-CORE] [WARN] ${message}`, ...args),
    // TODO: Replace 'any' with a more specific type if possible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (message, ...args) => console.error(`[LOGOMESH-CORE] [ERROR] ${message}`, ...args),
    // TODO: Replace 'any' with a more specific type if possible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debug: (message, ...args) => console.log(`[LOGOMESH-CORE] [DEBUG] ${message}`, ...args),
    // TODO: Replace 'any' with a more specific type if possible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log: (message, ...args) => console.log(`[LOGOMESH-CORE] [LOG] ${message}`, ...args)
};
//# sourceMappingURL=logger.js.map
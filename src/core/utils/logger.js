"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const LOG_PREFIX = '[LOGOMESH-CORE]';
exports.logger = {
    info: (message, ...args) => console.log(`[LOGOMESH-CORE] [INFO] ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[LOGOMESH-CORE] [WARN] ${message}`, ...args),
    error: (message, ...args) => console.error(`[LOGOMESH-CORE] [ERROR] ${message}`, ...args),
    debug: (message, ...args) => console.log(`[LOGOMESH-CORE] [DEBUG] ${message}`, ...args),
    log: (message, ...args) => console.log(`[LOGOMESH-CORE] [LOG] ${message}`, ...args)
};
//# sourceMappingURL=logger.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// For now, let's create a simplified version that doesn't depend on core modules
const logger = {
    info: (...args) => console.log('[INFO]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
    debug: (...args) => console.debug('[DEBUG]', ...args),
};
const thoughtRoutes_1 = __importDefault(require("./routes/thoughtRoutes"));
const llmRoutes_1 = __importDefault(require("./routes/llmRoutes"));
const orchestratorRoutes_1 = __importDefault(require("./routes/orchestratorRoutes"));
const portabilityRoutes_1 = __importDefault(require("./routes/portabilityRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const taskRoutes_1 = __importStar(require("./routes/taskRoutes"));
const eventBus_1 = require("../../core/services/eventBus");
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "5000", 10); // Ensure PORT is a number
const apiBasePath = '/api/v1'; // Define the base path
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Core Services Setup (simplified for now)
async function setupServices() {
    // For now, just setup basic services
    logger.info('Basic services initialized successfully');
    return {};
}
// Initialize TaskEngine with EventBus
const eventBus = new eventBus_1.EventBus();
(0, taskRoutes_1.initializeTaskEngine)(eventBus);
// Mount routes
app.use('/api/v1/thoughts', thoughtRoutes_1.default);
app.use('/api/v1/llm', llmRoutes_1.default);
app.use('/api/v1/admin', adminRoutes_1.default);
app.use('/api/v1/portability', portabilityRoutes_1.default);
app.use('/api/v1/orchestrator', orchestratorRoutes_1.default);
app.use('/api/v1/tasks', taskRoutes_1.default);
// Health check
app.get(`${apiBasePath}/health`, (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '0.1.0'
    });
});
async function startServer() {
    try {
        // Setup core services
        await setupServices();
        app.listen(PORT, '0.0.0.0', () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`Health check available at http://localhost:${PORT}${apiBasePath}/health`);
            logger.info(`API base URL: http://localhost:${PORT}${apiBasePath}`);
        });
    }
    catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map
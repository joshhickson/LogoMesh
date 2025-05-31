"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
Refactoring;
the;
server;
setup;
to;
include;
core;
services, portability;
routes, and;
enhanced;
health;
checks.
 `` `
` ``;
replit_final_file;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const initDb_1 = require("../../core/db/initDb");
const logger_1 = require("../../src/core/utils/logger");
const sqliteAdapter_1 = require("../../core/storage/sqliteAdapter");
const IdeaManager_1 = require("../../src/core/IdeaManager");
const portabilityService_1 = require("../../core/services/portabilityService");
const LLMTaskRunner_1 = require("../../core/llm/LLMTaskRunner");
const OllamaExecutor_1 = require("../../core/llm/OllamaExecutor");
const thoughtRoutes_1 = __importDefault(require("./routes/thoughtRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const llmRoutes_1 = __importDefault(require("./routes/llmRoutes"));
const portabilityRoutes_1 = __importDefault(require("./routes/portabilityRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Core Services Setup
async function setupServices() {
    // Database path
    const dbPath = process.env.DB_PATH || path_1.default.resolve(__dirname, '../../data/logomesh.sqlite3');
    logger_1.logger.info(`Using database path: ${dbPath}`);
    // Initialize storage adapter
    const storageAdapter = new sqliteAdapter_1.SQLiteStorageAdapter(dbPath);
    // Initialize core services
    const ideaManager = new IdeaManager_1.IdeaManager(storageAdapter);
    const portabilityService = new portabilityService_1.PortabilityService(storageAdapter);
    const llmExecutor = new OllamaExecutor_1.OllamaExecutor();
    const llmTaskRunner = new LLMTaskRunner_1.LLMTaskRunner(llmExecutor);
    // Make services available to routes via app.locals
    app.locals.ideaManager = ideaManager;
    app.locals.portabilityService = portabilityService;
    app.locals.llmTaskRunner = llmTaskRunner;
    app.locals.storageAdapter = storageAdapter;
    logger_1.logger.info('Core services initialized successfully');
    return { ideaManager, portabilityService, llmTaskRunner, storageAdapter };
}
// Routes
app.use('/api/v1/thoughts', thoughtRoutes_1.default);
app.use('/api/v1/admin', adminRoutes_1.default);
app.use('/api/v1/llm', llmRoutes_1.default);
app.use('/api/v1/export', portabilityRoutes_1.default);
app.use('/api/v1/import', portabilityRoutes_1.default);
// Health check
app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            database: !!app.locals.storageAdapter,
            ideaManager: !!app.locals.ideaManager,
            llmTaskRunner: !!app.locals.llmTaskRunner
        }
    });
});
async function startServer() {
    try {
        // Initialize database first
        await (0, initDb_1.initializeDatabase)();
        logger_1.logger.info('Database initialized successfully');
        // Setup core services
        await setupServices();
        app.listen(PORT, '0.0.0.0', () => {
            logger_1.logger.info(`Server running on port ${PORT}`);
            logger_1.logger.info(`Health check available at http://localhost:${PORT}/api/v1/health`);
            logger_1.logger.info(`API base URL: http://localhost:${PORT}/api/v1`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
`;
//# sourceMappingURL=index.js.map
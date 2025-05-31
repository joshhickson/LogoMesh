"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const initDb_1 = require("../../core/db/initDb");
const sqliteAdapter_1 = require("../../core/storage/sqliteAdapter");
const IdeaManager_1 = require("../../src/core/IdeaManager");
const logger_1 = require("../../src/core/utils/logger");
const llmRoutes_1 = __importDefault(require("./routes/llmRoutes"));
const thoughtRoutes_1 = __importDefault(require("./routes/thoughtRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize core services
const dbPath = process.env.DB_PATH || './server/data/logomesh.sqlite3';
// Initialize database and services
async function initializeServer() {
    try {
        await (0, initDb_1.initializeDatabase)();
        logger_1.logger.info('Database initialized successfully');
        const sqliteAdapter = new sqliteAdapter_1.SQLiteStorageAdapter(dbPath);
        await sqliteAdapter.initialize();
        logger_1.logger.info('Storage adapter initialized');
        const ideaManager = new IdeaManager_1.IdeaManager(sqliteAdapter);
        return { ideaManager, sqliteAdapter };
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize server:', error);
        process.exit(1);
    }
}
// Initialize services (will be awaited before starting server)
const services = initializeServer();
// Routes
app.use('/api/v1/llm', llmRoutes_1.default);
app.use('/api/v1/thoughts', thoughtRoutes_1.default);
app.use('/api/v1/admin', adminRoutes_1.default);
app.get('/', (req, res) => {
    res.json({ message: 'ThoughtWeb API Server', version: '1.0.0' });
});
// Health check endpoint
app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
// Start server after initialization
services.then(({ ideaManager }) => {
    // Make services available to routes
    app.locals.ideaManager = ideaManager;
    app.locals.logger = logger_1.logger;
    app.listen(PORT, '0.0.0.0', () => {
        logger_1.logger.info(`ThoughtWeb API Server running on 0.0.0.0:${PORT}`);
        logger_1.logger.info(`Database path: ${dbPath}`);
        logger_1.logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger_1.logger.info(`Plugin directory: ${process.env.PLUGIN_DIR || 'N/A'}`);
        logger_1.logger.info(`Health check: http://0.0.0.0:${PORT}/api/v1/health`);
    });
}).catch(error => {
    logger_1.logger.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map
import express from 'express';
import cors from 'cors';
import { initializeDatabase } from '../../core/db/initDb';
import { SQLiteStorageAdapter } from '../../core/storage/sqliteAdapter';
import { IdeaManager } from '../../src/core/IdeaManager';
import { logger } from '../../src/core/utils/logger';
import llmRoutes from './routes/llmRoutes';
import thoughtRoutes from './routes/thoughtRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase().catch(console.error);

// Instantiate core services
const dbPath = process.env.DB_PATH || './data/logomesh.sqlite3';
const sqliteAdapter = new SQLiteStorageAdapter(dbPath);
const ideaManager = new IdeaManager(sqliteAdapter);

// Make services available to routes
app.locals.ideaManager = ideaManager;
app.locals.logger = logger;

// Routes
app.use('/api/v1/llm', llmRoutes);
app.use('/api/v1/thoughts', thoughtRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'ThoughtWeb API Server', version: '1.0.0' });
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
});
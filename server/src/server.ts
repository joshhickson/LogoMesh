import app, { startServer } from './index';
import { logger } from '../../core/utils/logger';
import config from '../../core/config';

const PORT = config.server.port;
const apiBasePath = config.server.apiBasePath;

startServer().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Health check available at http://localhost:${PORT}${apiBasePath}/health`);
    logger.info(`API base URL: http://localhost:${PORT}${apiBasePath}`);
  });
}).catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
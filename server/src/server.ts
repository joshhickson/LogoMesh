import app from './index';
import { logger } from '../../core/utils/logger';
import config from '../../core/config';

const PORT = config.server.port;
const apiBasePath = config.server.apiBasePath;

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}${apiBasePath}/health`);
  logger.info(`API base URL: http://localhost:${PORT}${apiBasePath}`);
});
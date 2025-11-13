import IORedis from 'ioredis';

let connection: IORedis | null = null;

/**
 * Creates and returns a singleton, ready-to-use IORedis connection.
 * This function is asynchronous and will only resolve once the client
 * has successfully connected to the Redis server and emitted the 'ready' event.
 * This prevents the race condition that was causing EPIPE errors on startup.
 */
export const getRedisConnection = (): Promise<IORedis> => {
  if (connection && connection.status === 'ready') {
    return Promise.resolve(connection);
  }

  return new Promise((resolve, reject) => {
    const newConnection = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        // A little jitter is added to the delay to avoid a thundering herd problem.
        const delay = Math.min(times * 50, 2000) + Math.random() * 100;
        if (times > 10) { // Approx 30 seconds
            return null; // Stop retrying
        }
        return delay;
      },
    });

    newConnection.on('ready', () => {
      console.log('[Redis] Connection is ready.');
      connection = newConnection;
      resolve(connection);
    });

    newConnection.on('error', (err) => {
      console.error('[Redis] Connection error:', err);
      // If we haven't connected yet, reject the promise.
      if (!connection) {
        reject(err);
      }
    });
  });
};

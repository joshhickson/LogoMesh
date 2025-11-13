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
    // Use lazyConnect so ioredis will not attempt network I/O until we call connect().
    // Disable the offline queue so commands attempted before connection will fail fast
    // instead of being buffered and risking EPIPE on write attempts.
    const newConnection = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      maxRetriesPerRequest: null,
      lazyConnect: true,
      enableOfflineQueue: false,
      // keep a conservative retry strategy for reconnect attempts
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000) + Math.random() * 100;
        if (times > 20) { // ~1 minute
          return null;
        }
        return delay;
      },
    });

    const onReady = () => {
      console.log('[Redis] Connection is ready.');
      connection = newConnection;
      cleanupListeners();
      resolve(connection);
    };

    const onError = (err: any) => {
      console.error('[Redis] Connection error:', err);
      // If we haven't connected yet, reject so callers can surface the failure.
      cleanupListeners();
      if (!connection) {
        reject(err);
      }
    };

    const cleanupListeners = () => {
      newConnection.off('ready', onReady);
      newConnection.off('error', onError);
    };

    newConnection.once('ready', onReady);
    newConnection.once('error', onError);

    // Explicitly start the connection attempt. This avoids implicit writes
    // or queued commands from occurring during the TCP handshake.
    newConnection.connect().catch((err) => {
      // connect() may fail quickly if the server isn't reachable yet.
      // Let the 'error' handler handle rejection semantics.
      // Log here for extra visibility.
      console.error('[Redis] connect() failed:', err);
    });
  });
};

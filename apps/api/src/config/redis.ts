import Redis from 'ioredis';
import env from './env';

let redis: Redis | null = null;

// Проверяем наличие REDIS_URL и пытаемся подключиться
if (env.REDIS_URL) {
  try {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay > 10000 ? null : delay; // Прекращаем попытки после 10 секунд
      },
      lazyConnect: false, // Подключаемся сразу
      enableReadyCheck: true,
      enableOfflineQueue: false, // Не ставим команды в очередь при отключении
    });

    redis.on('error', (err) => {
      console.error('❌ Redis Client Error:', err.message);
    });

    redis.on('connect', () => {
      console.log('🔄 Redis connecting...');
    });

    redis.on('ready', () => {
      console.log('✅ Redis connected and ready');
    });

    redis.on('close', () => {
      console.log('⚠️ Redis connection closed');
    });

    redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
    redis = null;
  }
} else {
  console.log('ℹ️ Redis URL not provided, Redis is disabled');
}

export default redis;


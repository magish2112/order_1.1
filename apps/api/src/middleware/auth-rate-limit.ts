/**
 * Строгий rate limit для auth endpoints (login, refresh).
 * Защита от brute-force: 10 попыток в минуту на IP.
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import redis from '../config/redis';

const AUTH_RATE_LIMIT = 10;
const WINDOW_SEC = 60;

// In-memory fallback когда Redis недоступен: Map<ip, { count, resetAt }>
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: FastifyRequest): string {
  const xff = request.headers['x-forwarded-for'];
  if (typeof xff === 'string') {
    return xff.split(',')[0].trim();
  }
  return request.ip || 'unknown';
}

export async function authRateLimit(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const ip = getClientIp(request);
  const key = `auth_rate:${ip}`;

  if (redis) {
    const count = await redis.incr(key);
    const ttl = await redis.ttl(key);
    if (ttl < 0) await redis.expire(key, WINDOW_SEC);
    if (count > AUTH_RATE_LIMIT) {
      request.log.warn({ ip, count, key }, 'Auth rate limit exceeded');
      return reply.status(429).send({
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Слишком много попыток входа. Попробуйте через минуту.',
      });
    }
    return;
  }

  // In-memory
  const now = Date.now();
  const win = memoryStore.get(ip);
  if (!win) {
    memoryStore.set(ip, { count: 1, resetAt: now + WINDOW_SEC * 1000 });
    return;
  }
  if (now >= win.resetAt) {
    memoryStore.set(ip, { count: 1, resetAt: now + WINDOW_SEC * 1000 });
    return;
  }
  win.count += 1;
  if (win.count > AUTH_RATE_LIMIT) {
    request.log.warn({ ip, count: win.count }, 'Auth rate limit exceeded (memory)');
    return reply.status(429).send({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Слишком много попыток входа. Попробуйте через минуту.',
    });
  }
}

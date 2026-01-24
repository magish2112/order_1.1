/**
 * Структурированное логирование для аудита действий пользователей.
 */
import { FastifyRequest } from 'fastify';

type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'approve'
  | 'assign'
  | 'login'
  | 'logout'
  | 'status';

type AuditResource =
  | 'article'
  | 'project'
  | 'service'
  | 'category'
  | 'request'
  | 'user'
  | 'review'
  | 'vacancy'
  | 'faq'
  | 'employee'
  | 'media'
  | 'settings'
  | 'calculator'
  | 'auth';

export function auditLog(
  request: FastifyRequest,
  action: AuditAction,
  resource: AuditResource,
  resourceId?: string,
  meta?: Record<string, unknown>
): void {
  const userId = (request as FastifyRequest & { user?: { id: string; email?: string; role?: string } }).user?.id;
  const email = (request as FastifyRequest & { user?: { id: string; email?: string; role?: string } }).user?.email;
  const ip =
    (typeof (request.headers['x-forwarded-for']) === 'string'
      ? request.headers['x-forwarded-for'].split(',')[0].trim()
      : null) || request.ip || 'unknown';

  request.log.info(
    {
      audit: true,
      action,
      resource,
      resourceId,
      userId: userId ?? null,
      email: email ?? null,
      ip,
      ...meta,
    },
    `[AUDIT] ${action} ${resource}${resourceId ? ` ${resourceId}` : ''}`
  );
}

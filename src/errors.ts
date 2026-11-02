import type { FastifyReply } from 'fastify';

/** Common error shape (org/knowledge/conventions.md): { code, message, details }. */
export function sendError(reply: FastifyReply, status: number, code: string, message: string, details: Record<string, unknown> = {}) {
  return reply.status(status).send({ code, message, details });
}

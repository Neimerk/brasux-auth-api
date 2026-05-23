import type { FastifyReply, FastifyRequest } from "fastify";

import { AppError } from "../errors/app-error";

export function scopeMiddleware(requiredScope: string) {
  return async function (
    request: FastifyRequest,
    _reply: FastifyReply
  ) {
    if (!request.user) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    const scopes = request.user.scope?.split(" ") ?? [];

    const hasScope = scopes.includes(requiredScope);

    if (!hasScope) {
      throw new AppError("Permissão insuficiente.", 403);
    }
  };
}
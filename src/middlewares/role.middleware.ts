import type { FastifyReply, FastifyRequest } from "fastify";

type Role = "USER" | "ADMIN";

export function roleMiddleware(requiredRole: Role) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send({
        message: "Usuário não autenticado.",
      });
    }

    if (request.user.role !== requiredRole) {
      return reply.status(403).send({
        message: "Acesso negado. Permissão insuficiente.",
      });
    }
  };
}